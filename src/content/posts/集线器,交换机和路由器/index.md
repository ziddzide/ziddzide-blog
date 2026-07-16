---
title: 集线器,交换机和路由器
published: 2026-07-13
updated: 2026-07-13
draft: false
description: 常见网络设备
image: ""
tags:
  - 集线器
  - 交换机
  - 路由器
category: 数据通信
pinned: false
comment: true
author: Ziddzide
---
# 集线器

## 工作原理

没有MAC地址表,工作在物理层,相当于物理信号复制器,会把一台内网环境内的pc传出的信号传递给和集线器连接的所有pc上

## 缺陷

1. 不安全: 抓包就能监听所有流量
2. 半双工: 一次只允许一台机器发送信号
```
如果两个电信号在Hub内部碰撞:
	1. 数据损坏
	2. 两台机器都监测到冲突,等随机事件重发
	3. 设备越多冲突越频繁,有效带宽趋近于零
```
3. 带宽共享: 对带宽的有效利用极低

# 交换机

## 工作原理

交换机又叫switch,工作在数据链路层,转发信息而不是广播

## MAC地址表

交换机内部维护了一张MAC地址表,会将端口号和MAC地址一一对应,端口长期未使用会把对应的MAC地址过期并删除

### 三种特殊情况

#### 信号出错

```
MAC报文报头最后四位FCS存放了发送方通过循环冗余校验(CRC)计算得到的值,交换机收到信息后计算一次CRC和FCS里的值进行对比,如果校验出错直接丢弃
```

#### 目标MAC地址端口和包源端口相同

```
直接丢弃这个包
```

#### 找不到MAC地址

```
交换机广播,arp协议
```

## 交换机和网桥的区别

```
网桥相当于只有两个网线口的交换机
```

## 三层交换机

```
时常提到的交换机是二层交换机,指工作在第二层,三层交换机指的是路由器
```

# 路由器

涉及到的内容在
* [https://ziddzide.github.io/ziddzide-blog/posts/子网掩码和子网划分/](https://ziddzide.github.io/ziddzide-blog/posts/%E5%AD%90%E7%BD%91%E6%8E%A9%E7%A0%81%E5%92%8C%E5%AD%90%E7%BD%91%E5%88%92%E5%88%86/)
* [https://ziddzide.github.io/ziddzide-blog/posts/动态路由协议/](https://ziddzide.github.io/ziddzide-blog/posts/%E5%8A%A8%E6%80%81%E8%B7%AF%E7%94%B1%E5%8D%8F%E8%AE%AE/)

# 额外的内容

[https://ziddzide.github.io/ziddzide-blog/posts/广播域和冲突域](https://ziddzide.github.io/ziddzide-blog/posts/%7f%ad%df%8c%b2%81%df/)
