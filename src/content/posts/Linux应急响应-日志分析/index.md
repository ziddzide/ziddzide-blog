---
title: "Linux应急响应-日志分析"
published: 2026-06-03
updated: 2026-06-03
draft: false
description: "首先查找/var/log/auth.log"
image: ""
tags:
  - 日志分析
category: 网络安全
pinned: false
comment: true
author: Ziddzide
---

# 1.有多少IP在爆破主机ssh的root帐号
首先查找`/var/log/auth.log`
![](https://ziddzide-pirture-1406647554.cos.ap-beijing.myqcloud.com/post/%E7%8E%84%E6%9C%BA/Linux-One/linuxrz.png)
观察到IP地址`106.47.xxx.xxx`尝试登录ssh并且成功,但是用户名显示是kali,这个很明显是我自己的攻击主机,日志只有这些内容,我们怀疑攻击者删除了日志记录遮盖自己的攻击行径,于是我们查看备用文件`/var/log/auth.log.1`

但是这一次输出的内容实在过多,看来这就是全部的日志文件,于是我们使用命令筛选出我们想要得到的记录
```sh
cat /var/log/auth.log.1 | grep -a "Failed password for root" | sort | uniq -c | sort -nr | more
```

得到结果:
![](https://ziddzide-pirture-1406647554.cos.ap-beijing.myqcloud.com/post/%E7%8E%84%E6%9C%BA/Linux-One/linuxrz1.png)

提交`flag`即可

# 2.ssh爆破成功登陆的IP是多少

我们需要使用`grep`重新筛选数据,修改一下上条命令就行
```sh
cat /var/log/auth.log.1 | grep -a "Accept" | sort
```

得到:
![](https://ziddzide-pirture-1406647554.cos.ap-beijing.myqcloud.com/post/%E7%8E%84%E6%9C%BA/Linux-One/linuxrz2.png)

于是得到成功登录的IP地址:`192.168.200.2`

# 3.爆破用户名字典是什么

需要提取登录失败的用户名称,所以使用`$awk`做一下筛选
```sh
cat /var/log/auth.log.1 | grep -a "Failed password for" | sort | more
```


得到:
![](https://ziddzide-pirture-1406647554.cos.ap-beijing.myqcloud.com/post/%E7%8E%84%E6%9C%BA/Linux-One/linuxrz3.png)

于是尝试的用户有`hello,test1/2/3,user,root`

# 4.成功登录 root 用户的 ip 一共爆破了多少次

我们之前在第二问得到结果`192.168.200.2`,继续看上面得到爆破`root`用户只有4次失败,则`4`

# 5.黑客登陆主机后新建了一个后门用户，用户名是多少

`192.168.200.2`最后一次爆破信息在;
```
Aug  1 07:47:39 linux-rz sshd[7534]: Failed password for invalid user  from 192.168.200.2 port 45807 ssh2
```

我们得到了时间:
```
Aug  1 07:47:39
```

同时使用命令查询:
```sh
cat /var/log/auth.log.1 | grep -a "new user"
```

得到:
![](https://ziddzide-pirture-1406647554.cos.ap-beijing.myqcloud.com/post/%E7%8E%84%E6%9C%BA/Linux-One/linuxrz4.png)

其中test2用户创建日期为:
```
Aug  1 07:50:45
```

和最近的爆破时间相对应,那么用户名得到了

# 常见命令

### 查看IP SSH爆破失败次数

```sh
grep -a "Failed password" /var/log/auth.log \
| grep -oP 'from \K[\d.]+' \
| sort | uniq -c | sort -nr
```

如果是针对某一个用户名修改`grep`

### 查看攻击IP都在尝试哪些用户名

```sh
grep -a "Failed password" /var/log/auth.log \
| grep "from *" \
| grep -oP 'for( invalid user)? \K[^ ]+' \
| sort | uniq -c | sort -nr
```

```sh
cat /var/log/auth.log | grep -a "Failed password for" | sort | more
```

### 查看SSH登录成功信息

```sh
cat /var/log/auth.log | grep -a "Accept" | sort
```
