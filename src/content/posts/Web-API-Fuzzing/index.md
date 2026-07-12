---
title: "Web-API-Fuzzing"
published: 2026-06-15
updated: 2026-06-15
draft: false
description: "打开网页发送一个请求,添加一个商品"
image: ""
tags:
  - API接口
category: 网络安全
pinned: false
comment: true
author: Ziddzide
---

# 1. API模糊测试器识别出的端点返回的值是什么？

打开网页发送一个请求,添加一个商品

```
POST /items/ HTTP/1.1
Host: 154.57.164.62:31173
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:151.0) Gecko/20100101 Firefox/151.0
Accept: */*
Accept-Language: zh-CN,zh;q=0.9,zh-TW;q=0.8,zh-HK;q=0.7,en-US;q=0.6,en;q=0.5
Accept-Encoding: gzip, deflate, br
Referer: http://154.57.164.62:31173/
Content-Type: application/x-www-form-urlencoded
Content-Length: 21
Origin: http://154.57.164.62:31173
Connection: keep-alive
Priority: u=0

name=123456&price=111
```

删除一个商品

```
DELETE /items/1 HTTP/1.1
Host: 154.57.164.62:31173
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:151.0) Gecko/20100101 Firefox/151.0
Accept: */*
Accept-Language: zh-CN,zh;q=0.9,zh-TW;q=0.8,zh-HK;q=0.7,en-US;q=0.6,en;q=0.5
Accept-Encoding: gzip, deflate, br
Referer: http://154.57.164.62:31173/
Origin: http://154.57.164.62:31173
Connection: keep-alive
Priority: u=0
```
这道题看了下其实就是ffuf模糊测试没必要下他的工具

```
ffuf -u http://154.57.164.62:31173/FUZZ -w /usr/share/seclists/Discovery/Web-Content/common.txt
```

得到

```
czcmdcvt   [Status: 200, Size: 22, Words: 1, Lines: 1, Duration: 402ms]
docs   [Status: 200, Size: 931, Words: 150, Lines: 31, Duration: 307ms]
items  [Status: 307, Size: 0, Words: 1, Lines: 1, Duration: 293ms]
```

然后直接查看就行

```
┌──(root㉿shadow)-[/home/luxin]
└─# curl -v http://154.57.164.62:31173/czcmdcvt
*   Trying 154.57.164.62:31173...
* Established connection to 154.57.164.62 (154.57.164.62 port 31173) from 172.24.126.13 port 55492
* using HTTP/1.x
> GET /czcmdcvt HTTP/1.1
> Host: 154.57.164.62:31173
> User-Agent: curl/8.18.0
> Accept: */*
>
* Request completely sent off
< HTTP/1.1 200 OK
< date: Sun, 14 Jun 2026 16:47:29 GMT
< server: uvicorn
< content-length: 22
< content-type: application/json
<
* Connection #0 to host 154.57.164.62:31173 left intact
{"flag":"h1dd3n_r357"}
```

> 然后就是技能评估，api模糊测试这里它只给了这一个例子和docs文档，之后我练习api专项训练的时候补充
