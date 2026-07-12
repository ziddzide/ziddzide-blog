---
title: "Vantage"
published: 2026-05-23
updated: 2026-05-23
draft: false
description: "一家小公司将其部分资源转移到了私有云安装中。开发人员将重定向到其Web服务器上的仪表板。安全团队收到一名涉嫌攻击者的邮件,称用户数据被泄露."
image: ""
tags:
  - 流量分析
category: 网络安全
pinned: false
comment: true
author: Ziddzide
---

> A small company moved some of its resources to a private cloud installation. The developers left the redirect to the dashboard on their web server. The security team got an email from the alleged attacker stating that the user data was leaked. It is up to you to investigate the situation.

一家小公司将其部分资源转移到了私有云安装中。开发人员将重定向到其Web服务器上的仪表板。安全团队收到一名涉嫌攻击者的邮件,称用户数据被泄露.

下载文件:
![](https://ziddzide-pirture-1406647554.cos.ap-beijing.myqcloud.com/post/Vantage/vantage2.png)
使用`wireshark`打开文件进行审查,但是审查之前需要确认这两个文件来自不同的服务器,但是并不清楚之间的关系,优先查看`web-server` 

面对未知的pcap首先需要知道存在的协议有哪些:

```
Frame: 物理层的数据帧概况
EthernetII:数据链路层以太网帧头部信息。
Internet Protocol Version 4:互联网层IP包头部信息。
Transmission Control Protocol:传输层的数据段头部信息，此处是TCP协议。
User Datagram Protocol:UDP协议
Hypertext Transfer Protocol：应用层的信息，此处是HTTP协议
```

### 攻击者使用的模糊扫描工具是什么

![](https://ziddzide-pirture-1406647554.cos.ap-beijing.myqcloud.com/post/Vantage/vantage3.png)

基础的http携带的信息过多审查困难,但是 `Html from URL Endecode` 却只有8份,从此处开始查看会好很多,`Line-Based text data`虽然可能还有真实信息但是大部分都是模糊信息,查看优先级很低

所以直接查看少的那部分:
![](https://ziddzide-pirture-1406647554.cos.ap-beijing.myqcloud.com/post/Vantage/vantage4.png)

可以看到是`post`请求而且是敏感的认证页面,所以重点关注这个协议

筛选过后发现有用的其实只有4份,因为发现其中有4份是相同的来源ip和目的ip,应该是反向代理

![](https://ziddzide-pirture-1406647554.cos.ap-beijing.myqcloud.com/post/Vantage/vantage5.png)综合来看就暴露出以下问题,通过图片来看:
![](https://ziddzide-pirture-1406647554.cos.ap-beijing.myqcloud.com/post/Vantage/vantage6.png)
全都是无意义的GET请求,说明工具的模糊扫描和自动化扫描

接着查看controller的pcap文件:筛选ip
![](https://ziddzide-pirture-1406647554.cos.ap-beijing.myqcloud.com/post/Vantage/vantage7.png)

先回到`server`看看攻击者具体的行为再和`controller`对照起来:

![](https://ziddzide-pirture-1406647554.cos.ap-beijing.myqcloud.com/post/Vantage/vantage8.png)
通过筛选agent头直接锁定了混淆工具

`Fuzz Faster U Fool v2.1.0-dev`

同时针对的域名是`cloud`

![](https://ziddzide-pirture-1406647554.cos.ap-beijing.myqcloud.com/post/Vantage/vantage9.png)

已经知道get都是无用的扫描,只关注那四个`post`请求即可,追踪最后一段请求的http流果然看到302重定向,所以一共四次攻击,第四次成功

![](https://ziddzide-pirture-1406647554.cos.ap-beijing.myqcloud.com/post/Vantage/vantage10.png)

### 攻击者何时下载了OpenStack API远程访问配置文件？

通过文件导出功能发现:
![](https://ziddzide-pirture-1406647554.cos.ap-beijing.myqcloud.com/post/Vantage/vantage13.png)
![](https://ziddzide-pirture-1406647554.cos.ap-beijing.myqcloud.com/post/Vantage/vantage12.png)

这里可以看到有两个查询到的结果,第二张图片是顺位文件名叫做`horzion+openstack_dashboard`相关搜索查询出来的,下载的是js文件,所以返回去查看第一类结果得到:
![](https://ziddzide-pirture-1406647554.cos.ap-beijing.myqcloud.com/post/Vantage/vantage14.png)



查看`controller`协议分级:

![](https://ziddzide-pirture-1406647554.cos.ap-beijing.myqcloud.com/post/Vantage/vantage11.png)

看到大量和`sql`相关的协议推断应该是负责调用数据库的网络中的一环

但是看到这里我毫无头绪

先筛选http协议看看攻击者ip:
![](https://ziddzide-pirture-1406647554.cos.ap-beijing.myqcloud.com/post/Vantage/vantage15.png)

确定入侵时间.

### 攻击者访问的默认项目的项目ID是什么?
返回查看`openrnc`文件的载荷即可得到答案

![](https://ziddzide-pirture-1406647554.cos.ap-beijing.myqcloud.com/post/Vantage/vantage16.png)

`export OS_PROJECT_ID=9fb84977ff7c4a0baf0d5dbb57e235c7\n`

### Swift服务的端点URL是什么？

---

> 以下是ai回复

在 OpenStack 里，当用户执行 `openstack container list`或上传文件到 Swift 时，OpenStack CLI 会悄悄帮你做一件事：**向 Keystone（身份认证服务，通常是 5000 端口）要一份“服务名录”**。

在这份名录（Catalog）里，详细记录了所有服务的地址，比如计算服务（Nova）、网络服务（Neutron），当然也包括**对象存储服务（Swift）**的 Endpoint。

所以，我们要找的 URL，就藏在这次 Keystone 的响应包里。

直接用 Wireshark 过滤出 Keystone 的响应包，就能一目了然：

1. **设置过滤条件**：
    
    在 Wireshark 顶部的过滤栏输入以下表达式，然后回车：

  ```
  tcp.port == 5000 && http
  ```
  
 _(注：这会把所有经过 5000 端口的 HTTP 流量筛出来，通常这就是 Keystone 的流量)_

> 之后是我的回复

筛选5000端口发现没有任何流量,所以这个端口可能已经收到了更改,继续追问ai

> 下面这段话是ai回复

既然端口是变的，我们就直接搜 OpenStack 认证返回包里的标志性字段。在 Wireshark 中，无论端口是什么，HTTP 的文本特征是无法隐藏的。

在 `controller.pcap`中，在 Wireshark 顶部的过滤栏输入以下过滤语句：

```
http && frame contains "catalog"
```

_(注：由于 Linux 系统是大小写敏感的，如果搜 `catalog`没结果，可以试试 `Catalog`)_

---

于是直接追查catalog果然得到了结果

直接追踪tcp流:
![](https://ziddzide-pirture-1406647554.cos.ap-beijing.myqcloud.com/post/Vantage/vantage17.png)

不仅得到了端口号还验证了项目id

### 攻击者发现了多少个object？
`/v1/AUTH_941a155a212d4bad9f8db995074bb8e1`将其作为筛选器看看线索

最后还是使用统计功能查看了http请求,这个uri筛选,少输入了不给显示啊

![](https://ziddzide-pirture-1406647554.cos.ap-beijing.myqcloud.com/post/Vantage/vantage18.png)

等下,我审计了这个uri结果上一问的答案有问题
导致我输入了错误的东西
```
/v1/AUTH_941a155a212d4bad9f8db995074bb8e1将其作为筛选器看看线索
```
这个是出现错误的,,应该是我上面最近的一张图内的东西,

我看了项目id和端点url,这个错误的答案是我从最近往上看第二张图片内的答案我先把url都列举出来看看有哪些错误

`"interface": "public"`：
- URL: `http://134.209.71.220:8080/v1/AUTH_941a155a212d4bad9f8db995074bb8e1`
- 这是给普通用户或外部服务调用的公共 API 地址。

> 问题有很大是这个原因

那么之所以uri筛选没有得到理想结果也是因为这个原因

![](https://ziddzide-pirture-1406647554.cos.ap-beijing.myqcloud.com/post/Vantage/vantage20.png)重新筛选得到三个`object`

```
/[]/name:dev-files
/[]/name:employee-data
/[]/name:user-data
```

### 攻击者何时下载了敏感用户数据文件？（UTC）

![](https://ziddzide-pirture-1406647554.cos.ap-beijing.myqcloud.com/post/Vantage/vantage21.png)![](https://ziddzide-pirture-1406647554.cos.ap-beijing.myqcloud.com/post/Vantage/vantage22.png)

### 敏感用户数据文件中有多少用户记录？

就在倒数第二张图片里蓝底信息中,数仔细即可

### 为了持久化，攻击者创建了一个拥有管理员权限的新用户。新用户的用户名是什么？

> 下面这个是ai给的解决方案

在云环境（OpenStack）的取证中，攻击者为了实现持久化，最常见的手法确实是通过 Keystone（身份认证服务）创建新用户并赋予高权限。
在 OpenStack 中，创建用户通常有两种方式：一是通过命令行工具（如 `openstack user create`），二是直接调用 Keystone 的 RESTful API。无论是哪种，**它们最终都会通过网络向 Keystone 服务发送包含用户名和密码的 HTTP POST 请求**。
可以直接在 Wireshark 中使用以下过滤规则，精准锁定攻击者创建用户的瞬间：

**方法 1：过滤 Keystone 创建用户的特定 API 接口（最精准）**

```
http.request.uri contains "/identity/v3/users"
```

_(注：OpenStack 创建用户的 API 端点通常包含 `/identity/v3/users`，通过 POST 方法提交新用户数据)_

**方法 2：过滤包含“创建/密码”关键词的 HTTP 请求正文**

```
http.request.method == POST && http contains "password"
```

_(注：创建用户必然会在请求体中包含 `password`字段)_

---

![](https://ziddzide-pirture-1406647554.cos.ap-beijing.myqcloud.com/post/Vantage/vantage23.png)

发现两个数据包很可以,第一个是`name=jellibean`,第二个就是`201`

### 新用户的密码是什么？
![](https://ziddzide-pirture-1406647554.cos.ap-beijing.myqcloud.com/post/Vantage/vantage24.png)

完成 _Vantage_这个 Sherlock 挑战，是对云基础设施流量包（pcap）进行全流程的深度梳理。
起初，受传统内网渗透思维的影响。在面对“创建管理员（Task 9）”这一任务时，下意识地将其等同于 Linux 提权，想要在流量中寻找 `sudo`、缺乏对 OpenStack 云环境基础架构与身份鉴别机制的了解。

而且梳理过后了解了攻击者视角,通过传统漏洞入侵服务器下载云环境账户凭证顶替管理员私自盗取用户隐私并且创建持久化账户
