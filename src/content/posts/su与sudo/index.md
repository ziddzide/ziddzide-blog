---
title: "su与sudo"
published: 2026-05-20
updated: 2026-05-20
draft: false
description: "su             切到root，需要root密码"
image: ""
tags:
  - Linux基础
category: Linux运维
pinned: false
comment: true
author: Ziddzide
---

<!-- AI: Linux-su与sudo | su/sudo/sudo -i 区别与审计完整性 | 审计追责核心 | 关键词: sudo, su, sudoers, 审计, auth.log, sulog, 不可抵赖性 -->

# su 与 sudo：审计完整性的对决

---

## 卡片1：su —— 切换用户，需目标用户密码

### 核心理解

`su` 用于切换到另一个用户的身份。不指定用户名时默认切换到 root，但**必须输入目标用户的密码**。

```bash
su            # 切到root，需要root密码
su - alice    # 切到alice，需要alice的密码
```

### 安全缺陷

| 问题 | 说明 |
|------|------|
| **密码共享** | 多管理员环境下必须分发 root 密码 —— 安全大忌 |
| **无法追责** | 系统日志只记录"谁切换了"，无法追溯他作为 root 具体敲了什么命令 |
| **抵赖空间** | 蓄意破坏或误操作后可以说"不是我干的" |

### 日志位置

```
/var/adm/sulog         # 部分系统
/var/log/sulog         # 部分系统
```

### 记忆锚点

> 用宾馆总房卡，知道密码就能进，但旅馆不知道进房后具体动了什么。

---

## 卡片2：sudo —— 以指定用户身份执行单条命令，需自己密码

### 核心理解

`sudo` 允许授权用户**临时代理 root 权限执行一条命令**。验证的是**使用者自己的密码**，不是 root 的密码。授权由 `/etc/sudoers` 精确控制。

```bash
sudo systemctl restart nginx          # 单次提权
sudo !!                                # 用sudo重复上一条命令
```

### 安全优势

| 优势 | 说明 |
|------|------|
| **无需分发 root 密码** | 根凭据永不外泄 |
| **精细权限控制** | `/etc/sudoers` 可限制：谁、在哪台机器、以谁的身份、运行哪些命令 |
| **完整审计** | 按人、按命令粒度记录日志，谁用 sudo 干了什么都留存证据 |

### 日志位置

```
/var/log/secure         # RHEL/CentOS系
/var/log/auth.log       # Debian/Ubuntu系
```

### 记忆锚点

> 用自己工卡刷特权柜，刷一次记一次，精确留痕。

---

## 卡片3：su 与 sudo 的根本对决

| 维度 | su | sudo |
|------|-----|------|
| 密码要求 | 必须知道 **root** 密码 | 只需知道**自己**的密码 |
| 权限粒度 | 全有或全无，直接拿到 root shell | 可限制到单条命令、单台主机 |
| 审计粒度 | 只能记录"有人成了王"，后面盲目 | 逐条命令记录：谁、什么时间、在哪、干了什么 |
| 密码泄露风险 | 高，知道的人越多越容易泄露 | 低，root 密码由极少人掌握甚至没人掌握 |
| 离职处理 | 必须立刻改 root 密码并通知所有管理员 | 在 sudoers 中移除离职者条目即可 |

**一句话**：在多用户环境里，`su` 如同全员共用匿名房卡，`sudo` 是实名指纹锁加签单簿。

---

## 卡片4：`sudo -i` 与审计完整性的关系

### 核心认知

`sudo su` 和 `sudo -i` 功能几乎相同（都获得 root shell），但在**审计责任的完整性**上截然不同。

### 瓶颈在于审计溯源

```
sudo su:
  日志: alice执行了 sudo su
  之后: su打开的root shell中, 所有后续操作 sudo 不再记录
  结果: 进入了审计盲区

sudo -i:
  日志: alice请求了一个交互式root shell (sudo自身启动)
  之后: 整个shell会话仍在 sudo 的上下文中
  结果: 所有操作都可追溯到 alice
```

### 结论

推荐 `sudo -i` 不是因为它功能更多，而是因为它确保了审计的完整性。这遵循安全铁律：**一个安全的系统，不是不能做坏事，而是任何坏事都必然能查到是谁干的。**

---

## 日志速查卡

| 使用方式 | 日志文件 | 记录内容 |
|---------|---------|---------|
| **su** | `/var/log/sulog` | 仅记录切换会话本身 |
| **sudo** | `/var/log/secure`(RHEL) 或 `/var/log/auth.log`(Debian) | 每次 sudo 提权的完整细节 |

### 事故调查口诀

1. 先查 `auth.log` / `secure` → 找人、找命令、找时间
2. 如果是 `su` 切换后的盲区 → 结合 `~/.bash_history` 和 `auditd` 做进一步溯源
3. 如果是 `sudo -i` → 所有操作在 sudo 日志中可查

---

## 现代最佳实践

```bash
# 1. 禁用root直接SSH
# /etc/ssh/sshd_config: PermitRootLogin no

# 2. 管理员通过sudo提权
sudo -i                         # 正确的root shell获取方式
# 而不是
sudo su -                       # 审计盲区，应避免

# 3. /etc/sudoers 权限最小化示例
alice ALL=(ALL) /bin/systemctl restart nginx   # 只能重启nginx
bob   ALL=(ALL) ALL                             # 全部权限(谨慎授予)

# 4. root密码存入物理保险柜
# 生产环境无人知道root密码，所有操作通过sudo
```

---

## 关联知识

- [[Linux-基础速查]]
- [[Linux-安全加固]]
- [[Linux-特殊权限]]
