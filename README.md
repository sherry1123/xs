## OrcaFS Big Frontend Project

### frontend

# project is initialized using 'create-react-app' provided by Facebook React.js authorities.
# [https://github.com/facebookincubator/create-react-app](https://github.com/facebookincubator/create-react-app)

# ui component library is 'antd' provided by Ant Financial R D team.
# [https://ant.design/docs/react/introduce-cn](https://ant.design/docs/react/introduce-cn)

#### folder directory structure
 - ./config          - configurations for cli tools
 - ./public          - production build destination
 - ./scripts         - npm scripts for running cli tools
 - ./src             - source code and static resource for webpack
 - ./src/component   - common components and high-level abstractions of mature business-view components
 - ./src/images      - image resource
 - ./src/redux       - state management
 - ./src/services    - useful functions and local data/map
 - ./src/socket      - socket.io client
 - ./src/styleSheets - less style sheets for common using and specific components
 - ./src/views       - business-view components placed by module or category
 - ./src/index.js    - the portal of build for whole frontend project for webpack


### Back-end

#### Technology Stack

##### 1.[Node.js - a JavaScript runtime built on Chrome's V8 JavaScript engine](https://github.com/nodejs/node)

##### 2.[Koa.js - a next generation web framework for Node.js](https://github.com/koajs/koa)

##### 3.[MongoDB - a document database with the scalability and flexibility](https://github.com/mongodb/mongo)

#### Multi-process Model
```
  master       agentd        job         task 
    | 
    | fork agentd                               
    |———————————>|                              master: manage status    
    |<———————————|                              agentd: monitor hardware
    |agentd ready|  fork job                    job: handle http request
    |————————————|———————————>|                 task: timing tasks
    |<———————————|————————————|                 
    | job ready  |            |  fork task      not initialized: master, agentd, job
    |————————————|————————————|———————————>|    initialized & master: all
    |<———————————|————————————|————————————|    initialized & not master: master, agentd
    | task ready |            |            |
```
#### Folder Directory Structure
```
- server.js    entrance(master)
- server
  |- agentd    monitor hardware(agentd)
  |- config
  |- controller
  |- middleware
  |- model
  |- module
  |- router
  |- schedule  timing tasks(task)
  |- service
  |- index.js  handle http request(job)
```