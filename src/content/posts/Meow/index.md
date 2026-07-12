---
title: "Meow"
published: 2026-05-21
updated: 2026-05-21
draft: false
description: "通过 Telnet 服务的默认弱凭证漏洞获取系统最高权限。"
image: ""
tags:
  - 渗透测试
category: 网络安全
pinned: false
comment: true
author: Ziddzide
---

# Meow - Telnet 攻击

## 目标
通过 Telnet 服务的默认弱凭证漏洞获取系统最高权限。

## 原理

### 1. Telnet 服务特性

Telnet 是一个古老且不安全的协议，存在以下风险：

- **明文传输**：所有通信（包括用户名和密码）均未加密，可被中间人窃听
- **默认弱凭证**：常允许使用 `root`/空密码登录，等同于无身份验证
- **23 端口**：标准 Telnet 端口

### 2. Nmap 扫描与防火墙的差异

Nmap 的某些扫描类型（如 SYN 扫描 `-sS`）可能被防火墙识别并拦截，显示为 `filtered`。而 Telnet 客户端发起完整 TCP 连接握手，有时能通过简单过滤规则。

### 3. 攻击核心

极其常见的真实世界漏洞——在互联网上暴露使用默认凭证的未加密服务。攻击者无需复杂漏洞利用，直接连接即可获得系统最高权限（root）。

---

## 演示

目标 IP：`10.129.206.213`

### 1. nmap 扫描

使用 nmap 扫描主机端口：

![](https://ziddzide-pirture-1406647554.cos.ap-beijing.myqcloud.com/post/Meow/meow1.png)

> 发现防火墙阻止了对 23 端口的探测

### 2. telnet 连接测试

直接使用 telnet 连接 23 端口测试：

![](https://ziddzide-pirture-1406647554.cos.ap-beijing.myqcloud.com/post/Meow/meow2.png)

### 3. 获取 flag

直接使用 `root` 弱口令登录成功，进入目录查找 flag：

![](https://ziddzide-pirture-1406647554.cos.ap-beijing.myqcloud.com/post/Meow/meow3.png)

成功拿到 flag。

---

## 总结

**23端口-telnet服务**

- **扫描结果与实际连接的差异**：Nmap的某些扫描类型可能被防火墙或入侵检测系统识别并拦截，导致显示为 filtered。而普通的 telnet客户端发起完整TCP连接握手，有时能通过简单过滤规则。

- **Telnet服务本身极不安全**：
  - **默认弱凭证**：允许使用 root和空密码登录，等同于没有身份验证
  - **明文传输**：所有通信均未加密，可被中间人窃听
  - **老旧协议**：现代环境中应被SSH完全取代

关卡核心：暴露使用默认凭证的未加密服务，直接连接即可获得系统最高权限。
