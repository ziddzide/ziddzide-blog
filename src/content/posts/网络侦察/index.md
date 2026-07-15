---
title: 网络侦察-信息收集
published: 2026-06-13
updated: 2026-07-15
draft: false
description: 常见的网络信息收集
image: ""
tags:
  - dns
  - Hack-The-Box
  - ip
  - 网络侦察
  - ffuf
  - gobuster
  - vhost
  - 子域名
  - 目录扫描
  - 子域名爆破
category: 网络安全
pinned: false
comment: true
author: Ziddzide
---
# WHOIS

WHOIS 是一种广泛使用的查询和响应协议，用于访问存储已注册互联网资源信息的数据库。WHOIS 主要与域名相关联，但也可以提供有关 IP 地址块和自治系统的详细信息。您可以将其视为互联网的巨型电话簿，用于查找各种在线资产的所有者或负责人。

```
ziddzide@htb[/htb]$ whois inlanefreight.com [...] Domain Name: inlanefreight.com Registry Domain ID: 2420436757_DOMAIN_COM-VRSN Registrar WHOIS Server: whois.registrar.amazon Registrar URL: https://registrar.amazon.com Updated Date: 2023-07-03T01:11:15Z Creation Date: 2019-08-05T22:43:09Z [...]`
```

每个 WHOIS 记录通常包含以下信息：

- `Domain Name`域名本身（例如，example.com）
- `Registrar`域名注册公司（例如，GoDaddy、Namecheap）
- `Registrant Contact`注册域名的人或组织。
- `Administrative Contact`：负责管理域名的人员。
- `Technical Contact`负责处理与该领域相关的技术问题的人员。
- `Creation and Expiration Dates`：域名注册时间以及到期时间。
- `Name Servers`将域名转换为 IP 地址的服务器。
### 形式化和标准化

随着互联网的发展超越了其学术起源，WHOIS协议`RFC 812`于1982年正式发布并标准化。这为建立一个更结构化、可扩展的域名注册及技术细节管理系统奠定了基础。同样来自NIC的Ken Harrenstien和Vic White在定义WHOIS协议及其查询响应机制方面发挥了关键作用。

## 利用 WHOIS

### 场景一：网络钓鱼调查

邮件安全网关将一封发送给公司多名员工的可疑邮件标记为可疑邮件。该邮件声称来自公司银行，并敦促收件人点击链接更新账户信息。安全分析师对该邮件展开调查，首先对邮件中链接的域名进行 WHOIS 查询。

WHOIS 记录显示如下：

- `Registration Date`该域名是几天前才注册的。
- `Registrant`注册者的信息通过隐私服务进行隐藏。
- `Name Servers`：这些域名服务器与一家众所周知的防弹主机提供商相关联，该提供商经常被用于恶意活动。

上述因素综合起来引起了分析师的极大警觉。域名注册日期较近、注册人信息隐藏以及托管位置可疑，都强烈暗示这是一起网络钓鱼活动。分析师立即通知公司IT部门封锁该域名，并警告员工提防诈骗。

对托管服务提供商和相关 IP 地址的进一步调查可能会发现威胁行为者使用的其他钓鱼域名或基础设施。

### 场景二：恶意软件分析

一位安全研究人员正在分析一种感染网络中多个系统的新型恶意软件。该恶意软件与远程服务器通信，接收指令并窃取数据。为了深入了解攻击者的基础设施，研究人员对与命令与控制 (C2) 服务器关联的域名执行了 WHOIS 查询。

WHOIS记录显示：

- `Registrant`该域名注册人为使用以匿名性著称的免费电子邮件服务的个人。
- `Location`注册人的地址位于网络犯罪高发国家。
- `Registrar`该域名是通过一家有过监管不力记录的域名注册商注册的。

基于这些信息，研究人员得出结论：C2 服务器很可能托管在已被入侵或“防弹”服务器上。随后，研究人员利用 WHOIS 数据识别托管服务提供商，并通知他们有关恶意活动的信息。

### 场景三：威胁情报报告

一家网络安全公司追踪一个以攻击金融机构而闻名的复杂威胁组织的活动。分析师收集与该组织过往攻击活动相关的多个域名的 WHOIS 数据，以编制一份全面的威胁情报报告。

通过分析 WHOIS 记录，分析人员发现了以下模式：

- `Registration Dates`这些域名成群注册，通常是在重大攻击发生前不久注册的。
- `Registrants`注册者使用各种别名和虚假身份。
- `Name Servers`这些域名通常共享相同的名称服务器，这表明它们拥有共同的基础架构。
- `Takedown History`许多域名在遭受攻击后被关闭，这表明之前执法部门或安全部门曾进行过干预。

这些洞察使分析人员能够创建威胁行为者战术、技术和程序 (TTP) 的详细画像。该报告包含基于 WHOIS 数据的入侵指标 (IOC)，其他组织可以利用这些指标来检测和阻止未来的攻击。

## 使用 WHOIS

在使用该`whois`命令之前，您需要确保它已安装在您的 Linux 系统上。这是一个可通过 Linux 包管理器获取的实用程序，如果尚未安装，可以使用以下命令轻松安装：

```
ziddzide@htb[/htb]$ sudo apt update ziddzide@htb[/htb]$ sudo apt install whois -y
```


访问 WHOIS 数据最简单的方法是通过`whois`命令行工具。让我们对以下域名执行 WHOIS 查询`facebook.com`

WHOIS 查询结果`facebook.com`揭示了几个关键细节：

1. `Domain Registration`：
    
    - `Registrar`RegistrarSafe, LLC
    - `Creation Date`1997年3月29日
    - `Expiry Date`2033年3月30日
    
    这些信息表明该域名已在 RegistrarSafe, LLC 注册，并且已活跃相当长一段时间，这暗示了其合法性和稳固的在线影响力。较长的到期日期也进一步印证了其持久性。
2. `Domain Owner`：
    
    - `Registrant/Admin/Tech Organization`Meta Platforms, Inc.
    - `Registrant/Admin/Tech Contact`域管理员
    
      
    此信息表明，Meta Platforms, Inc. 是 Facebook 背后的组织机构`facebook.com`，而“域名管理员”是域名相关事宜的联系人。这与人们的预期相符，即知名社交媒体平台 Facebook 由 Meta Platforms, Inc. 所有。
3. `Domain Status`：
    
    - `clientDeleteProhibited`，`clientTransferProhibited`，`clientUpdateProhibited`，`serverDeleteProhibited`，`serverTransferProhibited`， 和`serverUpdateProhibited`
    
      
    这些状态表明，该域名在客户端和服务器端均受到保护，免受未经授权的更改、转移或删除。这凸显了对域名安全性和控制的高度重视。
4. `Name Servers`：
    
    - `A.NS.FACEBOOK.COM`，，，`B.NS.FACEBOOK.COM`​`C.NS.FACEBOOK.COM`​`D.NS.FACEBOOK.COM`
    
    这些名称服务器都位于同一`facebook.com`域内，表明 Meta Platforms, Inc. 管理着其 DNS 基础设施。大型组织通常会维护对其 DNS 解析的控制权和可靠性。

## 问题

#####  对 paypal.com 域名进行 WHOIS 查询。域名注册商的互联网号码分配机构 (IANA) ID 号是多少？

```
292
```

##### tesla.com 域名的管理员邮箱联系方式是什么（该域名也属于特斯拉漏洞赏金计划的适用范围）？

```
admin@dnstinations.com
```

# DNS

## DNS 的工作原理

1. `Your Computer Asks for Directions (DNS Query)`当你输入域名时，你的电脑首先会检查内存（缓存），看看是否记得上次访问时的 IP 地址。如果没有，它会联系 DNS 解析器，通常由你的互联网服务提供商 (ISP) 提供。
2. `The DNS Resolver Checks its Map (Recursive Lookup)`解析器也有一个缓存，如果缓存中找不到 IP 地址，它就会开始遍历 DNS 层级结构。它首先会向根名称服务器查询，根名称服务器就像互联网的图书管理员。
3. `Root Name Server Points the Way`根服务器不知道确切的地址，但它知道谁知道——顶级域名（TLD）名称服务器，它负责域名的后缀（例如，.com、.org）。它会将解析器指向正确的方向。
4. `TLD Name Server Narrows It Down`顶级域名服务器就像一张区域地图。它知道哪个权威域名服务器负责您正在查找的特定域名（例如，`example.com`），并将解析器发送到那里。
5. `Authoritative Name Server Delivers the Address`权威名称服务器是最终目的地。它就像你想访问的网站的街道地址。它保存着正确的 IP 地址，并将其发送回解析器。
6. `The DNS Resolver Returns the Information`解析器接收 IP 地址并将其提供给您的计算机。它还会暂时记住该地址（缓存），以便您下次访问该网站时使用。
7. `Your Computer Connects`现在你的电脑知道了 IP 地址，就可以直接连接到托管网站的网络服务器，你就可以开始浏览了。

### 主机文件

该`hosts`文件是一个简单的文本文件，用于将主机名映射到 IP 地址，提供了一种绕过 DNS 解析的手动域名解析方法。DNS 会自动将域名转换为 IP 地址，而该`hosts`文件允许直接进行本地覆盖。这对于开发、故障排除或屏蔽网站尤其有用。

该`hosts`文件位于`C:\Windows\System32\drivers\etc\hosts`Windows 系统的 /etc/windows.txt 目录下，以及`/etc/hosts`Linux 和 macOS 系统的 /etc/windows.txt 目录下。

常见用途包括将域名重定向到本地服务器以进行开发：
```
127.0.0.1       myapp.local
```


通过指定 IP 地址测试连接性：
```
192.168.1.20    testserver.local
```


或者通过将域名重定向到不存在的 IP 地址来屏蔽不需要的网站：
```
0.0.0.0       unwanted-site.com
```

### DNS 关键概念

`Domain Name System`中`DNS`，区域`zone`是域命名空间中由特定实体或管理员管理的一个独立部分。可以将其视为一组域名的虚拟容器。例如，`example.com``example.com`及其所有子域（例如 `example.com``mail.example.com`或 `example.com` `blog.example.com`）通常属于同一个 DNS 区域。

区域文件是一个位于 DNS 服务器上的文本文件，它定义了该区域中的资源记录（如下所述），为将域名转换为 IP 地址提供了关键信息。

为了便于理解，以下是一个简化的区域文件示例`example.com`：

```
$TTL 3600 ; Default Time-To-Live (1 hour) 
@       IN SOA   ns1.example.com. admin.example.com. (                 
2024060401 ; Serial number (YYYYMMDDNN)                
3600       ; Refresh interval      
900        ; Retry interval                
604800     ; Expire time                
86400 )    ; Minimum TTL 
@       IN NS    ns1.example.com. 
@       IN NS    ns2.example.com. 
@       IN MX 10 mail.example.com. 
www     IN A     192.0.2.1 
mail    IN A     198.51.100.1 
ftp     IN CNAME www.example.com.
```

此文件定义了域内各个主机的权威名称服务器（`NS`记录）、邮件服务器（`MX`记录）和 IP 地址（记录） 。`A``example.com`

DNS服务器存储各种资源记录，每条记录在域名解析过程中都发挥着特定作用。让我们来探讨一些最常见的DNS概念：

|DNS概念|描述|例子|
|---|---|---|
|`Domain Name`|网站或其他互联网资源的易读标签。|`www.example.com`|
|`IP Address`|分配给每个连接到互联网的设备的唯一数字标识符。|`192.0.2.1`|
|`DNS Resolver`|将域名转换为 IP 地址的服务器。|您的 ISP 的 DNS 服务器或公共解析器，例如 Google DNS（`8.8.8.8`）|
|`Root Name Server`|DNS层次结构中的顶级服务器。|全球共有 13 台根服务器，命名为 AM：`a.root-servers.net`|
|`TLD Name Server`|负责特定顶级域名（例如 .com、.org）的服务器。|[Verisign](https://en.wikipedia.org/wiki/Verisign)用于`.com`，[PIR](https://en.wikipedia.org/wiki/Public_Interest_Registry)用于`.org`|
|`Authoritative Name Server`|存储域名实际 IP 地址的服务器。|通常由主机提供商或域名注册商管理。|
|`DNS Record Types`|DNS中存储的不同类型的信息。|A、AAAA、CNAME、MX、NS、TXT 等。|

这些记录存储与域名相关的不同类型的数据，每种记录都有其特定的用途：

|记录类型|姓名|描述|区域文件示例|
|---|---|---|---|
|`A`|地址记录|将主机名映射到其 IPv4 地址。|`www.example.com.`在`192.0.2.1`|
|`AAAA`|IPv6地址记录|将主机名映射到其 IPv6 地址。|`www.example.com.`在 AAAA`2001:db8:85a3::8a2e:370:7334`|
|`CNAME`|规范名称记录|为主机名创建别名，将其指向另一个主机名。|`blog.example.com.`在 CNAME 中`webserver.example.net.`|
|`MX`|邮件交换记录|指定负责处理该域电子邮件的邮件服务器。|`example.com.`IN MX 10`mail.example.com.`|
|`NS`|名称服务器记录|将 DNS 区域委托给特定的权威名称服务器。|`example.com.`印第安纳州`ns1.example.com.`|
|`TXT`|文本记录|存储任意文本信息，通常用于域验证或安全策略。|`example.com.`IN TXT `"v=spf1 mx -all"`（SPF 记录）|
|`SOA`|权限记录开始|指定有关 DNS 区域的管理信息，包括主名称服务器、负责人电子邮件和其他参数。|`example.com.`在 SOA 中`ns1.example.com. admin.example.com. 2024060301 10800 3600 604800 86400`|
|`SRV`|服务记录|定义特定服务的主机名和端口号。|`_sip._udp.example.com.`在 SRV 10 5 5060`sipserver.example.com.`|
|`PTR`|指针记录|用于反向 DNS 查询，将 IP 地址映射到主机名。|`1.2.0.192.in-addr.arpa.`在 PTR`www.example.com.`|

`IN`示例中的“ ”代表“Internet”。它是 DNS 记录中的一个类字段，用于指定协议族。大多数情况下，你会看到`IN`使用“ ”，因为它表示大多数域名使用的 Internet 协议族 (IP)。虽然也存在其他类值（例如`CH`Chaosnet、`HS`Hesiod），但在现代 DNS 配置中很少使用。

本质上，“ `IN`”只是一种约定俗成的表示，表明该记录适用于我们今天使用的标准互联网协议。虽然它看起来似乎只是一个额外的细节，但理解它的含义有助于更深入地理解DNS记录结构。

## DNS 对 Web 侦察的重要性

DNS 不仅仅是用于转换域名的一种技术协议；它是目标基础设施的关键组成部分，可以在渗透测试期间利用它来发现漏洞并获取访问权限：

- `Uncovering Assets`DNS 记录可以揭示大量信息，包括子域名、邮件服务器和名称服务器记录。例如，`CNAME`指向过时服务器的记录（`dev.example.com`CNAME `oldserver.example.net`）可能会导致系统存在安全漏洞。
- `Mapping the Network Infrastructure`通过分析 DNS 数据，您可以创建目标网络基础设施的完整地图。例如，识别`NS`域名的名称服务器（DNS 记录）可以揭示其使用的托管服务提供商，而 DNS`A`记录则`loadbalancer.example.com`可以精确定位负载均衡器。这有助于您了解不同系统之间的连接方式、识别流量流向，并找出潜在的瓶颈或弱点，以便在渗透测试中加以利用。
- `Monitoring for Changes`持续监控 DNS 记录可以揭示目标基础设施随时间发生的变化。例如，突然出现一个新的子域名（例如 `example.com` `vpn.example.com`）可能表明网络中出现了一个新的入口点，而`TXT`包含类似 `example.com` 值的记录则`_1password=...`强烈暗示该组织正在使用 1Password，这可能被用于社会工程攻击或定向网络钓鱼活动。
## DNS 工具

DNS侦察是指利用专门设计的工具来查询DNS服务器并提取有价值的信息。以下是网络侦察专业人员常用的一些最流行、功能最全面的工具：

| 工具                           | 主要特点                                         | 用例                                            |
| ---------------------------- | -------------------------------------------- | --------------------------------------------- |
| `dig`                        | 功能全面的 DNS 查询工具，支持各种查询类型（A、MX、NS、TXT 等）和详细输出。 | 手动 DNS 查询、区域传输（如果允许）、DNS 问题排查以及 DNS 记录的深入分析。  |
| `nslookup`                   | 更简单的 DNS 查询工具，主要用于 A、AAAA 和 MX 记录。           | 基本 DNS 查询，快速检查域名解析和邮件服务器记录。                   |
| `host`                       | 简洁高效的DNS查询工具，输出结果清晰明了。                       | 快速检查 A、AAAA 和 MX 记录。                          |
| `dnsenum`                    | 自动 DNS 枚举工具、字典攻击、暴力破解、区域传输（如果允许）。            | 高效地发现子域名并收集DNS信息。                             |
| `fierce`                     | 具有递归搜索和通配符检测功能的 DNS 侦察和子域名枚举工具。              | 用于 DNS 侦察、识别子域和潜在目标的友好用户界面。                   |
| `dnsrecon`                   | 结合多种 DNS 侦察技术，并支持多种输出格式。                     | 全面枚举 DNS 记录，识别子域，并收集 DNS 记录以进行进一步分析。          |
| `theHarvester`               | OSINT 工具，可从各种来源收集信息，包括 DNS 记录（电子邮件地址）。       | 从多个来源收集与域相关的电子邮件地址、员工信息和其他数据。                 |
| `Online DNS Lookup Services` | 用于执行 DNS 查询的用户友好界面。                          | 快速简便的 DNS 查询，在无法使用命令行工具时非常方便，可用于检查域名可用性或基本信息。 |

## 域名信息搜寻者

该`dig`命令（`Domain Information Groper`）是一个功能强大且用途广泛的实用程序，用于查询 DNS 服务器并检索各种类型的 DNS 记录。其灵活性以及详细且可自定义的输出使其成为首选。

### 常用挖掘命令

|命令|描述|
|---|---|
|`dig domain.com`|对域执行默认 A 记录查找。|
|`dig domain.com A`|检索与域关联的 IPv4 地址（A 记录）。|
|`dig domain.com AAAA`|获取与域关联的 IPv6 地址（AAAA 记录）。|
|`dig domain.com MX`|查找负责该域的邮件服务器（MX 记录）。|
|`dig domain.com NS`|确定域的权威名称服务器。|
|`dig domain.com TXT`|检索与该域关联的所有 TXT 记录。|
|`dig domain.com CNAME`|检索域的规范名称（CNAME）记录。|
|`dig domain.com SOA`|检索域的起始授权（SOA）记录。|
|`dig @1.1.1.1 domain.com`|指定要查询的特定名称服务器；在本例中为 1.1.1.1|
|`dig +trace domain.com`|显示完整的DNS解析路径。|
|`dig -x 192.168.1.1`|对 IP 地址 192.168.1.1 执行反向查找，以查找关联的主机名。您可能需要指定名称服务器。|
|`dig +short domain.com`|对问题提供简明扼要的答案。|
|`dig +noall +answer domain.com`|仅显示查询输出的答案部分。|
|`dig domain.com ANY`|检索域的所有可用 DNS 记录（注意：`ANY`根据[RFC 8482](https://datatracker.ietf.org/doc/html/rfc8482) ，许多 DNS 服务器会忽略查询以减少负载并防止滥用）。|

注意：某些服务器可以检测并阻止过多的 DNS 查询。请谨慎操作并遵守速率限制。在对目标进行广泛的 DNS 侦察之前，务必先获得许可。

## 问题

#####  哪个 IP 地址对应 inlanefreight.com？

```
134.209.24.248
```

##### 查询 134.209.24.248 的 PTR 记录时，返回的是哪个域？

```
inlanefreight.com
```

##### 查询 facebook.com 的邮件记录时，返回的完整域名是什么？

```
smtpin.vvv.facebook.com
```

# 子域名

在探索 DNS 记录时，我们主要关注的是主域名（例如 .example.com `example.com`）及其相关信息。然而，在这个主域名之下，隐藏着一个潜在的子域名网络。这些子域名是主域名的扩展，通常用于组织和分隔网站的不同部分或功能。例如，一家公司可能会使用 .example.com`blog.example.com`作为其博客，`shop.example.com`使用 .example.com 作为其在线商店，或者`mail.example.com`使用 .example.com 作为其电子邮件服务。

## 为什么这对于网络侦察很重要？

子域名通常包含一些主网站没有直接链接的重要信息和资源。这些信息和资源可能包括：

- `Development and Staging Environments`公司通常会使用子域名来测试新功能或更新，然后再将其部署到主站点。由于安全措施较为宽松，这些环境有时会存在漏洞或泄露敏感信息。
- `Hidden Login Portals`子域名可能托管管理面板或其他登录页面，这些页面并非旨在公开访问。寻求未经授权访问的攻击者可能会将这些页面视为极具吸引力的目标。
- `Legacy Applications`较老旧、已被遗忘的 Web 应用程序可能位于子域中，其中可能包含存在已知漏洞的过时软件。
- `Sensitive Information`子域名可能会无意中暴露机密文档、内部数据或配置文件，这些对攻击者来说可能很有价值。

## 子域枚举

`Subdomain enumeration`子域名枚举是指系统地识别和列出这些子域名的过程。从 DNS 的角度来看，子域名通常由`<domain> `A``（或`AAAA`IPv6 的 `<domain>`）记录表示，这些记录将子域名映射到其对应的 IP 地址。此外，`CNAME``domain` 记录还可以用于创建子域名的别名，将其指向其他域名或子域名。子域名枚举主要有两种方法：

### 1. 活动子域枚举

这涉及到直接与目标域的 DNS 服务器交互以发现子域。一种方法是尝试使用 `http://localhost:8000` `DNS zone transfer`，配置错误的服务器可能会无意中泄露完整的子域列表。然而，由于安全措施日益严格，这种方法很少成功。

更常见的主动技术是`brute-force enumeration`使用测试，即系统地将一系列潜在的子域名与目标域名进行比对。像 、 和 这样的工具`dnsenum`可以`ffuf`自动`gobuster`执行此过程，它们可以使用常用子域名的词表或基于特定模式生成的自定义列表。

### 2. 被动子域名枚举

这种方法依赖于外部信息源来发现子域名，而无需直接查询目标域名服务器。一个有价值的资源是`Certificate Transparency (CT) logs`公共 SSL/TLS 证书库。这些证书通常在其“使用者备用名称”（SAN）字段中包含关联的子域名列表，从而提供了大量潜在目标。

另一种被动的方法是利用`search engines`谷歌或DuckDuckGo之类的搜索引擎。通过使用专门的搜索运算符（例如，`site:`），您可以筛选结果，使其仅显示与目标域名相关的子域名。

# 子域名暴力破解

---

`Subdomain Brute-Force Enumeration`是一种强大的主动子域名发现技术，它利用预定义的潜在子域名列表。这种方法会系统地将这些名称与目标域名进行比对，从而识别有效的子域名。通过使用精心设计的词表，您可以显著提高子域名发现工作的效率和效果。

该过程分为四个步骤：

1. `Wordlist Selection`该过程首先要选择一个包含潜在子域名名称的词表。这些词表可以是：
    - `General-Purpose`包含一系列常见的子域名（例如，.example.com `dev`、.example.com、.example.com `staging`、.example.com等）。当您不了解目标网站的命名规则时，这种方法非常有用。`blog``mail``admin``test`
    - `Targeted`专注于与目标相关的特定行业、技术或命名模式。这种方法效率更高，并能降低误报率。
    - `Custom`您可以根据特定的关键词、模式或从其他来源收集的信息创建自己的词汇表。
2. `Iteration and Querying`脚本或工具遍历单词列表，将每个单词或短语附加到主域名（例如，`example.com`）以创建潜在的子域名（例如`dev.example.com`，，`staging.example.com`）。
3. `DNS Lookup`对每个潜在的子域名执行 DNS 查询，以检查其是否解析到 IP 地址。这通常使用 A 或 AAAA 记录类型完成。
4. `Filtering and Validation`如果子域名解析成功，则会将其添加到有效子域名列表中。可能会采取进一步的验证步骤来确认子域名的存在和功能（例如，尝试通过网络浏览器访问它）。

有几种工具非常擅长暴力枚举：

| 工具                                                      | 描述                                       |
| ------------------------------------------------------- | ---------------------------------------- |
| [dnsenum](https://github.com/fwaeytens/dnsenum)         | 功能全面的 DNS 枚举工具，支持字典攻击和暴力破解攻击，用于发现子域名。    |
| [fierce](https://github.com/mschwager/fierce)           | 一款用户友好的递归子域名发现工具，具有通配符检测和易于使用的界面。        |
| [dnsrecon](https://github.com/darkoperator/dnsrecon)    | 功能全面的工具，结合了多种 DNS 侦察技术，并提供可自定义的输出格式。     |
| [amass](https://github.com/owasp-amass/amass)           | 一款积极维护的工具，专注于子域名发现，以其与其他工具的集成和广泛的数据源而闻名。 |
| [assetfinder](https://github.com/tomnomnom/assetfinder) | 简单而有效的工具，可使用各种技术查找子域名，非常适合快速轻量级扫描。       |
| [puredns](https://github.com/d3mondev/puredns)          | 功能强大且灵活的 DNS 暴力破解工具，能够有效地解析和过滤结果。        |

### DNS枚举

`dnsenum`是一个功能强大且应用广泛的命令行工具，用 Perl 编写。它是一个全面的 DNS 侦察工具包，提供各种功能来收集目标域的 DNS 基础架构和潜在子域的信息。该工具提供以下几个关键功能：

- `DNS Record Enumeration`：`dnsenum`可以检索各种 DNS 记录，包括 A、AAAA、NS、MX 和 TXT 记录，从而提供目标 DNS 配置的全面概述。
- `Zone Transfer Attempts`该工具会自动尝试从已发现的名称服务器进行区域传输。虽然大多数服务器都配置为阻止未经授权的区域传输，但一次成功的尝试可以揭示大量的 DNS 信息。
- `Subdomain Brute-Forcing`支持`dnsenum`使用字典对子域名进行暴力枚举。这涉及系统地将潜在的子域名与目标域名进行比对，以识别有效的子域名。
- `Google Scraping`该工具可以抓取 Google 搜索结果，以查找可能未直接列在 DNS 记录中的其他子域名。
- `Reverse Lookup`：`dnsenum`可以执行反向 DNS 查询，以识别与给定 IP 地址关联的域名，从而有可能揭示托管在同一服务器上的其他网站。
- `WHOIS Lookups`该工具还可以执行 WHOIS 查询，以收集有关域名所有权和注册详细信息的信息。

让我们`dnsenum`通过演示如何枚举目标域名的子域名来实际了解一下`inlanefreight.com`。在本演示中，我们将使用[SecLists](https://github.com/danielmiessler/SecLists)`subdomains-top1million-20000.txt`中的字典，其中包含了最常用的 20000 个子域名.

```
dnsenum --enum inlanefreight.com -f /usr/share/seclists/Discovery/DNS/subdomains-top1million-20000.txt -r
```


在此命令中：

- `dnsenum --enum inlanefreight.com`我们指定要枚举的目标域，以及一些调整选项的快捷方式`--enum`。
- `-f /usr/share/seclists/Discovery/DNS/subdomains-top1million-20000.txt`：我们指定用于暴力破解的 SecLists 字典文件的路径。如果您的 SecLists 安装路径不同，请调整路径。
- `-r`：此选项启用递归子域暴力破解，这意味着如果`dnsenum`找到一个子域，它将尝试枚举该子域的子域。

# 虚拟主机


DNS 将流量定向到正确的服务器后，Web 服务器的配置就变得至关重要，它决定了如何处理传入的请求。像 Apache、Nginx 或 IIS 这样的 Web 服务器旨在在单个服务器上托管多个网站或应用程序。它们通过虚拟主机来实现这一点，虚拟主机允许它们区分不同的域名、子域名，甚至是具有不同内容的独立网站。

## 虚拟主机的工作原理

其核心`virtual hosting`在于网络服务器能够区分共享同一IP地址的多个网站或应用程序。这是通过利用请求头来实现的，请求头是网络浏览器发送的`HTTP Host`每个请求中包含的一段信息。`HTTP`

`VHosts`和之间的主要区别`subdomains`在于它们与`Domain Name System (DNS)`和 Web 服务器配置的关系。

- `Subdomains`这些是主域名的扩展名（例如，`blog.example.com`是的子域名`example.com`）。它们`Subdomains`通常有自己的IP地址`DNS records`，指向与主域名相同的IP地址或不同的IP地址。它们可用于组织网站的不同部分或服务。
- `Virtual Hosts`虚拟`VHosts`主机是 Web 服务器中的一种配置，允许在单个服务器上托管多个网站或应用程序。它们可以与顶级域名（例如 http://example.com `example.com`）或子域名（例如 http://example.com `dev.example.com`）关联。每个虚拟主机都可以有自己独立的配置，从而可以精确控制请求的处理方式。

如果虚拟主机没有 DNS 记录，您仍然可以通过修改`hosts`本地计算机上的文件来访问它。该`hosts`文件允许您手动将域名映射到 IP 地址，从而绕过 DNS 解析。

网站通常拥有一些非公开的子域名，这些子域名不会出现在 DNS 记录中。它们`subdomains`只能在内部访问或通过特定配置访问。一种通过测试不同的主机名与已知 IP 地址的匹配情况`VHost fuzzing`来发现公共和非公共子域名的技术是`subdomains``VHosts`

虚拟主机不仅可以配置为使用子域名，还可以配置为使用不同的域名。例如：

```
# Example of name-based virtual host configuration in Apache 
<VirtualHost *:80>     
ServerName www.example1.com    
DocumentRoot /var/www/example1 </VirtualHost> 
<VirtualHost *:80>     
ServerName www.example2.org    
DocumentRoot /var/www/example2 </VirtualHost> 
<VirtualHost *:80>     
ServerName www.another-example.net    
DocumentRoot /var/www/another-example 
</VirtualHost>
```

这里，`example.com` `example1.com`、`example2.org``example.com` 和 `example.com``another-example.net`是托管在同一服务器上的不同域名。Web 服务器使用`Host`请求头根据请求的域名提供相应的内容。

### 服务器虚拟主机查找


1. `Browser Requests a Website`当你在浏览器中输入域名（例如，`www.inlanefreight.com`）时，它会向与该域名的 IP 地址关联的 Web 服务器发起 HTTP 请求。
2. `Host Header Reveals the Domain`浏览器会在请求头中包含域名`Host`，该域名充当标签，告知 Web 服务器正在请求哪个网站。
3. `Web Server Determines the Virtual Host`Web 服务器收到请求后，检查`Host`标头，并查询其虚拟主机配置，以查找与所请求的域名匹配的条目。
4. `Serving the Right Content`：在识别出正确的虚拟主机配置后，Web 服务器会从其文档根目录中检索与该网站关联的相应文件和资源，并将它们作为 HTTP 响应发送回浏览器。

从本质上讲，`Host`标头起到开关的作用，使 Web 服务器能够根据浏览器请求的域名动态地确定要提供的网站。

### 虚拟主机类型

虚拟主机主要有三种类型，每种类型都有其优点和缺点：

1. `Name-Based Virtual Hosting`这种方法完全依赖于域名`HTTP Host header`来区分网站。它是最常用且最灵活的方法，因为它不需要多个 IP 地址。它经济高效、易于设置，并且支持大多数现代 Web 服务器。但是，它要求 Web 服务器支持基于名称的域名识别，`virtual hosting`并且可能对某些协议（例如 HTTPS）存在限制`SSL/TLS`。
2. `IP-Based Virtual Hosting`这种托管方式会为服务器上托管的每个网站分配一个唯一的 IP 地址。服务器会根据请求发送到的 IP 地址来决定要服务哪个网站。它不依赖于 DHCP 服务器`Host header`，可以与任何协议一起使用，并且能够更好地隔离网站。但是，它需要多个 IP 地址，这可能会比较昂贵且扩展性较差。
3. `Port-Based Virtual Hosting`不同的网站使用同一个 IP 地址上的不同端口。例如，一个网站可能通过 80 端口访问，而另一个网站则通过 8080 端口访问。`Port-based virtual hosting`当 IP 地址有限时可以使用这种方式，但它不如 8080 端口常用或友好，`name-based virtual hosting`而且可能需要用户在 URL 中指定端口号。

## 虚拟主机发现工具

虽然手动分析`HTTP headers`和逆向工程`DNS lookups`可能有效，但专业的工具可以`virtual host discovery tools`自动化和简化流程，使其更加高效和全面。这些工具采用各种技术来探测目标服务器并发现潜在威胁`virtual hosts`。

有多种工具可用于帮助发现虚拟主机：

| 工具                                                   | 描述                                         | 特征                        |
| ---------------------------------------------------- | ------------------------------------------ | ------------------------- |
| [gobuster](https://github.com/OJ/gobuster)           | 一款多用途工具，常用于目录/文件暴力破解，但对虚拟主机发现也十分有效。        | 速度快，支持多种HTTP方法，可以使用自定义字典。 |
| [feroxbuster](https://github.com/epi052/feroxbuster) | 与 Gobuster 类似，但采用 Rust 实现，以其速度和灵活性而闻名。     | 支持递归、通配符发现和各种过滤器。         |
| [ffuf](https://github.com/ffuf/ffuf)                 | 另一个快速的 Web 模糊测试工具，可以通过模糊测试`Host`标头来发现虚拟主机。 | 可自定义词表输入和筛选选项。            |
|                                                      |                                            |                           |

### Gobuster

Gobuster 是一款功能强大的工具，常用于目录和文件暴力破解，但它在虚拟主机发现方面也表现出色。它会系统地`Host`向目标 IP 地址发送带有不同头部信息的 HTTP 请求，然后分析响应以识别有效的虚拟主机。

要使用暴力破解法获取邮件头，需要准备以下几项`Host`：

1. `Target Identification`首先，确定目标网络服务器的IP地址。这可以通过DNS查询或其他侦察技术来实现。
2. `Wordlist Preparation`准备一个包含潜在虚拟主机名的字典。您可以使用预编译的字典，例如 SecLists，也可以根据目标公司的行业、命名规则或其他相关信息创建自定义字典。

暴力破解虚拟主机的命令`gobuster`通常如下所示：

        shell会话
`ziddzide@htb[/htb]$ gobuster vhost -u http://<target_IP_address> -w <wordlist_file> --append-domain`

- 该`-u`标志指定目标 URL（替换`<target_IP_address>`为实际 IP 地址）。
- 该`-w`标志指定单词列表文件（替换`<wordlist_file>`为您的单词列表路径）。
- 该`--append-domain`标志会将基本域名附加到单词列表中的每个单词。

在较新版本的 Gobuster 中，执行虚拟主机发现时，需要使用 `--append-domain` 标志将基本域名附加到词表中的每个单词。此标志确保 Gobuster 正确构建完整的虚拟主机名，这对于准确枚举潜在子域名至关重要。在旧版本的 Gobuster 中，此功能的处理方式不同，因此不需要 `--append-domain` 标志。旧版本的用户可能找不到或不需要此标志，因为该工具默认会附加基本域名，或者采用了不同的虚拟主机生成机制。

`Gobuster`程序会在发现潜在虚拟主机时将其输出。请仔细分析结果，并记录任何异常或有趣的发现。可能需要进一步调查以确认已发现虚拟主机的存在及其功能。

还有几个其他论点值得了解：

- 考虑使用该`-t`标志来增加线程数，以加快扫描速度。
- 该`-k`标志可以忽略 SSL/TLS 证书错误。
- 您可以使用该`-o`标志将输出保存到文件中，以便稍后进行分析。

# 证书透明度日志

SSL/TLS协议，它负责加密浏览器与网站之间的通信。SSL/TLS的核心是HTTPS文件`Secure Sockets Layer/Transport Layer Security`，这是一个用于验证网站身份并实现安全加密通信的小文件。`SSL/TLS``digital certificate`

然而，证书的颁发和管理过程并非万无一失。攻击者可以利用伪造或错误颁发的证书来冒充合法网站、拦截敏感数据或传播恶意软件。这时，证书透明度（CT）日志就派上了用场。

## 证书透明度日志

`Certificate Transparency`证书颁发机构( `CT`CA) 的证书日志是公开的、仅可追加的账本，用于记录 SSL/TLS 证书的颁发情况。每当 CA 颁发新证书时，都必须将其提交到多个证书颁发机构的证书日志中。这些日志由独立的组织维护，任何人都可以查阅。

可以将 CT 日志视为`global registry of certificates`一份透明且可验证的记录，其中包含为网站颁发的每个 SSL/TLS 证书的信息。这种透明性具有以下几个关键用途：

- `Early Detection of Rogue Certificates`通过监控证书颁发机构 (CT) 日志，安全研究人员和网站所有者可以快速识别可疑或错误颁发的证书。恶意证书是指未经授权或由受信任的证书颁发机构颁发的数字证书。及早发现这些证书有助于迅速采取行动，在它们被用于恶意目的之前将其吊销。
- `Accountability for Certificate Authorities`证书颁发机构 (CA) 的日志记录了其证书颁发行为，从而对其颁发行为进行问责。如果 CA 颁发的证书违反了规则或标准，相关记录将公开显示在日志中，可能导致制裁或信任度下降。
- `Strengthening the Web PKI (Public Key Infrastructure)`Web PKI 是支撑安全在线通信的信任系统。CT 日志通过提供证书的公开监督和验证机制，有助于增强 Web PKI 的安全性和完整性。

## 证书透明度日志的工作原理

证书透明度日志依​​赖于加密技术和公共问责制的巧妙结合：

1. `Certificate Issuance`当网站所有者向`SSL/TLS certificate`证书颁发机构 (CA ) 申请证书时`Certificate Authority (CA)`，CA 会进行尽职调查，以验证所有者的身份和域名所有权。验证通过后，CA 会颁发`pre-certificate`一个临时证书版本。
2. `Log Submission`证书颁发机构 (CA) 随后将此信息提交`pre-certificate`至多个证书颁发机构 (CT) 日志。每个日志由不同的组织运营，从而确保冗余和分散化。这些日志本质上是不可修改的`append-only`，这意味着一旦证书被添加，就无法修改或删除，从而确保历史记录的完整性。
3. `Signed Certificate Timestamp (SCT)`收到证书提交请求后`pre-certificate`，每个证书颁发机构日志都会生成一个证书提交证明`Signed Certificate Timestamp (SCT)`。该`SCT`证书提交证明是证书在特定时间提交到日志的加密证明。`SCT`然后，该证书提交证明会被包含在颁发给网站所有者的最终证书中。
4. `Browser Verification`当用户的浏览器连接到网站时，它会检查证书`SCTs`。这些证书`SCTs`会与公共的证书颁发记录 (CT) 日志进行比对，以确认证书已正确颁发和记录。如果证书`SCTs`有效，浏览器会建立安全连接；否则，浏览器可能会向用户显示警告。
5. `Monitoring and Auditing`证书颁发机构 (CT) 日志受到包括安全研究人员、网站所有者等在内的多个实体的持续监控`browser vendors`。这些监控人员会查找异常或可疑证书，例如颁发给他们不拥有的域名的证书，或违反行业标准的证书。如果发现任何问题，可以将其报告给相关机构`CA`进行调查，并可能吊销证书。

## CT日志和网络侦察

CT 日志提供了一种可靠高效的方式来发现子域名，无需进行穷举式暴力破解或依赖词表的完整性。它们提供了一个了解域名历史的独特窗口，可以揭示原本可能隐藏的子域名，从而显著增强您的侦察能力。

## 搜索 CT 日志

搜索CT日志有两种常用的方法：

|工具|主要特点|用例|优点|缺点|
|---|---|---|---|---|
|[crt.sh](https://crt.sh/)|用户友好的网页界面，按域名轻松搜索，显示证书详细信息、SAN 条目。|快速便捷的搜索，识别子域名，检查证书颁发历史记录。|免费、易用，无需注册。|筛选和分析选项有限。|
|[Censys](https://search.censys.io/)|功能强大的互联网连接设备搜索引擎，支持按域名、IP地址、证书属性进行高级筛选。|对证书进行深入分析，识别错误配置，查找相关证书和主机。|丰富的数据和筛选选项，API接口。|需要注册（提供免费版本）。|

### crt.sh 查找

虽然`crt.sh`它提供了一个便捷的网页界面，但您也可以利用其 API 直接从终端进行自动搜索。让我们看看如何使用 `http://localhost:8000``facebook.com`和`curl`` http://localhost:80000` 查找所有“dev”子域名`jq`：

```
ziddzide@htb[/htb]$ curl -s "https://crt.sh/?q=facebook.com&output=json" | jq -r '.[]  | select(.name_value | contains("dev")) | .name_value' | sort -u  *.dev.facebook.com *.newdev.facebook.com *.secure.dev.facebook.com dev.facebook.com devvm1958.ftw3.facebook.com facebook-amex-dev.facebook.com facebook-amex-sign-enc-dev.facebook.com newdev.facebook.com secure.dev.facebook.com
```

- `curl -s "https://crt.sh/?q=facebook.com&output=json"`此命令从 crt.sh 获取与域匹配的证书的 JSON 输出`facebook.com`。
- `jq -r '.[] | select(.name_value | contains("dev")) | .name_value'`这部分代码会筛选 JSON 结果，仅选择`name_value`字段（包含域名或子域名）包含字符串“ " `dev`” 的条目。该`-r`标志指示`jq`是否输出原始字符串。
- `sort -u`：这将按字母顺序对结果进行排序并删除重复项。

# 指纹采集

## 指纹识别技术

目前有多种技术可用于网络服务器和技术指纹识别：

- `Banner Grabbing`横幅广告抓取是指分析网络服务器和其他服务展示的横幅广告。这些横幅广告通常会泄露服务器软件、版本号和其他详细信息。
- `Analysing HTTP Headers`HTTP 标头随每个网页请求和响应一起传输，其中包含大量信息。`Server`标头通常会披露 Web 服务器软件，而`X-Powered-By`标头也可能揭示其他技术，例如脚本语言或框架。
- `Probing for Specific Responses`向目标发送精心设计的请求可以获取独特的响应，从而揭示特定的技术或版本。例如，某些错误消息或行为是特定 Web 服务器或软件组件的特征。
- `Analysing Page Content`网页的内容，包括其结构、脚本和其他元素，通常可以提供有关底层技术的线索。例如，版权声明可能表明所使用的特定软件。

目前存在多种工具可以自动执行指纹识别过程，这些工具结合了各种技术来识别 Web 服务器、操作系统、内容管理系统和其他技术：

|工具|描述|特征|
|---|---|---|
|`Wappalyzer`|浏览器扩展程序和在线服务，用于网站技术分析。|涵盖广泛的网络技术，包括内容管理系统、框架、分析工具等等。|
|`BuiltWith`|Web技术分析工具，可提供网站技术栈的详细报告。|提供免费和付费两种方案，详细程度各不相同。|
|`WhatWeb`|用于网站指纹识别的命令行工具。|利用庞大的签名数据库来识别各种网络技术。|
|`Nmap`|多功能网络扫描器，可用于各种侦察任务，包括服务和操作系统指纹识别。|可与脚本（NSE）配合使用，执行更专业的指纹识别。|
|`Netcraft`|提供一系列网络安全服务，包括网站指纹识别和安全报告。|提供有关网站技术、托管提供商和安全状况的详细报告。|
|`wafw00f`|专门用于识别 Web 应用程序防火墙 (WAF) 的命令行工具。|帮助确定是否存在WAF，如果存在，则确定其类型和配置。|


# vHost爆破与目录扫描

## Gobuster

```bash
gobuster -h
gobuster dir -h
gobuster dns -h
gobuster vhost -h
```

### 目录爆破

#### 基本使用

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


#### 指定扩展名

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

#### 指定线程

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


#### 指定状态码

只显示：

```
200 204 301 302 307 401 403
```

例如：

```bash
-s 200,301,302,403
```

#### 排除状态码

```bash
-b 404
```


#### 指定 User-Agent

```bash
-a "Mozilla/5.0"
```

---

### DNS 爆破

#### 基本使用

```bash
gobuster dns \
-d example.com \
-w subdomains.txt
```

例如：

```
www mail vpn dev
```

输出：

```
www.example.com
mail.example.com
```

###  VHOST 爆破

#### 什么是 VHOST？

服务器根据 Host 头返回不同网站：

```
Host: admin.example.com
Host: mail.example.com
Host: web.example.com
```

#### 基本使用

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

#### append-domain

开启：

```bash
--append-domain
```

例如：

字典：

```
admin mail web
```

自动变成：

```
admin.example.com
mail.example.com
web.example.com
```

## ffuf

```bash
ffuf -h
```

###  目录扫描

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

### 文件扩展扫描

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

###  VHOST 爆破

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

### GET 参数爆破

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

### POST 参数

```bash
ffuf \
-w users.txt \
-u http://target/login \
-X POST \
-d "username=FUZZ&password=test"
```

### Header 爆破

```bash
ffuf \
-w headers.txt \
-u http://target \
-H "FUZZ:test"
```

### ffuf 过滤

#### 过滤状态码

```bash
-fc 404
```

过滤：

```
404
```

#### 只显示状态码

```bash
-mc 200
```

或者：

```bash
-mc 200,301,302
```

#### 按大小过滤

例如：

```
Size:116
```

过滤：

```bash
-fs 116
```

#### 按单词过滤

```
Words:4
```

过滤：

```bash
-fw 4
```

#### 按行数过滤

```
Lines:2
```

过滤：

```bash
-fl 2
```

#### 自动过滤

推荐：

```bash
-ac
```

自动过滤 Wildcard。


## Wildcard VHOST

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


## 问题

目标系统 154.57.164.70:31462

### Information Gathering - Web Edition

目标系统：`154.57.164.70:31462`

#### 1. What is the IANA ID of the registrar of the inlanefreight.com domain?

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


#### 2. What http server software is powering the inlanefreight.htb site on the target system?

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

#### 3. What is the API key in the hidden admin directory that you have discovered on the target system?

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

#### 4. After crawling the inlanefreight.htb domain on the target system, what is the email address you have found?

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

#### 5. What is the API key the inlanefreight.htb developers will be changing to?

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

### webfuzzing

#### webfuzzing_hidden_path：目录与文件模糊测试

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
#### recursive_fuzz：递归爆破

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
#### GET 参数模糊测试

我先访问 `get.php` 观察返回提示，然后使用 `ffuf` 对 `x` 参数进行模糊：

```bash
ffuf -u 'http://154.57.164.78:30291/get.php?x=FUZZ' -w /usr/share/seclists/Discovery/Web-Content/common.txt
```

命中后直接 `curl` 验证：

```bash
curl 'http://154.57.164.78:30291/get.php?x=OA_HTML'
# -> HTB{g3t_fuzz1ng_succ3ss}
```
#### POST 参数模糊测试

POST 参数需要关注 `Content-Type`（例如 `application/x-www-form-urlencoded`）。我用 `ffuf` 指定头并模糊 `y`：

```bash
ffuf -u http://154.57.164.78:30291/post.php -H 'Content-Type: application/x-www-form-urlencoded' -d 'y=FUZZ' -w /usr/share/seclists/Discovery/Web-Content/common.txt
```

命中后用 `curl` 验证：

```bash
curl -d 'y=SUNWmc' http://154.57.164.78:30291/post.php
# -> HTB{p0st_fuzz1ng_succ3ss}
```

#### GoBuster：vhost 与子域名爆破

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
#### 可选练习（POST）

流程同上：用 `ffuf` 模糊 POST 参数并用 `curl` 验证。

```bash
ffuf -u http://154.57.164.68:31736/post.php -w /usr/share/seclists/Discovery/Web-Content/common.txt -H 'Content-Type: application/x-www-form-urlencoded' -d 'y=FUZZ'
curl -d 'y=SUNWmc' http://154.57.164.68:31736/post.php
```
#### 隐藏目录与 tar.gz 分析

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

### Web-Fuzzing-Skills-Assessment

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