---
title: "dns子域名爆破工具"
published: 2026-06-12
updated: 2026-06-12
draft: false
description: "dnsenum 是一个功能强大且应用广泛的命令行工具，用 Perl 编写。它是一个全面的 DNS 侦察工具包，提供各种功能来收集目标域的 DNS 基础架构和潜在…"
image: ""
tags:
  - 信息收集
category: 网络安全
pinned: false
comment: true
author: Ziddzide
---

## DNS枚举

dnsenum 是一个功能强大且应用广泛的命令行工具，用 Perl 编写。它是一个全面的 DNS 侦察工具包，提供各种功能来收集目标域的 DNS 基础架构和潜在子域的信息。该工具提供以下几个关键功能：

### dnsenum 主要功能

- **DNS Record Enumeration**：dnsenum 可以检索各种 DNS 记录，包括 A、AAAA、NS、MX 和 TXT 记录，从而提供目标 DNS 配置的全面概述。

- **Zone Transfer Attempts**：该工具会自动尝试从已发现的名称服务器进行区域传输。虽然大多数服务器都配置为阻止未经授权的区域传输，但一次成功的尝试可以揭示大量的 DNS 信息。

- **Subdomain Brute-Forcing**：支持 dnsenum 使用字典对子域名进行暴力枚举。这涉及系统地将潜在的子域名与目标域名进行比对，以识别有效的子域名。

- **Google Scraping**：该工具可以抓取 Google 搜索结果，以查找可能未直接列在 DNS 记录中的其他子域名。

- **Reverse Lookup**：dnsenum 可以执行反向 DNS 查询，以识别与给定 IP 地址关联的域名，从而有可能揭示托管在同一服务器上的其他网站。

- **WHOIS Lookups**：该工具还可以执行 WHOIS 查询，以收集有关域名所有权和注册详细信息的信息。

### 实际使用示例

让我们通过演示如何枚举目标域名的子域名来实际了解一下 dnsenum。在本演示中，我们将使用 SecLists 中的 `subdomains-top1million-20000.txt` 字典，其中包含了最常用的 20000 个子域名。

```bash
dnsenum --enum inlanefreight.com -f /usr/share/seclists/Discovery/DNS/subdomains-top1million-20000.txt -r
```

#### 命令参数说明

| 参数 | 说明 |
|------|------|
| `dnsenum --enum inlanefreight.com` | 指定要枚举的目标域，以及一些调整选项的快捷方式 `--enum`。 |
| `-f /usr/share/seclists/Discovery/DNS/subdomains-top1million-20000.txt` | 指定用于暴力破解的 SecLists 字典文件的路径。如果您的 SecLists 安装路径不同，请调整路径。 |
| `-r` | 启用递归子域暴力破解，这意味着如果 dnsenum 找到一个子域，它将尝试枚举该子域的子域。 |
