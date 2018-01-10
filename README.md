## storm-storage

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