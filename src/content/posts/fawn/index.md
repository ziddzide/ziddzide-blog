---
title: "fawn"
published: 2026-05-21
updated: 2026-05-21
draft: false
description: "通过 FTP 匿名登录机制访问服务器，下载敏感文件。"
image: ""
tags:
  - 渗透测试
category: 网络安全
pinned: false
comment: true
author: Ziddzide
---

# Fawn - FTP 协议攻击

## 目标
通过 FTP 匿名登录机制访问服务器，下载敏感文件。

## 原理

### 1. FTP 协议基础

FTP（File Transfer Protocol）使用两个独立连接：

- **控制连接（命令通道）**：默认在 **21 端口**，用于发送指令和接收响应
- **数据连接（数据通道）**：端口不固定，取决于传输模式

### 2. FTP 匿名登录

**用户名：`anonymous`**

1. 命令行输入 `ftp <服务器地址>` 连接 FTP 服务器
2. 用户名输入 `anonymous`
3. 密码可输入邮箱或直接回车

**注意：**
- 能否成功取决于目标 FTP 服务器是否启用了匿名登录功能
- 访问权限通常限制在特定公共目录（如 `/pub`）下

### 3. FTP 响应代码

- **220**​ Service ready for new user
- **230** User logged in, proceed（登录成功）
- **331**​ User name okay, need password
- **530**​ Not logged in（登录失败）

### 4. FTP 常用命令

**查看目录：** `dir`（详细）、`ls`（简略）
**下载文件：** `get <文件名>`、`mget *.txt`（批量）
**传输模式：** `binary`（二进制）、`ascii`（文本）

---

## 演示

### 1. 连接 21 端口获取版本信息

首先使用 nmap 扫描，但不清楚版本号，使用 telnet 连接 21 端口查看版本号：

![](https://ziddzide-pirture-1406647554.cos.ap-beijing.myqcloud.com/post/fawn/fawn1.png)

### 2. nmap 扫描验证

使用 `nmap` 尝试扫描：
![](https://ziddzide-pirture-1406647554.cos.ap-beijing.myqcloud.com/post/fawn/fawn2.png)
### 4. FTP 连接下载文件

使用 `sudo nmap -Pn -sV -sS -O -vvv` 获取详细版本信息后，ftp 连接服务器，使用 anonymous 匿名登录:
![](https://ziddzide-pirture-1406647554.cos.ap-beijing.myqcloud.com/post/fawn/fawn3.png)

ls 查找文件，get 下载：
![](https://ziddzide-pirture-1406647554.cos.ap-beijing.myqcloud.com/post/fawn/fawn4.png)

---

## 总结

FTP 协议的 **匿名访问机制**是常见安全风险点。当发现 FTP 服务的 21 端口开放时，可以尝试匿名登录获取文件。
