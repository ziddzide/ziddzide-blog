---
title: "DNS与dig"
published: 2026-06-11
updated: 2026-06-11
draft: false
description: "这些记录存储与域名相关的不同类型的数据，每种记录都有其特定的用途："
image: ""
tags:
  - 信息收集
category: 网络安全
pinned: false
comment: true
author: Ziddzide
---

这些记录存储与域名相关的不同类型的数据，每种记录都有其特定的用途：

| 记录类型 | 姓名 | 描述 | 区域文件示例 |
|---------|------|------|-------------|
| A | 地址记录 | 将主机名映射到其 IPv4 地址。 | www.example.com. 在 192.0.2.1 |
| AAAA | IPv6地址记录 | 将主机名映射到其 IPv6 地址。 | www.example.com. 在 AAAA 2001:db8:85a3::8a2e:370:7334 |
| CNAME | 规范名称记录 | 为主机名创建别名，将其指向另一个主机名。 | blog.example.com. 在 CNAME 中 webserver.example.net. |
| MX | 邮件交换记录 | 指定负责处理该域电子邮件的邮件服务器。 | example.com. IN MX 10 mail.example.com. |
| NS | 名称服务器记录 | 将 DNS 区域委托给特定的权威名称服务器。 | example.com. IN NS ns1.example.com. |
| TXT | 文本记录 | 存储任意文本信息，通常用于域验证或安全策略。 | example.com. IN TXT "v=spf1 mx -all"（SPF 记录） |
| SOA | 权限记录开始 | 指定有关 DNS 区域的管理信息，包括主名称服务器、负责人电子邮件和其他参数。 | example.com. 在 SOA 中 ns1.example.com. admin.example.com. 2024060301 10800 3600 604800 86400 |
| SRV | 服务记录 | 定义特定服务的主机名和端口号。 | _sip._udp.example.com. 在 SRV 10 5 5060 sipserver.example.com. |
| PTR | 指针记录 | 用于反向 DNS 查询，将 IP 地址映射到主机名。 | 1.2.0.192.in-addr.arpa. 在 PTR www.example.com. |

## DNS 工具

DNS 侦察是指利用专门设计的工具来查询 DNS 服务器并提取有价值的信息。以下是网络侦察专业人员常用的一些最流行、功能最全面的工具：

| 工具 | 主要特点 | 用例 |
|------|--------|------|
| dig | 功能全面的 DNS 查询工具，支持各种查询类型（A、MX、NS、TXT 等）和详细输出。 | 手动 DNS 查询、区域传输（如果允许）、DNS 问题排查以及 DNS 记录的深入分析。 |
| nslookup | 更简单的 DNS 查询工具，主要用于 A、AAAA 和 MX 记录。 | 基本 DNS 查询，快速检查域名解析和邮件服务器记录。 |
| host | 简洁高效的 DNS 查询工具，输出结果清晰明了。 | 快速检查 A、AAAA 和 MX 记录。 |
| dnsenum | 自动 DNS 枚举工具、字典攻击、暴力破解、区域传输（如果允许）。 | 高效发现子域名并收集 DNS 信息。 |
| fierce | 具有递归搜索和通配符检测功能的 DNS 侦察和子域名枚举工具。 | 用于 DNS 侦察、识别子域和潜在目标的友好用户界面。 |
| dnsrecon | 结合多种 DNS 侦察技术，并支持多种输出格式。 | 全面枚举 DNS 记录，识别子域，并收集 DNS 记录以进行进一步分析。 |
| theHarvester | OSINT 工具，可从各种来源收集信息，包括 DNS 记录（电子邮件地址）。 | 从多个来源收集与域相关的电子邮件地址、员工信息和其他数据。 |
| Online DNS Lookup Services | 用于执行 DNS 查询的用户友好界面。 | 快速简便的 DNS 查询，在无法使用命令行工具时非常方便，可用于检查域名可用性或基本信息。 |

## 常用挖掘命令

| 命令 | 描述 |
|------|------|
| dig domain.com | 对域执行默认 A 记录查找。 |
| dig domain.com A | 检索与域关联的 IPv4 地址（A 记录）。 |
| dig domain.com AAAA | 获取与域关联的 IPv6 地址（AAAA 记录）。 |
| dig domain.com MX | 查找负责该域的邮件服务器（MX 记录）。 |
| dig domain.com NS | 确定域的权威名称服务器。 |
| dig domain.com TXT | 检索与该域关联的所有 TXT 记录。 |
| dig domain.com CNAME | 检索域的规范名称（CNAME）记录。 |
| dig domain.com SOA | 检索域的起始授权（SOA）记录。 |
| dig @1.1.1.1 domain.com | 指定要查询的特定名称服务器；在本例中为 1.1.1.1 |
| dig +trace domain.com | 显示完整的 DNS 解析路径。 |
| dig -x 192.168.1.1 | 对 IP 地址 192.168.1.1 执行反向查找，以查找关联的主机名。您可能需要指定名称服务器。 |
| dig +short domain.com | 对问题提供简短明了的答案。 |
| dig +noall +answer domain.com | 仅显示查询输出的答案部分。 |
| dig domain.com ANY | 检索域的所有可用 DNS 记录（注意：ANY 根据 RFC 8482，许多 DNS 服务器会忽略查询以减少负载并防止滥用）。 |

## 区域传输

### DNS 区域传输原理

DNS 区域传输（AXFR）是辅助 DNS 从主 DNS 同步整个域名记录数据库的过程。其步骤如下：

1. **发起请求**：辅助 DNS 向主服务器发送 AXFR 请求
2. **传输 SOA 记录**：主服务器返回起始授权（SOA）记录，包含序列号等信息
3. **传输所有记录**：批量传输 A、AAAA、MX、CNAME、NS 等所有 DNS 记录
4. **传输完成**：主服务器发送完成信号，辅助服务器确认接收

### 区域传输攻击

#### 命令示例

```bash
dig axfr example.com @ns1.example.com
```

```
┌──(luxin㉿shadow)-[~]
└─$ dig axfr inlanefreight.htb @10.129.39.203

; <<>> DiG 9.20.20-1-Debian <<>> axfr inlanefreight.htb @10.129.39.203
;; global options: +cmd
inlanefreight.htb.      604800  IN      SOA     inlanefreight.htb. root.inlanefreight.htb. 2 604800 86400 2419200 604800
inlanefreight.htb.      604800  IN      NS      ns.inlanefreight.htb.
admin.inlanefreight.htb. 604800 IN      A       10.10.34.2
ftp.admin.inlanefreight.htb. 604800 IN  A       10.10.34.2
careers.inlanefreight.htb. 604800 IN    A       10.10.34.50
dc1.inlanefreight.htb.  604800  IN      A       10.10.34.16
dc2.inlanefreight.htb.  604800  IN      A       10.10.34.11
internal.inlanefreight.htb. 604800 IN   A       127.0.0.1
admin.internal.inlanefreight.htb. 604800 IN A   10.10.1.11
wsus.internal.inlanefreight.htb. 604800 IN A    10.10.1.240
ir.inlanefreight.htb.   604800  IN      A       10.10.45.5
dev.ir.inlanefreight.htb. 604800 IN     A       10.10.45.6
ns.inlanefreight.htb.   604800  IN      A       127.0.0.1
resources.inlanefreight.htb. 604800 IN  A       10.10.34.100
securemessaging.inlanefreight.htb. 604800 IN A  10.10.34.52
test1.inlanefreight.htb. 604800 IN      A       10.10.34.101
us.inlanefreight.htb.   604800  IN      A       10.10.200.5
cluster14.us.inlanefreight.htb. 604800 IN A     10.10.200.14
messagecenter.us.inlanefreight.htb. 604800 IN A 10.10.200.10
ww02.inlanefreight.htb. 604800  IN      A       10.10.34.112
www1.inlanefreight.htb. 604800  IN      A       10.10.34.111
inlanefreight.htb.      604800  IN      SOA     inlanefreight.htb. root.inlanefreight.htb. 2 604800 86400 2419200 604800
;; Query time: 343 msec
;; SERVER: 10.129.39.203#53(10.129.39.203) (TCP)
;; WHEN: Fri Jun 12 00:16:19 CST 2026
;; XFR size: 22 records (messages 1, bytes 594)
```

#### 结果分析

| 结果 | 含义 |
|------|------|
| 成功返回所有记录 | DNS 服务器配置错误，允许未授权的区域传输 |
| `Transfer failed` | 区域传输被禁止（正确的安全配置） |

#### 安全威胁

AXFR 允许攻击者一次性获取目标域的所有子域和服务器信息，这是渗透测试中的关键信息收集技术。若管理员错误允许任意客户端执行 AXFR，整个 DNS 区域的敏感信息就会被泄露。
