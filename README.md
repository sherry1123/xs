## OrcaFS UI Project

### frontend folder directory structure
 - config          configurations for cli tools
 - public          production build destination
 - scripts         npm scripts for running cli tools
 - src             source code and static resource
 - --
 - |
 - src/component   common components and high-level abstractions of mature business views components
 - src/images      image resource
 - src/mockData    mock data for frontend development and debugging
 - src/redux       state management
 - src/services    useful functions and local data/map
 - src/styleSheets less files for common use and specific components
 - src/views       business-view components placed by module or category
 - src/index.js    the portal of build for whole frontend project fro webpack


### server

#### server多进程模型
server的入口为server.js文件。
整体采用Node.js的cluster模块和Koa实现多进程后端框架。
server包含了四个进程，分别是master，agentd，job和task进程。
master进程负责状态管理，包括系统的状态以及其他3个进程的状态。
agentd进程负责系统硬件状态的监控，不直接操作数据库，仅向job进程提供API。
job进程负责处理请求，实现业务逻辑以及调用底层orcafs api接口。
task进程负责定时任务的执行。
进程的启动顺序如下：
  master       agentd        job         task 
    |                                
    |———————————>|                                   
    |<———————————|                  
    |agentd ready|                 
    |———————————-|———————————>|
    |<———————————|————————————|
    |            |  job ready |
    |———————————-|————————————|———————————>|
    |<———————————|————————————|————————————|
    |            |            | task ready |
当系统未初始化时，server启动master，agentd和job进程。
当系统已初始化时，主节点server启动master，agentd，job和task进程，其余节点server启动master和agentd进程。

#### server目录结构
 - agentd 硬件状态监控(agentd进程)
 - config 配置文件
 - contronller 控制器
 - middleware 中间件
 - model 数据模型
 - module 组件
	- dao dao层
  - logger 全局log输出
  - promise 同步转异步
  - request 异步http请求
  - socket socket通信
 - router 路由
 - schedule 定时任务(task进程)
 - service 服务
  - database 数据库相关服务
  - email email相关服务
  - filesystem orcafs api调用
  - index 服务入口
  - initialize 初始化相关服务
 - index job入口(job进程)

#### server处理请求过程                                  
request/response <=> nginx <=> job port <=> middleware <=> router <=> controller <=> service <=> module

#### 初始化状态管理
1.启动master进程 => 调用service接口获取status => 将status存入内存 => 将status存入cluster.settings
2.master进程fork worker进程, 并将status存入process.env => 将status存入内存