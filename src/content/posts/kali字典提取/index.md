---
title: "kali字典提取"
published: 2026-06-12
updated: 2026-06-12
draft: false
description: "ls /usr/share/seclists/Discovery/DNS/"
image: ""
tags:
  - 字典
category: 网络安全
pinned: false
comment: true
author: Ziddzide
---

# Kali 字典 & grep 小技巧

## 1. 常见字典位置

| 路径                         | 用途        |
| ---------------------------- | ---------:|
| `/usr/share/seclists/`       | 最常用字典库 |
| `/usr/share/wordlists/`      | Kali 自带字典|
| `/usr/share/dirb/wordlists/` | Dirb 小字典 |
| `/usr/share/wfuzz/wordlist/` | Wfuzz 字典 |

---

# 2. SecLists 常用目录

## DNS

| 路径                                              | 用途     |
| ----------------------------------------------- | ------ |
| Discovery/DNS/subdomains-top1million-5000.txt   | 小字典    |
| Discovery/DNS/subdomains-top1million-20000.txt  | 中等     |
| Discovery/DNS/subdomains-top1million-110000.txt | 大字典    |
| Discovery/DNS/namelist.txt                      | 常用 DNS |

查看：

```bash
ls /usr/share/seclists/Discovery/DNS/
```

---

## Web

| 路径                                                  | 用途     |
| --------------------------------------------------- | ------ |
| Discovery/Web-Content/common.txt                    | 最常用    |
| Discovery/Web-Content/raft-small-directories.txt    | 小目录    |
| Discovery/Web-Content/raft-medium-directories.txt   | 中目录    |
| Discovery/Web-Content/directory-list-2.3-medium.txt | HTB 常用 |

查看：

```bash
ls /usr/share/seclists/Discovery/Web-Content/
```

---

## 用户名

| 文件                                    | 用途    |
| ------------------------------------- | ----- |
| Usernames/top-usernames-shortlist.txt | 常用用户名 |
| Usernames/Names/names.txt             | 人名    |
| Usernames/cirt-default-usernames.txt  | 默认账户  |

---

## 密码

| 文件                                               | 用途     |
| ------------------------------------------------ | ------ |
| Passwords/Common-Credentials/10k-most-common.txt | 常用     |
| Passwords/darkweb2017-top100.txt                 | Top100 |
| Passwords/Leaked-Databases/                      | 泄露密码   |

---

# 3. grep 提取小字典

## 提取 web 开头

```bash
grep -h ^web /usr/share/seclists/Discovery/DNS/*
```

例如：

```text
web
web1
webmail
webadmin
```

保存：

```bash
grep -h ^web /usr/share/seclists/Discovery/DNS/* > web.txt
```

---

## 提取 admin

```bash
grep -h ^admin *
```

保存：

```bash
grep -h ^admin * > admin.txt
```

---

## 提取 dev

```bash
grep -h ^dev * > dev.txt
```

---

## 提取 test

```bash
grep -h ^test * > test.txt
```

---

# 4. grep 常用正则

| 命令             | 含义              |
| -------------- | --------------- |
| `^web`         | web 开头          |
| `mail$`        | mail 结尾         |
| `admin`        | 包含 admin        |
| `^admin.*dev$` | admin 开头，dev 结尾 |
| `^[0-9]`       | 数字开头            |
| `^[a-z]`       | 小写字母开头          |

---

# 5. grep 常用参数

| 参数 | 作用      |
| -- | ------- |
| -h | 不显示文件名  |
| -i | 忽略大小写   |
| -r | 递归搜索    |
| -v | 反向匹配    |
| -n | 显示行号    |
| -o | 只输出匹配内容 |
| -E | 扩展正则    |

---

# 6. 管道配合

## 排序

```bash
grep web * | sort
```

---

## 去重

```bash
grep web * | sort -u
```

---

## 统计数量

```bash
grep web * | wc -l
```

---

## 查看前十个

```bash
grep web * | head
```

---

## 查看后十个

```bash
grep web * | tail
```

---

# 7. fuzz 常用提取

## web

```bash
grep -h ^web * > web.txt
```

---

## admin

```bash
grep -h admin * > admin.txt
```

---

## api

```bash
grep -h api * > api.txt
```

---

## dev

```bash
grep -h dev * > dev.txt
```

---

## test

```bash
grep -h test * > test.txt
```

---

## vpn

```bash
grep -h vpn * > vpn.txt
```

---

## mail

```bash
grep -h mail * > mail.txt
```

---

## ftp

```bash
grep -h ftp * > ftp.txt
```

---

# 8. 与 ffuf 配合

例如：

```bash
grep -h ^web * > web.txt
```

然后：

```bash
ffuf \
-w web.txt \
-u http://IP:PORT \
-H "Host: FUZZ.inlanefreight.htb"
```

---

目录 fuzz：

```bash
grep admin common.txt > admin.txt

ffuf \
-w admin.txt \
-u http://target/FUZZ
```

---

# 9. 实战经验

| 已知信息     | 提取方式                 |
| -------- | -------------------- |
| web 开头   | `grep -h ^web *`     |
| admin 开头 | `grep -h ^admin *`   |
| 包含 api   | `grep -h api *`      |
| 包含 test  | `grep -h test *`     |
| mail 服务  | `grep -h mail *`     |
| vpn 服务   | `grep -h vpn *`      |
| ftp 服务   | `grep -h ftp *`      |
| dev 环境   | `grep -h dev *`      |
| 数字结尾     | `grep -h '[0-9]$' *` |

---
