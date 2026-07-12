---
title: "应急响应-命令"
published: 2026-06-09
updated: 2026-06-09
draft: false
description: "查看当前运行的所有进程："
image: ""
tags:
  - 应急响应
category: 网络安全
pinned: false
comment: true
author: Ziddzide
---

# Linux 系统应急命令

## 进程管理

查看当前运行的所有进程：
```bash
ps -aux      # 显示所有进程的详细信息
ps -ef       # 以全格式列出所有进程
top          # 实时显示进程信息
```

## 网络连接

查看网络连接状态：
```bash
netstat -antup           # 显示所有网络连接及其状态
ss -antup                # netstat 的现代替代品
lsof -i                  # 列出所有打开的网络连接
netstat -antup | grep ESTABLISHED  # 查看已建立的连接
lsof -i | grep ESTABLISHED         # 列出已建立的连接
```

## 用户管理

查看登录用户信息：
```bash
who       # 显示当前登录的用户
w         # 显示当前登录用户及其活动
last      # 显示最近登录的用户列表
lastlog   # 显示所有用户最后一次登录信息
lastb     # 显示登录失败的用户记录
```

## 计划任务

查看计划任务：
```bash
crontab -l           # 列出当前用户的计划任务
ls -la /etc/cron*    # 列出系统级计划任务
```

## 启动项管理

查看服务启动项：
```bash
systemctl list-unit-files --type=service  # 列出所有服务及其启动状态（systemd）
chkconfig --list                           # 列出所有服务（SysVinit）
```

## 日志查看

查看系统日志：
```bash
tail -f /var/log/syslog      # 实时查看系统日志
tail -f /var/log/auth.log    # 实时查看认证日志
journalctl -xe               # 查看系统日志（journald）
```

## 文件搜索

查找最近修改的文件：
```bash
find / -type f -mtime -1 -ls    # 查找最近 1 天内修改的文件
find / -type f -mmin -60 -ls    # 查找最近 60 分钟内修改的文件
find / -name "*.php" -mtime -1  # 查找最近修改的 PHP 文件
find / -perm -4000 -ls          # 查找具有 SUID 权限的文件
```

---

# Web 服务器应急命令

## Apache

```bash
apachectl -t              # 测试配置文件语法
apachectl -S              # 显示虚拟主机配置

# 查看错误日志
grep -E "error|warning" /var/log/apache2/error.log

# 查看访问日志中的异常状态码
grep -E "404|500" /var/log/apache2/access.log
```

## Nginx

```bash
nginx -t       # 测试配置文件语法
nginx -T       # 显示完整配置

# 查看错误日志
grep -E "error|warning" /var/log/nginx/error.log

# 查看访问日志中的异常状态码
grep -E "404|500" /var/log/nginx/access.log
```

## IIS (PowerShell)

```powershell
Get-WebSite                  # 列出所有网站
Get-WebApplication          # 列出所有应用程序
Get-WebVirtualDirectory      # 列出所有虚拟目录
Get-WebConfigFile            # 获取配置文件
```

---

# 数据库应急命令

## MySQL

```bash
mysqladmin status          # 显示数据库状态
mysqladmin processlist     # 列出当前运行的进程
mysqlshow                  # 显示数据库和表
mysqlcheck -A              # 检查所有数据库完整性
```

## PostgreSQL

```bash
pg_controldata  # 显示控制文件信息
pg_isready      # 检查数据库是否就绪

psql -c "SELECT * FROM pg_stat_activity"   # 显示活动连接
psql -c "SELECT * FROM pg_locks"           # 显示锁信息
```

## Oracle

```sql
sqlplus / as sysdba

-- 显示会话信息
SELECT * FROM v$session;

-- 显示进程信息
SELECT * FROM v$process;

-- 显示锁定的对象
SELECT * FROM v$locked_object;
```

## SQL Server

```powershell
# 显示会话信息
sqlcmd -Q "SELECT * FROM sys.dm_exec_sessions"

# 显示连接信息
sqlcmd -Q "SELECT * FROM sys.dm_exec_connections"

# 显示请求信息
sqlcmd -Q "SELECT * FROM sys.dm_exec_requests"
```

---

# 应急响应检查清单

| 检查项 | 命令 | 说明 |
|--------|------|------|
| 进程异常 | `ps -aux \| grep -v grep` | 查看所有进程 |
| 网络异常 | `netstat -antup` | 查看网络连接 |
| 用户异常 | `w` | 查看在线用户 |
| 权限提升 | `find / -perm -4000` | 查找 SUID 文件 |
| 文件篡改 | `find / -mtime -1` | 查找最近修改的文件 |
| 后门检查 | `find / -name "*.php" -mtime -1` | 查找可疑 PHP 文件 |
| 计划任务 | `crontab -l` | 查看计划任务 |
| 启动项 | `systemctl list-unit-files` | 查看启动服务 |
