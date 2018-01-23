## OrcaFS UI Project

### frontend folder directory structure
 - config          configurations for cli tools
 - public          production build destination
 - scripts         npm scripts for running cli tools
 - src             source code and static resource
 - -
 - src/component   common components and high-level abstractions of mature business views components
 - src/images      image resource
 - src/mockData    mock data for frontend development and debugging
 - src/redux       state management
 - src/services    some useful function or local data/map
 - src/styleSheets common less and component less
 - src/views       business views components placed by category
 - src/index.js    the portal of build for whole frontend project


### server

#### server多进程模型
server的入口为server.js文件。
采用Node.js的cluster模块实现多进程服务。
整个server包含了四个进程，分别是master，agentd，job和task进程。
master进程负责状态管理，包括系统的状态以及其他3个进程的状态。
agentd进程负责系统硬件状态的监控，不直接操作数据库，仅向job进程提供API。
job进程负责处理请求和实现业务逻辑。
task进程负责定时任务的执行。
进程的启动顺序如下：
  master       agentd     job       task 
    |                                
    |———————————>|                                   
    |<———————————|                  
    |agentd ready|                 
    |———————————-|————————>|
    |<———————————|—————————|
    |            |job ready|
    |———————————-|—————————|—————————>|
    |<———————————|—————————|—————————-|
    |            |         |task ready|
当系统未初始化时，server启动master，agentd和job进程。
当系统已初始化时，主节点server启动master，agentd，job和task进程，其余节点server启动master和agentd进程。

#### server目录结构
 - agentd 硬件状态监控(agentd进程)
 - config 配置文件
 - contronller 控制器
 - middleware 中间件
 - model 数据模型
 - module 组件
 - router 路由
 - schedule 定时任务(task进程)
 - service 服务
 - index.js job进程

#### server处理请求过程                                  
request/response <=> nginx <=> job port <=> middleware <=> router <=> controller <=> service <=> module

#### 初始化状态管理
1.启动master进程 => 调用service接口获取status => 将status存入内存 => 将status存入cluster.settings
2.master进程fork worker进程, 并将status存入process.env => 将status存入内存