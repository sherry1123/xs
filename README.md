# OrcaFS BBBig Frontend Project

## Frontend

#### Technology Stack

1. Project is initialized through 'create-react-app' that is provided by Facebook React.js authorities.
This tool will initialize a webpack based project with modularization support. It uses 'less' as css preprocessor, and 'auto-prefix' as postprocessor.
Also for webpack project, dev server is certainly support. Based on this, we introduce module HRM in advanced for a better development experience: <br />
[https://github.com/facebookincubator/create-react-app](https://github.com/facebookincubator/create-react-app) <br />

2. The current popular state management framework is Redux which is inspired by Flux and powered by Dan Abramov. As for React.js we use 'react-redux' instead: <br />
[https://redux.js.org](https://redux.js.org) <br />
[https://redux.js.org/basics/usage-with-react](https://redux.js.org/basics/usage-with-react) <br />

3. For router implementation we use 'react-router': <br />
[https://reacttraining.com](https://reacttraining.com) <br />

4. We use the 'antd' as UI component library that is provided by Ant Financial R D team: <br />
[https://ant.design](https://ant.design)

####  Folder Directory Structure

 - - __./config__          - configurations for cli tools
 - - __./public__          - production build destination
 - - __./scripts__         - npm scripts for running cli tools
 - - __./src__             - source code and static resource for webpack
 - - __./src/component__   - common components and high-level abstractions of mature business-view components
 - - __./src/images__      - image resource
 - - __./src/redux__       - state management
 - - __./src/services__    - useful functions and local data/map
 - - __./src/socket__      - socket.io client
 - - __./src/styleSheets__ - less style sheets for common using and specific components
 - - __./src/views__       - business-view components placed by module or category
 - - __./src/index.js__    - the portal of build for whole frontend project for webpack


## Backend

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
#### Deployment Method

1. depend Node.js
```
npm install
node server
```
2. no dependence
```
npm install pkg -g
pkg server.js -t node9-linux-x64/node9-macos-x64/node9-win-x64 -o app
./app
```