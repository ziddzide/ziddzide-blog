---
title: "Linux Fundamentals-上"
published: 2026-05-24
updated: 2026-05-24
draft: false
description: "ssh连接目标服务器"
image: ""
tags:
  - Linux基础
category: 网络安全
pinned: false
comment: true
author: Ziddzide
---

### Find out the machine hardware name and submit it as the answer

ssh连接目标服务器

 ![](https://ziddzide-pirture-1406647554.cos.ap-beijing.myqcloud.com/post/Linux-fundamental/Linux1.png)

> 这里ssh花了点力气,首先openVPN连接相关节点后再创建机器,ssh会成功,不然可能会出现路由不可达的情况

![](https://ziddzide-pirture-1406647554.cos.ap-beijing.myqcloud.com/post/Linux-fundamental/Linux2.png)

得到答案,`x86_64`

### What is the path to htb-student's home directory?

![](https://ziddzide-pirture-1406647554.cos.ap-beijing.myqcloud.com/post/Linux-fundamental/Linux3.png)

直接`pwd`查看当前所在目录就行

### What is the path to the htb-student's mail?

两种方法看:

1. 通常在`/var/mail/` 或 `/var/spool/mail/`

2. 或者看环境变量,`env | grep MAIL`

![](https://ziddzide-pirture-1406647554.cos.ap-beijing.myqcloud.com/post/Linux-fundamental/Linux4.png)

### Which shell is specified for the htb-student user?

```sh
/bin/bash
```

一般是这个,直接输入对了

### Which kernel release is installed on the system? (Format: 1.22.3)

直接`uname -r`

![](https://ziddzide-pirture-1406647554.cos.ap-beijing.myqcloud.com/post/Linux-fundamental/Linux6.png)

### What is the name of the network interface that MTU is set to 1500?

1500是ip包传统大小,字节单位,和`PMTUD 黑洞`相关,直接`ip a`
![](https://ziddzide-pirture-1406647554.cos.ap-beijing.myqcloud.com/post/Linux-fundamental/Linux7.png)

其实也不用仔细看,就两张网卡,不会是lo回环,是另一个

### What is the name of the hidden "history" file in the htb-user's home directory

那就再当前目录下`ls -la`查看就行

![](https://ziddzide-pirture-1406647554.cos.ap-beijing.myqcloud.com/post/Linux-fundamental/Linux8.png)

### What is the index number of the "sudoers" file in the "/etc" directory

![](https://ziddzide-pirture-1406647554.cos.ap-beijing.myqcloud.com/post/Linux-fundamental/Linux9.png)

### What is the name of the last modified file in the "/var/backups" directory

![](https://ziddzide-pirture-1406647554.cos.ap-beijing.myqcloud.com/post/Linux-fundamental/Linux10.png)

### What is the inode number of the "shadow.bak" file in the "/var/backups" directory

![](https://ziddzide-pirture-1406647554.cos.ap-beijing.myqcloud.com/post/Linux-fundamental/Linux11.png)

### What is the name of the config file that has been created after 2020-03-03 and is smaller than 28k but larger than 25k

![](https://ziddzide-pirture-1406647554.cos.ap-beijing.myqcloud.com/post/Linux-fundamental/Linux12.png)
查找文件遇到了权限问题想提权,但是这个用户没有sudo权限

我想当然了直接在`/etc`目录下寻找,但是出来的文件不止一个而且后缀不对,所以`find`命令还是要在`/`下运行

![](https://ziddzide-pirture-1406647554.cos.ap-beijing.myqcloud.com/post/Linux-fundamental/Linux13.png)

有很多文件我们都没有权限,所以需要把报错直接丢了不然刷屏
``` sh
find / -type f -name *.conf -newermt "2020-03-03" -size +25k -size -28k 2>/dev/null
```

### How many files exist on the system that have the ".bak" extension

![](https://ziddzide-pirture-1406647554.cos.ap-beijing.myqcloud.com/post/Linux-fundamental/Linux14.png)
上一问修改一下就行

### Submit the full path of the "xxd" binary.

![](https://ziddzide-pirture-1406647554.cos.ap-beijing.myqcloud.com/post/Linux-fundamental/Linux15.png)

### How many files exist on the system that have the ".log" file extension

```sh
find / -type f -name *.log 2>/dev/null | wc -l
```

### How many total packages are installed on the target system

```sh
apt list  --installed |wc -l
```

![](https://ziddzide-pirture-1406647554.cos.ap-beijing.myqcloud.com/post/Linux-fundamental/Linux16.png)

738这答案不对啊,输了好几次也想不到为什么,我去网上查了下,这里是737
