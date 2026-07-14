---
title: Telnet
published: 2026-07-14
updated: 2026-07-14
draft: false
description: Telnet-明文远程登录协议
image: ""
tags:
  - 应用层协议
  - Telnet
  - TCP协议
  - Hack-The-Box
  - CVE-2026-24061
category: 网络安全
pinned: false
comment: true
author: Ziddzide
---

# Telnet

## Telnet服务特性

**Telnet** 是一个古老且不安全的协议，存在以下风险：

- **明文传输**：所有通信（包括用户名和密码）均未加密，可被中间人窃听
- **默认弱凭证**：常允许使用 `root`/空密码登录，等同于无身份验证
- **23 端口**：标准 Telnet 端口

## 核心安全漏洞

1. **明文传输**：这是其最根本的漏洞。任何在传输路径上的窃听者（例如通过[抓包工具](https://rk.51cto.com/topic/c26fab570843e0abfd3dc037431cd9.html "抓包工具")）都可以直接获取你的登录凭证和所有操作指令。
2. **缺乏数据完整性保护**：传输的数据容易被中间人篡改，而通信双方无法察觉。
3. **身份验证机制简单**：通常只依赖简单的用户名/密码，易受暴力破解等攻击。

在真实项目或老旧系统中，若发现仍在使用Telnet管理网络设备（如交换机、路由器），这本身就是一个**高危风险点**，通常是安全审计和改造的重点对象。

## 和SSH协议的区别

**SSH（Secure Shell）** 是取代Telnet的**标准答案**。它通过在传输层建立**加密隧道**，解决了Telnet的所有安全问题。

- **加密通信**：所有数据（包括密码）加密传输，防止窃听和篡改。
- **强认证机制**：支持口令和更安全的密钥对认证方式。
- **默认端口22**

## Hack The Box机器

目标 IP：`10.129.206.213`

### nmap 扫描

使用 nmap 扫描主机端口：

![](https://ziddzide-pirture-1406647554.cos.ap-beijing.myqcloud.com/post/Meow/meow1.png)

> 发现防火墙阻止了对 23 端口的探测

### telnet 连接测试

直接使用 telnet 连接 23 端口测试：

![](https://ziddzide-pirture-1406647554.cos.ap-beijing.myqcloud.com/post/Meow/meow2.png)

### 获取 flag

直接使用 `root` 弱口令登录成功，进入目录查找 flag：

![](https://ziddzide-pirture-1406647554.cos.ap-beijing.myqcloud.com/post/Meow/meow3.png)

成功拿到 flag。

## CVE-2026-24061

### 漏洞原理

GNU InetUtils 1.9.3 至 2.7 版本的 telnetd 服务器存在远程认证绕过漏洞（CVE-2026-24061）。telnetd 服务器在将 USER 环境变量提交login(1)程序未进行过滤。攻击者可以提供类似-f root的 USER 值来触发登录程序的认证绕过功能（-f参数），在此之前即可获得 root 访问权限。

该漏洞参数属于注入漏洞（CWE-88），CVSS v3.1 评分为9.8(严重)。

### docker环境搭建

```
https://github.com/vulhub/vulhub/blob/master/inetutils/CVE-2026-24061/docker-compose.yml
```

具体搭建细节请查看:

```
https://www.freebuf.com/articles/vuls/471308.html
```

### 具体利用

> 按照kali Linux举例

```
USER="-f root" telnet -a 192.168.1.3 2323
```

