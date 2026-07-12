---
title: "虚拟主机爆破与目录扫描"
published: 2026-06-12
updated: 2026-06-12
draft: false
description: "gobuster -h"
image: ""
tags:
  - 信息收集
category: 网络安全
pinned: false
comment: true
author: Ziddzide
---

# Gobuster & ffuf 

## 1. Gobuster

```bash
gobuster -h
gobuster dir -h
gobuster dns -h
gobuster vhost -h
```

---

# 1.1 目录爆破

## 基本使用

```bash
gobuster dir \
-u http://target.com \
-w /usr/share/seclists/Discovery/Web-Content/common.txt
```

输出：

```
/admin
/login
/images
```

---

## 指定扩展名

```bash
gobuster dir \
-u http://target.com \
-w wordlist.txt \
-x php,txt,html
```

会尝试：

```
admin.php
admin.txt
admin.html
```

---

## 指定线程

```bash
-t 50
```

例如：

```bash
gobuster dir \
-u http://target.com \
-w wordlist.txt \
-t 50
```

---

## 指定状态码

只显示：

```
200
204
301
302
307
401
403
```

例如：

```bash
-s 200,301,302,403
```

---

## 排除状态码

```bash
-b 404
```

---

## 指定 User-Agent

```bash
-a "Mozilla/5.0"
```

---

# 1.2 DNS 爆破

## 基本使用

```bash
gobuster dns \
-d example.com \
-w subdomains.txt
```

例如：

```
www
mail
vpn
dev
```

输出：

```
www.example.com
mail.example.com
```

---

# 1.3 VHOST 爆破

## 什么是 VHOST？

服务器根据 Host 头返回不同网站：

```
Host: admin.example.com
Host: mail.example.com
Host: web.example.com
```

---

## 基本使用

```
IP：
154.57.164.76

域名：
inlanefreight.htb
```

修改：

```
/etc/hosts
```

添加：

```
154.57.164.76 inlanefreight.htb
```

爆破：

```bash
gobuster vhost \
-u http://inlanefreight.htb:PORT \
-w wordlist.txt \
--append-domain
```

发送：

```
Host: admin.inlanefreight.htb
Host: web.inlanefreight.htb
```

---

## append-domain

开启：

```bash
--append-domain
```

例如：

字典：

```
admin
mail
web
```

自动变成：

```
admin.example.com
mail.example.com
web.example.com
```

---

# 2. ffuf

```bash
ffuf -h
```
---

# 2.1 目录扫描

```bash
ffuf \
-w wordlist.txt \
-u http://target/FUZZ
```

FUZZ 会被替换。

例如：

```
admin
login
test
```

变成：

```
http://target/admin
http://target/login
http://target/test
```

---

# 2.2 文件扩展扫描

```bash
ffuf \
-w wordlist.txt \
-u http://target/FUZZ.php
```

尝试：

```
admin.php
login.php
```

---

# 2.3 VHOST 爆破

HTB 常用。

```bash
ffuf \
-w wordlist.txt \
-u http://IP:PORT \
-H "Host: FUZZ.inlanefreight.htb"
```

例如：

```
FUZZ=admin

Host:
admin.inlanefreight.htb
```

---

# 2.4 GET 参数爆破

例如：

```
?id=1
```

可以：

```bash
ffuf \
-w params.txt \
-u http://target/index.php?FUZZ=test
```

---

# 2.5 POST 参数

```bash
ffuf \
-w users.txt \
-u http://target/login \
-X POST \
-d "username=FUZZ&password=test"
```

---

# 2.6 Header 爆破

```bash
ffuf \
-w headers.txt \
-u http://target \
-H "FUZZ:test"
```

---

# 3. ffuf 过滤

HTB 经常考。

---

## 过滤状态码

```bash
-fc 404
```

过滤：

```
404
```

---

## 只显示状态码

```bash
-mc 200
```

或者：

```bash
-mc 200,301,302
```

---

## 按大小过滤

例如：

```
Size:116
```

过滤：

```bash
-fs 116
```

---

## 按单词过滤

```
Words:4
```

过滤：

```bash
-fw 4
```

---

## 按行数过滤

```
Lines:2
```

过滤：

```bash
-fl 2
```

---

## 自动过滤

推荐：

```bash
-ac
```

自动过滤 Wildcard。

---

# 4. HTB 常见技巧

## 提取 web 开头字典

```bash
grep -h ^web /usr/share/seclists/Discovery/DNS/* > web.txt
```

查看数量：

```bash
wc -l web.txt
```

---

## ffuf 爆破

```bash
ffuf \
-w web.txt \
-u http://IP:PORT \
-H "Host: FUZZ.inlanefreight.htb"
```

---

## Gobuster 爆破

```bash
gobuster vhost \
-u http://inlanefreight.htb:PORT \
-w web.txt \
--append-domain
```

---

# 5. Wildcard VHOST

现象：

```
web1
web2
web3
web99999
```

全部：

```
200
Size:116
```

说明：

服务器可能配置：

```
*.inlanefreight.htb
```

不能只看：

```
Status:200
```

应该结合：

```
Size
Words
Lines
```

过滤：

```
-fs
-fw
-fl
```

或者：

```
-ac
```

---

# 6. 常用命令速查

## Gobuster

目录：

```bash
gobuster dir -u URL -w WORDLIST
```

DNS：

```bash
gobuster dns -d DOMAIN -w WORDLIST
```

VHOST：

```bash
gobuster vhost -u URL -w WORDLIST --append-domain
```

---

## ffuf

目录：

```bash
ffuf -w WORDLIST -u URL/FUZZ
```

VHOST：

```bash
ffuf -w WORDLIST -u URL -H "Host: FUZZ.domain"
```

过滤：

```bash
-fc 404
-fs 100
-fw 4
-fl 2
-ac
```

---
