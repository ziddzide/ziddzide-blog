---
title: Windows操作系统
published: 2026-07-15
updated: 2026-07-16
draft: false
description: Windows操作系统
image: ""
tags:
  - Windows
  - 操作系统
  - 进程树工具
  - 注册表
  - 防火墙
  - Windows命令
  - UAC
category: Linux运维
pinned: false
comment: true
author: Ziddzide
---

# Windows基础

## 常用命令

```powershell
Dir  #列出当前目录下的文件和文件夹
cd   #切换目录

data #查看和修改系统日期
	-t #查看日期信息

echo #和Linux一样
hostname #查看主机名称

time #查看系统事件
	/t #查看系统事件

ipconfig #相当于Linux ifconfig
	/all #显示全部信息

netstat #检查可用的网络链接
	-a #显示所有连接和监听端口
	-n #数字形式显示地址和端口号
	-o #显示关联的进程ID
	
nslookup #dns查询,返回ip
ping #检查通信
systeminfo #展示详细的系统信息
```

## 文件操作

```powershell
type file.txt # 打印文件
copy file.txt copyfile.txt # 复制文件
mkdir # 创建目录
rename # 重命名
move file.txt dirs\ # 转移文件
tree # 树状展示所有文件

rmdir # 删除空目录
	/S # 删除目录
```

## Windows用户和组

```powershell
whoami # 判断用户
# whoami 命令输出的格式为“域名\用户名”。如果执行此搜索的主机不在域中，则会显示主机名信息而不是域名。

net user # 系统中的用户名
net user username # 输出详细信息

net localgroup # 查看组
net localgroup groupname # 查看详细信息

net accounts
```

win+R

```
lusrmgr.msc # 查看本地用户和组
```

## 账户控制UAC

用户帐户控制 (UAC) 是 Windows 操作系统中的一项安全功能，用于防止未经授权的访问。启用此功能后，未经管理员许可，某些更改和操作将无法执行。上述示例中管理员权限请求的错误消息正是由于此功能引起的。虽然它提高了系统安全性，但攻击者有时仍可能绕过或违反此功能。仅仅依赖此功能来确保系统安全并非明智之举，但完全不使用此功能也同样不可取。在进行系统安全加固时，应像对待其他许多功能一样，谨慎且正确地应用“用户帐户控制”配置。

### UAC级别

**1. 始终通知** 

在此级别下，应用程序和用户在进行需要管理员权限的更改之前都会收到通知。这是最安全的设置，但也是最烦人的。

**2. 仅当应用尝试更改我的计算机时才通知我（默认）**  
  
这是默认级别，UAC 仅在程序进行需要管理员权限的更改之前通知您。此设置不如第一个设置安全，因为恶意程序可以模拟用户的击键或鼠标移动，从而更改 Windows 设置。

**3. 仅当应用尝试更改我的计算机时才通知我（不调暗桌面）**  
  
此级别与上一个设置相同，区别在于，当显示用户帐户控制 (UAC) 提示时，桌面不会调暗，其他桌面应用可能会干扰它。此级别安全性更低，因为它使恶意程序更容易模拟键盘输入或鼠标移动来干扰 UAC 提示。

**4. 从不通知我**  
  
在此级别，UAC 已关闭，无法提供任何针对未经授权的系统更改的保护。如果您没有安装完善的安全软件，您的 Windows 设备很可能出现安全问题。UAC 关闭后，恶意程序更容易感染 Windows 并控制系统。

## Windows进程管理

### 流程树

运行程序就是一个进程。从这个进程可以创建另一个进程。这两个进程之间存在父子关系。  
  
**进程：**进程是指正在执行的程序。  
  
**父进程：**父进程是指创建了一个或多个子进程的进程。  
  
**子进程：**子进程是由另一个进程（父进程）创建的进程。一个父进程可以有多个子进程，但一个子进程只能有一个父进程。

父进程和子进程的层级结构称为“进程树”。

工具一般可以使用

```
https://systeminformer.io/downloads
```

### wininit.exe

“wininit.exe”进程被称为“Windows初始化进程”。它负责启动服务控制管理器 (services.exe)、本地安全授权进程 (lsass.exe) 和本地会话管理器 (lsm.exe)。它位于“C:\Windows\System32”文件夹下，在系统启动时创建。该进程以系统上最高权限用户（NT AUTHORITY\SYSTEM）的权限运行。

###  services.exe

“services.exe”进程负责启动和停止服务。“Svchost.exe”、“dllhost.exe”、“taskhost.exe”和“spoolsv.exe”是“services.exe”进程的子进程。它位于“C:\Windows\System32”文件夹下。该进程以系统上最高权限用户（NT AUTHORITY\SYSTEM）的权限运行。正常情况下，进程树中应该同时只有一个“services.exe”进程。如果存在多个“services.exe”进程，或者存在名称相似的进程，则应进一步调查，因为这可能是恶意活动导致的进程。

### svchost.exe

“svchost.exe”是动态链接库（DLL）服务通用的主机进程名称。由于DLL文件是不可执行文件，因此需要通过svchost进程来触发操作系统服务。“svchost.exe”负责管理多DLL服务，以优化系统资源。所有基于DLL的服务共享同一个svchost进程。每个svchost进程执行不同的服务。它的父进程是“services.exe”，而“services.exe”又是“wininit.exe”的子进程。

### lsass.exe

“lsass.exe”（本地安全授权子系统服务）进程负责关键的安全操作，例如在 Windows 操作系统中验证或拒绝用户登录密码。此外，该进程在用户更改密码时也会积极运行。由于该进程存储着系统中的用户密码，因此至关重要。攻击者一旦获得系统访问权限，便可利用该进程获取用户密码。Benjamin Delpy 开发了一款名为“mimikatz”的免费工具，用户可以通过该工具从“lsass.exe”进程中获取密码。该工具的访问地址如下：  
  
**Mimikatz:** [https://blog.gentilkiwi.com/mimikatz/lsass.exe](https://blog.gentilkiwi.com/mimikatz)  

```
这个工具很重要,是AD域控的一部分
```

”位于“C:\Windows\System32”文件夹下。该进程以系统中最高权限用户（NT AUTHORITY\SYSTEM）的权限运行。  

### winlogon.exe

“Winlogon.exe”进程负责执行Windows操作系统中用户的登录和注销操作。它以系统中最高权限用户（NT AUTHORITY\SYSTEM）的权限运行。“Winlogon.exe”位于“C:\Windows\System32”文件夹下。

### explorer.exe

“Explorer.exe”进程是Windows操作系统中几乎所有具有图形用户界面（GUI）并以窗口形式打开的进程的父进程。例如，当Windows资源管理器启动时，该进程就会启动。正常情况下，应该只有一个“explorer.exe”进程。“Explorer.exe”位于“C:\Windows\”文件夹下。该进程以当前登录系统的用户的权限运行。

### 进程操作命令

##### 任务列表

```powershell
tasklist # 查看进程
tasklist | findstr osk.exe # 输出进程PID

taskkill PID # 中止进程
```

## Windows服务

服务是指在 Windows 系统中后台运行的程序，它们拥有自己的进程。服务无需与用户交互，也无需在屏幕上打开窗口即可运行。每个服务都有其自身的运行原因。除了系统自带的服务外，后续安装的程序也可能拥有自己的服务。从安全角度来看，Windows 服务至关重要。攻击者可以通过运行服务来收集系统信息，或者利用服务渗透系统。

```powershell
services.msc # 查看服务
```

### 服务操作命令

```powershell
sc query # 查看正在运行的全部服务
sc query type=service state=all # 查看所有可用服务
sc query queryname # 获取某个服务的相信信息
sc start queryname # 开启服务
sc stop wuauserv # 停止服务
```

> powershell里面需要将`sc`改为`sc.exe`

## Windows任务计划程序

计划任务是指在特定时间间隔或特定时间对系统执行某些操作。例如，我们可能需要在特定时间间隔检查系统信息。Windows 操作系统通过计划任务来实现此类任务。攻击者一旦获得 Windows 系统的访问权限，就可以利用计划任务来确保持久性，使系统向其自身系统发送连接请求，从而避免失去对系统的访问权限。这需要向计划任务中添加新的任务。在检测威胁时，安全运营中心 (SOC) 分析人员应密切监控计划任务，以便发现可疑的计划任务。

```
taskschd.msc
```

### 创建新的计划任务

可以使用任务计划程序创建新的计划任务。单击右侧导航面板上的“创建任务”按钮即可创建新的计划任务：  

![](https://ld-images-2.s3.us-east-2.amazonaws.com/Windows+Fundamentals/images/task4.png)

  
在打开的窗口中填写任务名称和描述后，转到“操作”选项卡，添加计划任务将执行的操作：  

![](https://ld-images-2.s3.us-east-2.amazonaws.com/Windows+Fundamentals/images/task5.png)

  
如果此部分中没有任何“操作”，则无法完成任务添加。让我们使用“新建”按钮添加一个新操作。  

![](https://ld-images-2.s3.us-east-2.amazonaws.com/Windows+Fundamentals/images/task6.png)

  
让我们在窗口的“程序/脚本”部分输入命令行可执行文件的路径，以确保在计划任务运行时打开命令行。  

![](https://ld-images-2.s3.us-east-2.amazonaws.com/Windows+Fundamentals/images/task7.png)

  
如上图所示，该过程已成功完成，并添加了一个新的计划任务。要运行该计划任务，我们可以右键单击并选择“运行”：  

![](https://ld-images-2.s3.us-east-2.amazonaws.com/Windows+Fundamentals/images/task8.png)

  
### 计划任务操作命令

```powershell
schtasks # 显示已经安排的任务
schtasks /Query /TN TrainingTask # 添加特定计划任务
schtasks /Change /ENABLE /TN TrainingTask # 启用特定计划任务
schtasks /Run /TN TrainingTask # 运行计划任务
schtasks /End /TN TrainingTask # 终止计划任务
schtasks /Delete /TN TrainingTask # 删除计划任务
schtasks /query /tn "LogCollect3" /v /fo list # 查看特定任务计划
```

## Windows注册表

Windows 注册表是一个分层数据库，其中包含操作系统和系统配置信息，以及系统中已安装的程序信息。它将程序和硬件的信息及设置保存在这个数据库中。例如，当一个程序安装在 Windows 系统上时，该程序可能会选择将其许可证的到期日期保存在 Windows 注册表中。Windows  
  
注册表对于攻击者来说是一个重要的 Windows 组件。注册表包含大量关于 Windows 操作系统的信息。例如，已安装在系统上但后来卸载的程序的信息可能仍然保留在注册表中。攻击者希望通过系统获取的信息通常是继续攻击所必需的信息。例如，当攻击者控制了权限受限的用户帐户后，他们很可能会通过收集系统中其他用户的信息来继续寻找权限更高的帐户。  
  
注册表包含重要的系统配置和信息，以及关于系统中已安装的其他程序的信息。攻击者可能还希望向注册表中添加自己的条目，以确保其在系统中的持久存在。 SOC 分析师应监控注​​册表的可疑更改，以便能够检测攻击者的任何可疑活动和行为。

### 访问注册表

```
regedit.msc
```

### 注册表结构

Windows 注册表项位于“%SystemRoot%\System32\Config”目录下。  
  
注册表包含两个基本元素：“键”和“值”。注册表键是类似于文件夹的容器对象。注册表值是类似于文件的非容器对象。键可以包含值和子键。  
  
例如，HKEY_LOCAL_MACHINE\Software\Microsoft\Windows 指的是 HKEY_LOCAL_MACHINE 根键下“Software”子键的“Microsoft”子键的“Windows”子键。  
  
共有七个预定义的根键：  
  
- HKEY_LOCAL_MACHINE 或 HKLM
- HKEY_CURRENT_CONFIG 或 HKCC
- HKEY_CLASSES_ROOT 或 HKCR
- HKEY_CURRENT_USER 或 HKCU
- HKEY_USERS 或 HKU
- HKEY_PERFORMANCE_DATA（仅在 Windows NT 中，但在 Windows 注册表编辑器中不可见）
- HKEY_DYN_DATA（仅在 Windows 9x 中可见，可在 Windows 注册表编辑器中查看）

#### HKEY_LOCAL_MACHINE 或 HKLM

此部分用于保存计算机特定的硬件和软件配置信息。适用于每个登录用户的设置都保存在此部分中。此键下还有一些重要的子键：

**HARDWARE** 本部分包含有关连接到系统的硬件设备的信息
**SAM** 本部分包含用户密码的加密版本
**SECURITY** 本部分包含系统中的安全策略
**SOFTWARE** 本部分包含操作系统服务以及系统中已安装程序的配置
**SYSTEM** 本部分保存系统的配置信息

#### HKEY_CURRENT_CONFIG 或 HKCC

它负责在系统运行期间保存硬件配置。

#### HKEY_CLASSES_ROOT 或 HKCR

它包含软件设置、快捷方式以及所有其他与用户界面相关的信息。如果删除此分区，即使 Windows 正在运行，所有文件也无法打开。

#### HKEY_CURRENT_USER 或 HKCU

这是保存已登录用户配置信息的部分。

#### HKEY_USERS 或 HKU

该部分用于保存系统中所有注册用户的配置信息。

#### Reg拓展文件

扩展名为“.reg”的文件是导出注册表文件时保存的文件格式。“.reg”扩展名的文件是一种基于文本的文件类型

### 注册表操作命令

```powershell
reg query HKEY_LOCAL_MACHINE\SYSTEM\ControlSet001\Control\ComputerName\ComputerName
```

## Windows防火墙

Windows 防火墙是一种安全工具，它允许在特定规则框架内阻止或允许进出主机的网络数据包。通过在 Windows 防火墙上创建规则，可以轻松阻止恶意连接。同时，可以通过新规则将已验证为安全连接的目标添加到允许的网络连接中。Windows  
  
防火墙是最基本的保护方法之一，用于防止攻击者访问系统。通过添加规则，Windows 防火墙可以有效防御来自网络外部的威胁。由于攻击者了解 Windows 防火墙阻止网络连接的能力，他们通常会尝试禁用防火墙，或者在防火墙规则中添加自定义规则以绕过防火墙并建立与命令和控制服务器的通信。他们通过命令和控制服务器向目标系统发送命令来继续攻击。攻击者通常使用这种方法来确保在系统中的持久存在。

### 防火墙规则操作命令

```powershell
netsh advfirewall firewall show rule name=all # 列出所有的防火墙信息
netsh advfirewall firewall show rule name="TCP Port 4444 Block" verbose # 输出特定信息
netsh advfirewall firewall delete rule name="TCP Port 4444 Block" # 删除防火墙规则
```

## 事件日志

事件日志是 Windows 操作系统收集的日志。这些日志包含多种类型，例如应用程序日志、安全日志和系统日志。事件日志是了解系统上众多进程是否已发生以及掌握其详细信息的重要资源。安全运营中心 (SOC) 分析师在检测系统威胁的存在和活动时，经常会使用事件日志。例如，以下是一些事件日志示例：  
  
- PowerShell 活动
- 删除事件日志
- 启动和停止服务
- 创建新的计划任务
- RDP active
- 更改用户权限
- 登录活动失败
  
  
这些行为是网络攻击中最基本的几种行为之一。

### 事件日志结构

Windows操作系统的组件数量非常庞大，因此事件日志的数量也相当庞大。所有这些记录都按一定顺序保存。每种记录类型都有一个“事件ID”值，用于区分它们。在日志分析过程中，可以根据“事件ID”值进行筛选，从而减少日志数量并生成更简洁的输出结果。  
  
在Windows系统中，主要有三种事件日志标题：“应用程序”、“系统”和“安全”。

#### 应用

它提供与系统中应用程序相关的日志记录。例如，您可以找到系统上运行的防病毒应用程序收到的错误信息。  

#### 系统

这里存放着操作系统基本组件生成的日志。例如，驱动程序加载和卸载操作的日志就保存在这里。  

#### 安全

此处保存有有关身份验证和安全方面的记录。

### 使用事件查看器查看事件日志

```
eventvwr
```

### 事件日志操作命令

```powershell
wevtutil query-events Security /rd:true /count:1 /format:text /q:"Event[System[(EventID=4625)]]"  
  
# 命令中各参数的说明如下：  
  
- "query-events" # 参数：从日志或日志文件中查询事件。
- "/rd" # 参数：反转方向。
- "/count" # 参数：记录计数。
- "/format" # 参数：输出格式。
- "/q" # 参数：XPathQuery。
```

## Windows规范管理(WMI)

Windows 管理规范 (WMI) 是用于访问 Windows 操作系统组件的一项功能。WMI 允许本地和远程访问。正因如此，它成为攻击者经常利用的 Windows 功能之一。攻击者可以利用 WMI 进行侦察以及“横向移动”。  
  
**横向移动**是指攻击者在首次获得目标系统访问权限后，通过访问同一网络中的其他计算机而进行的移动。  
  
攻击者之所以青睐 WMI，是因为它在 Windows 操作系统中易于获取且功能广泛。例如，攻击者可以通过这种方式远程运行可执行文件。

### 使用VMI

```powershell
wmic os list brief # 打印操作系统信息
wmic useraccount get name # 查看系统用户名
```

https://ss64.com/nt/wmic.html

