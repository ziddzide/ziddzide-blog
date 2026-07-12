---
title: "Web Fuzzing-Skills Assessment"
published: 2026-06-15
updated: 2026-06-15
draft: false
description: "┌──(root㉿shadow)-[/home/luxin]"
image: ""
tags:
  - 信息收集
category: 网络安全
pinned: false
comment: true
author: Ziddzide
---

# 技能评估

```
┌──(root㉿shadow)-[/home/luxin]
└─# curl -v http://154.57.164.79:31936
*   Trying 154.57.164.79:31936...
* Established connection to 154.57.164.79 (154.57.164.79 port 31936) from 172.24.126.13 port 41368
* using HTTP/1.x
> GET / HTTP/1.1
> Host: 154.57.164.79:31936
> User-Agent: curl/8.18.0
> Accept: */*
>
* Request completely sent off
< HTTP/1.1 403 Forbidden
< Date: Sun, 14 Jun 2026 16:53:29 GMT
< Server: Apache/2.4.61 (Debian)
< Content-Length: 281
< Content-Type: text/html; charset=iso-8859-1
<
<!DOCTYPE HTML PUBLIC "-//IETF//DTD HTML 2.0//EN">
<html><head>
<title>403 Forbidden</title>
</head><body>
<h1>Forbidden</h1>
<p>You don't have permission to access this resource.</p>
<hr>
```

提示我没有权限，无法访问这个资源，这里只给了ip和端口号，属于网页模糊测试的范围应该没有dns和子域名，虚拟主机之间的事情，因此直接看看有没有子目录

```
ffuf -u http://154.57.164.79:31936/FUZZ -w /usr/share/seclists/Discovery/Web-Content/common.txt
```

得到

```
.htaccess   [Status: 403, Size: 281, Words: 20, Lines: 10, Duration: 5202ms]
.hta     [Status: 403, Size: 281, Words: 20, Lines: 10, Duration: 5209ms]
.htpasswd  [Status: 403, Size: 281, Words: 20, Lines: 10, Duration: 5211ms]
admin  [Status: 301, Size: 323, Words: 20, Lines: 10, Duration: 305ms]
server-status   [Status: 403, Size: 281, Words: 20, Lines: 10, Duration: 363ms]
```

目前的文件都是403无法成为突破口但是出现了admin字段，使用curl看看重定向到哪了

```
┌──(root㉿shadow)-[/home/luxin]
└─# curl -I http://154.57.164.79:31936/admin
HTTP/1.1 301 Moved Permanently
Date: Sun, 14 Jun 2026 16:59:12 GMT
Server: Apache/2.4.61 (Debian)
Location: http://154.57.164.79:31936/admin/
Content-Type: text/html; charset=iso-8859-1
```

查看location之后继续在这个目录里尝试，但是既有可能有文件也有可能有目录，在这里使用feroxbuster进行递归测试,然后手动打开网页看看

显示Access Denied，没有什么有价值的东西，继续回来看递归结果

```
feroxbuster -u http://154.57.164.79:31936/admin/ -w /usr/share/seclists/Discovery/Web-Content/common.txt -x php,html,txt,old,tar.gz
```

结果出现两个文件

```
200  GET  1l  2w 13c http://154.57.164.79:31936/admin/index.php
200  GET  1l  8w 58c http://154.57.164.79:31936/admin/panel.php
```

那就一一分析，先从index开始，预计耗时很短，先处理这个，打开网页看来还是Access Denied，查看源代码也没有信息

那就查看panel.php

```
Invalid parameter, please ensure accessID is set correctly
```

提示我们需要输入正确的ID号，那就curl看看：

```
┌──(root㉿shadow)-[/home/luxin]
└─# curl -v http://154.57.164.79:31936/admin/panel.php
*   Trying 154.57.164.79:31936...
* Established connection to 154.57.164.79 (154.57.164.79 port 31936) from 172.24.126.13 port 45156
* using HTTP/1.x
> GET /admin/panel.php HTTP/1.1
> Host: 154.57.164.79:31936
> User-Agent: curl/8.18.0
> Accept: */*
>
* Request completely sent off
< HTTP/1.1 200 OK
< Date: Sun, 14 Jun 2026 17:09:24 GMT
< Server: Apache/2.4.61 (Debian)
< X-Powered-By: PHP/8.3.9
< Content-Length: 58
< Content-Type: text/html; charset=UTF-8
<
* Connection #0 to host 154.57.164.79:31936 left intact
Invalid parameter, please ensure accessID is set correctly
```

显示没有什么特殊的，那么就说明需要通过api接口验证，那就测试接口

```
ffuf -u http://154.57.164.79:31936/admin/panel.php?accseeID=FUZZ -w /usr/share/seclists/Discovery/Web-Content/common.txt -fs 58
```

得到

```
getaccess   [Status: 200, Size: 68, Words: 12, Lines: 1, Duration: 339ms]
```

那就curl看看

```
┌──(root㉿shadow)-[/home/luxin]
└─# curl -v http://154.57.164.79:31936/admin/panel.php?accessID=getaccess
*   Trying 154.57.164.79:31936...
* Established connection to 154.57.164.79 (154.57.164.79 port 31936) from 172.24.126.13 port 51844
* using HTTP/1.x
> GET /admin/panel.php?accessID=getaccess HTTP/1.1
> Host: 154.57.164.79:31936
> User-Agent: curl/8.18.0
> Accept: */*
>
* Request completely sent off
< HTTP/1.1 200 OK
< Date: Sun, 14 Jun 2026 17:19:37 GMT
< Server: Apache/2.4.61 (Debian)
< X-Powered-By: PHP/8.3.9
< Content-Length: 68
< Content-Type: text/html; charset=UTF-8
<
* Connection #0 to host 154.57.164.79:31936 left intact
Head on over to the fuzzing_fun.htb vhost for some more fuzzing fun!
```

因此我们得到了这个ip地址的虚拟主机，需要添加hosts，但是我们并不能确定这个虚拟主机有没有嵌套子虚拟主机，先进行自虚拟主机fuzz

```
ffuf -u http://154.57.164.79:31936 -H "Host: FUZZ.fuzzing_fun.htb" -w /usr/share/seclists/Discovery/Web-Content/common.txt -fc 403,404
```

得到 hidden 结果，所以需要继续往hosts文件中添加。但是添加完继续查看是否依然嵌套子虚拟主机

```
ffuf -u http://154.57.164.79:31936 -H "Host: FUZZ.hidden.fuzzing_fun.htb" -w /usr/share/seclists/Discovery/Web-Content/common.txt  -fc 403,404
```

好的这下应该是没有，现在需要确定最开始访问admin目录的时候ip地址到底被解析到哪个虚拟主机地址,我都curl解析了下，三种解析方式，vhost和ip，以及子虚拟主机，服

```
┌──(root㉿shadow)-[/home/luxin]
└─# curl http://fuzzing_fun.htb:31936
Welcome to fuzzing_fun.htb!
Your next starting point is in the godeep folder - but it might be on this vhost, it might not, who knows...
```

这是虚拟主机的提示，因此直接curl，不行的话切到子虚拟主机

```
┌──(root㉿shadow)-[/home/luxin]
└─# curl -v http://hidden.fuzzing_fun.htb:31936/godeep
* Host hidden.fuzzing_fun.htb:31936 was resolved.
* IPv6: (none)
* IPv4: 154.57.164.79
*   Trying 154.57.164.79:31936...
* Established connection to hidden.fuzzing_fun.htb (154.57.164.79 port 31936) from 172.24.126.13 port 54770
* using HTTP/1.x
> GET /godeep HTTP/1.1
> Host: hidden.fuzzing_fun.htb:31936
> User-Agent: curl/8.18.0
> Accept: */*
>
* Request completely sent off
< HTTP/1.1 301 Moved Permanently
< Date: Sun, 14 Jun 2026 17:42:19 GMT
< Server: Apache/2.4.61 (Debian)
< Location: http://hidden.fuzzing_fun.htb:31936/godeep/
< Content-Length: 342
< Content-Type: text/html; charset=iso-8859-1
<
<!DOCTYPE HTML PUBLIC "-//IETF//DTD HTML 2.0//EN">
<html><head>
<title>301 Moved Permanently</title>
</head><body>
<h1>Moved Permanently</h1>
<p>The document has moved <a href="http://hidden.fuzzing_fun.htb:31936/godeep/">here</a>.</p>
<hr>
<address>Apache/2.4.61 (Debian) Server at hidden.fuzzing_fun.htb Port 31936</address>
</body></html>
* Connection #0 to host hidden.fuzzing_fun.htb:31936 left intact
```

确实在子虚拟主机里,但是又不确定文件和目录了，开始递归扫描

```
feroxbuster -u http://hidden.fuzzing_fun.htb:31936/godeep -w /usr/share/seclists/Discovery/Web-Content/common.txt -x php,txt,old,tar.gz,html
```

在这个目录下有一个index文件，除此之外又爆出一个目录stoneedge，写的过程中在stoneedge又爆出一个，还有...

```
301  GET    9l   28w  342c http://hidden.fuzzing_fun.htb:31936/godeep => http://hidden.fuzzing_fun.htb:31936/godeep/
200  GET    1l    2w   13c http://hidden.fuzzing_fun.htb:31936/godeep/index.php
301  GET    9l   28w  352c http://hidden.fuzzing_fun.htb:31936/godeep/stoneedge => http://hidden.fuzzing_fun.htb:31936/godeep/stoneedge/
301  GET    9l   28w  360c http://hidden.fuzzing_fun.htb:31936/godeep/stoneedge/bbclone => http://hidden.fuzzing_fun.htb:31936/godeep/stoneedge/bbclone/
200  GET    1l    2w   15c http://hidden.fuzzing_fun.htb:31936/godeep/stoneedge/index.php
200  GET    1l    4w   18c http://hidden.fuzzing_fun.htb:31936/godeep/stoneedge/bbclone/index.php
301  GET    9l   28w 366c http://hidden.fuzzing_fun.htb:31936/godeep/stoneedge/bbclone/typo3 => http://hidden.fuzzing_fun.htb:31936/godeep/stoneedge/bbclone/typo3/
200  GET    1l    1w   23c http://hidden.fuzzing_fun.htb:31936/godeep/stoneedge/bbclone/typo3/index.php
```

curl 查看最底层的文件，一发入魂。

```
┌──(root㉿shadow)-[/home/luxin]
└─# curl -v http://hidden.fuzzing_fun.htb:31936/godeep/stoneedge/bbclone/typo3/index.php
* Host hidden.fuzzing_fun.htb:31936 was resolved.
* IPv6: (none)
* IPv4: 154.57.164.79
*   Trying 154.57.164.79:31936...
* Established connection to hidden.fuzzing_fun.htb (154.57.164.79 port 31936) from 172.24.126.13 port 49914
* using HTTP/1.x
> GET /godeep/stoneedge/bbclone/typo3/index.php HTTP/1.1
> Host: hidden.fuzzing_fun.htb:31936
> User-Agent: curl/8.18.0
> Accept: */*
>
* Request completely sent off
< HTTP/1.1 200 OK
< Date: Sun, 14 Jun 2026 17:58:49 GMT
< Server: Apache/2.4.61 (Debian)
< X-Powered-By: PHP/8.3.9
< Content-Length: 23
< Content-Type: text/html; charset=UTF-8
<
* Connection #0 to host hidden.fuzzing_fun.htb:31936 left intact
HTB{w3b_fuzz1ng_sk1lls}
```
