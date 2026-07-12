---
title: "Information Gathering - Web Edition"
published: 2026-06-13
updated: 2026-06-13
draft: false
description: "目标系统 154.57.164.70:31462"
image: ""
tags:
  - 信息收集
category: 网络安全
pinned: false
comment: true
author: Ziddzide
---

目标系统 154.57.164.70:31462

# Information Gathering - Web Edition

date: 2026-06-13

目标系统：`154.57.164.70:31462`

---

# 1. What is the IANA ID of the registrar of the inlanefreight.com domain?

首先修改 hosts：

```bash
sudo vim /etc/hosts
```

添加：

```text
154.57.164.70 inlanefreight.htb
```

查询：

```bash
whois inlanefreight.com | grep IANA
```

得到：

```
Registrar IANA ID: 468
Registrar IANA ID: 468
```

答案：

```
468
```

---

# 2. What http server software is powering the inlanefreight.htb site on the target system?

查看 HTTP Header：

```bash
curl -I inlanefreight.htb:31462
```

得到：

```
HTTP/1.1 200 OK
Server: nginx/1.26.1
```

答案：

```
nginx
```

---

# 3. What is the API key in the hidden admin directory that you have discovered on the target system?

首先进行 vHost 爆破：

```bash
ffuf -u http://154.57.164.70:31462 \
-H "Host: FUZZ.inlanefreight.htb" \
-w web.txt \
-fs 120
```

得到：

```
web1337  [Status: 200, Size: 104, Words: 4, Lines: 2]
```

修改 hosts：

```
154.57.164.70 inlanefreight.htb web1337.inlanefreight.htb
```

查看 robots：

```bash
curl web1337.inlanefreight.htb:31462/robots.txt
```

得到：

```
User-agent: *
Allow: /index.html
Allow: /index-2.html
Allow: /index-3.html
Disallow: /admin_h1dd3n
```

访问：

```bash
curl -I http://web1337.inlanefreight.htb:31462/admin_h1dd3n
```

得到：

```
HTTP/1.1 301 Moved Permanently
Location: http://web1337.inlanefreight.htb/admin_h1dd3n/
```

这里脑子进水了，以为有新的目录可以继续爆破，于是：

错误写法：

```bash
ffuf -u http://154.57.164.70:31462 \
-H "Host: web1337.inlanefreight.htb/admin_h1dd3n/FUZZ" \
-w /usr/share/seclists/Discovery/Web-Content/common.txt
```

后来发现语法错了。

修改：

```bash
ffuf \
-u http://154.57.164.70:31462/admin_h1dd3n/FUZZ \
-H "Host: web1337.inlanefreight.htb" \
-w /usr/share/seclists/Discovery/Web-Content/common.txt
```

爆出来：

```
index.html
```

我还是觉得没结束，又换了大字典：

```
raft-medium-directories.txt
```

甚至自己提取 API 字典：

```bash
grep -h ^api 字典路径 > api.txt
```

以及各种 API 字典继续扫。

结果什么都没有。

这时候开始怀疑人生，标题一直强调 API，为什么什么都扫不出来。

突然意识到：

301 都出来了，为什么不跟一下重定向？

```bash
curl -L http://web1337.inlanefreight.htb:31462/admin_h1dd3n/
```

得到：

```html
<!DOCTYPE html>
<html>
<head><title>web1337 admin</title></head>
<body>
<h1>Welcome to web1337 admin site</h1>
<h2>
The admin panel is currently under maintenance,
but the API is still accessible with the key
e963d863ee0e82ba7080fbf558ca0d3f
</h2>
</body>
</html>
```

原来真的只是想多了。

答案：

```
e963d863ee0e82ba7080fbf558ca0d3f
```

---

# 4. After crawling the inlanefreight.htb domain on the target system, what is the email address you have found?

HTB 给了一个 ReconSpider。

直接用：

```bash
python3 ReconSpider.py http://inlanefreight.htb
```

结果：

```json
{
    "emails": [],
    "links": [],
    "external_files": [],
    "js_files": [],
    "form_fields": [],
    "images": [],
    "videos": [],
    "audio": [],
    "comments": []
}
```

什么都没抓到。

第一反应：

是不是又少带端口了？

加端口还是不行。

后来查看 hosts：

```
154.57.164.70 web1337.inlanefreight.htb
```

突然想起来，之前为了做题把 hosts 改掉了。

改成：

```
154.57.164.70 inlanefreight.htb web1337.inlanefreight.htb
```

还是不行。

查了一圈资料和 WP，有一句话让我直接清醒了：

```
虚拟主机也可以拥有子虚拟主机。
```

顿时龙场悟道。

继续扫：

```bash
ffuf \
-u http://154.57.164.70:31462 \
-H "Host: FUZZ.web1337.inlanefreight.htb" \
-w /usr/share/seclists/Discovery/Web-Content/common.txt \
-fs 120
```

得到：

```
dev  [Status: 200, Size: 123, Words: 5, Lines: 1]
```

再修改 hosts。

这次重新跑 ReconSpider。

结果还是没有。

最后把端口带上：

```bash
python3 ReconSpider.py http://dev.web1337.inlanefreight.htb:31462
```

终于拿到：

```
1337testing@inlanefreight.htb
```

答案：

```
1337testing@inlanefreight.htb
```

---

# 5. What is the API key the inlanefreight.htb developers will be changing to?

第一反应：

既然上一题用了 ReconSpider，那这一题大概率也在结果里。

查看：

```json
"comments": [
    "<!-- Remember to change the API key to ba988b835be4aa97d068941dc852ff33 -->"
]
```

答案：

```
ba988b835be4aa97d068941dc852ff33
```

---

# 总结

这一节最大的收获不是工具，而是虚拟主机。

以前一直觉得：

```
域名
└── 子域名
```

做到这里才真正意识到：

```
虚拟主机
└── 子虚拟主机
```

而且它们完全可以部署在同一个 IP、同一个端口上，通过 HTTP Host Header 区分。

这一点导致我整个过程多次漏掉端口、改坏 hosts、ReconSpider 抓不到内容以及 vHost 爆破方向错误。

另外还有一个容易忽略的小坑：

看到 301 时，不一定意味着还有目录需要继续爆破，很可能只是提示：

```
/admin_h1dd3n
        ↓
/admin_h1dd3n/
```

跟一下重定向，说不定答案就在眼前。

这节课最大的收获：

```
虚拟主机也可以拥有子虚拟主机。
```

以前很多类似情况可能都被我忽略了，这次算是真正理解了 HTB 想考什么。
