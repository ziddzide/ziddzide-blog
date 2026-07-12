---
title: "Directory and File Fuzzing"
published: 2026-06-13
updated: 2026-06-13
draft: false
description: "我先用 common 字典试了看有没有其他文件，没扫出结果后换了更大的字典，发现了一些被 403 拦截的 .inc 文件名："
image: ""
tags:
  - 信息收集
category: 网络安全
pinned: false
comment: true
author: Ziddzide
---

# webfuzzing_hidden_path：目录与文件模糊测试

我先用 `common` 字典试了看有没有其他文件，没扫出结果后换了更大的字典，发现了一些被 403 拦截的 `.inc` 文件名：

```bash
ffuf -u http://154.57.164.75:32203/webfuzzing_hidden_path/FUZZ -w /usr/share/seclists/Discovery/Web-Content/raft-medium-files.txt
```

示例输出（被统一拦截，大小一致，可能只是服务器配置）：

```text
extension.inc   [Status: 403, Size: 158]
footer.inc      [Status: 403, Size: 158]
...（省略）
```

由于响应大小一致，我判断这些是被配置拦截而非真实存在的文件名，接着对目录进行爆破：

```bash
ffuf -u http://154.57.164.75:32203/webfuzzing_hidden_path/FUZZ -w /usr/share/seclists/Discovery/Web-Content/raft-medium-directories.txt
```

结果提示有 `flag` 目录：

```text
flag [Status: 301]
```

但是/flag是一个目录，继续用刚才的文件名字典fuzz,一样的common字典只能跑出来一个index.html,换一个大点的

```bash
ffuf -u http://154.57.164.75:32203/webfuzzing_hidden_path/flag/FUZZ -w /usr/share/seclists/Discovery/Web-Content/raft-medium-files.txt
```
扫出来就是一个index.html和一堆403的inc文件，我估计只是因为配置了403给我拦截了，服务器上并没有这些文件，那就先调查index。html文件

```bash
curl -I http://154.57.164.75:30349/webfuzzing_hidden_path/flag/index.html
curl http://154.57.164.75:30349/webfuzzing_hidden_path/flag/index.html
```

内容显示这是一个普通索引页，于是我调整思路，基于站点可能使用 PHP 的判断，限定后缀并扩大字典：

```bash
ffuf -u http://154.57.164.75:30349/webfuzzing_hidden_path/flag/FUZZ -w /usr/share/seclists/Discovery/Web-Content/common.txt -e .php,.txt,.bak,.old,.zip -t 60
```

虽然网络不稳定，但最后我手动尝试后发现了 `flag.html`：

```bash
curl http://154.57.164.75:30349/webfuzzing_hidden_path/flag/flag.html
```

页面包含：

```html
<h1>HTB{w3b_f1l3_fuzz1ng_fl4g}</h1>
```

我把这个过程记录下来，方便以后复盘字典选择与后缀策略。
# recursive_fuzz：递归爆破

如果目标目录存在多级嵌套，优先使用递归爆破工具提升效率。我在初步用 `ffuf` 发现 `level1` 后，改用 `feroxbuster` 进行递归探测：

```bash
feroxbuster -u http://154.57.164.68:32036/recursive_fuzz -w /usr/share/seclists/Discovery/Web-Content/DirBuster-2007_directory-list-2.3-medium.txt -x .php,.html -t 200
```

最终访问到深层路径：

```bash
curl -L http://154.57.164.68:32036/recursive_fuzz/level1/level2/level3/threatcon_level2/
```

页面包含：

```html
<h1>HTB{d33p3r_d1rector1es_ar3_c00l}</h1>
```

这部分记录了我在选择字典与工具（递归 vs 非递归）上的思路权衡。
# GET 参数模糊测试

我先访问 `get.php` 观察返回提示，然后使用 `ffuf` 对 `x` 参数进行模糊：

```bash
ffuf -u 'http://154.57.164.78:30291/get.php?x=FUZZ' -w /usr/share/seclists/Discovery/Web-Content/common.txt
```

命中后直接 `curl` 验证：

```bash
curl 'http://154.57.164.78:30291/get.php?x=OA_HTML'
# -> HTB{g3t_fuzz1ng_succ3ss}
```
# POST 参数模糊测试

POST 参数需要关注 `Content-Type`（例如 `application/x-www-form-urlencoded`）。我用 `ffuf` 指定头并模糊 `y`：

```bash
ffuf -u http://154.57.164.78:30291/post.php -H 'Content-Type: application/x-www-form-urlencoded' -d 'y=FUZZ' -w /usr/share/seclists/Discovery/Web-Content/common.txt
```

命中后用 `curl` 验证：

```bash
curl -d 'y=SUNWmc' http://154.57.164.78:30291/post.php
# -> HTB{p0st_fuzz1ng_succ3ss}
```

# GoBuster：vhost 与子域名爆破

如果要爆破虚拟主机（vhost），使用 `gobuster vhost` 并开启 `--append-domain`：

```bash
gobuster vhost -u http://inlanefreight.htb:31117 -w web.txt --append-domain
```

结果示例：

```text
web-beans.inlanefreight.htb:31117 Status: 200 [Size: 108]
```

若是要进行 DNS 子域名爆破，使用 `gobuster dns` 并指定解析器：

```bash
gobuster dns --domain inlanefreight.com -w /usr/share/seclists/Discovery/DNS/subdomains-top1million-5000.txt --resolver 8.8.8.8
```

注意：子域名爆破会产生大量噪音，需要对结果做去重与筛选。
# 可选练习（POST）

流程同上：用 `ffuf` 模糊 POST 参数并用 `curl` 验证。

```bash
ffuf -u http://154.57.164.68:31736/post.php -w /usr/share/seclists/Discovery/Web-Content/common.txt -H 'Content-Type: application/x-www-form-urlencoded' -d 'y=FUZZ'
curl -d 'y=SUNWmc' http://154.57.164.68:31736/post.php
```
# 隐藏目录与 tar.gz 分析（示例流程）

我在根目录使用中等字典进行爆破，发现 `backup` 路径并进一步递归后定位到 `ur-hiddenmember/backup.tar.gz`：

```bash
feroxbuster -u http://154.57.164.64:32578 -w /usr/share/seclists/Discovery/Web-Content/DirBuster-2007_directory-list-2.3-medium.txt -x .tar.gz -t 100
```

定位到 `backup.tar.gz` 后，应通过响应头确认文件大小与类型：

```bash
curl -I http://154.57.164.64:32578/ur-hiddenmember/backup.tar.gz
curl -v http://154.57.164.64:32578/ur-hiddenmember/backup.tar.gz
```

根据 `Content-Length` 判断是否为完整备份文件。若需要进一步验证，应在受控、隔离的环境中下载并解压，检查其中是否包含敏感数据（如数据库备份或配置文件），并遵循合规流程。

> 后续一些环节涉及 API 与更深入的验证，第二部分。
