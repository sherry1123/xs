const config = require('../config');
const service = require('../service');
const getUser = ctx => (ctx.cookies.get('user'));
const getClientIP = ctx => (ctx.get('x-real-ip'));
const model = {
    '/api/testapi': ctx => {
        ctx.body = ctx;
    },
    '/api/getuser': async ctx => {
        ctx.body = await service.getUser(ctx.param);
    },
    '/api/adduser': async ctx => {
        ctx.body = await service.addUser(ctx.param);
    },
    '/api/updateuser': async ctx => {
        ctx.body = await service.updateUser(ctx.param);
    },
    '/api/deleteuser': async ctx => {
        ctx.body = await service.deleteUser(ctx.param);
    },
    '/api/login': async ctx => {
        ctx.body = await service.login(ctx.param, getClientIP(ctx));
        if (!ctx.body.code) {
            ctx.cookies.set('login', 'true', config.cookies);
            ctx.cookies.set('user', ctx.param.username, config.cookies);
        }
    },
    '/api/logout': async ctx => {
        ctx.body = await service.logout(ctx.param, getClientIP(ctx));
        ctx.cookies.set('login', 'false', config.cookies);
        ctx.cookies.set('user', '', config.cookies);
    },
    '/api/geteventlog': async ctx => {
        ctx.body = await service.getEventLog(ctx.param);
    },
    '/api/updateeventlog': async ctx => {
        ctx.body = await service.updateEventLog(ctx.param);
    },
    '/api/getauditlog': async ctx => {
        ctx.body = await service.getAuditLog(ctx.param);
    },
    '/api/gethardware': async ctx => {
        ctx.body = await service.getHardware(ctx.param);
    },
    '/api/testmail': async ctx => {
        ctx.body = await service.testMail(ctx.param);
    },
    '/api/init': ctx => {
        ctx.body = { code: 0, data: 'start to initialize cluster' };
        service.initCluster(ctx.param);
    },
    '/api/antiinit': ctx => {
        ctx.body = { code: 0, data: 'start to anti-initialize cluster' };
        service.antiInitCluster(1);
    },
    '/api/checkclusterenv': async ctx => {
        ctx.body = await service.checkClusterEnv(ctx.param);
    },
    '/api/getnodelist': async ctx => {
        ctx.body = await service.getNodeList(ctx.param);
    },
    '/api/getmetanodesoverview': async ctx => {
        ctx.body = await service.getMetaNodesOverview(ctx.param);
    },
    '/api/getmetanode': async ctx => {
        ctx.body = await service.getMetaNode(ctx.param);
    },
    '/api/getstoragenodesoverview': async ctx => {
        ctx.body = await service.getStorageNodesOverview(ctx.param);
    },
    '/api/getstoragenode': async ctx => {
        ctx.body = await service.getStorageNode(ctx.param);
    },
    '/api/getclientstats': async ctx => {
        ctx.body = await service.getClientStats(ctx.param);
    },
    '/api/getuserstats': async ctx => {
        ctx.body = await service.getUserStats(ctx.param);
    },
    '/api/getstoragenodessummary': async ctx => {
        ctx.body = await service.getStorageNodesStatusAndDIskSummary(ctx.param);
    },
    '/api/getstoragenodesthroughput': async ctx => {
        ctx.body = await service.getStorageNodesThroughput(ctx.param);
    },
    '/api/getstoragenodesummary': async ctx => {
        ctx.body = await service.getStorageNodeStatusAndDIskSummary(ctx.param);
    },
    '/api/getstoragenodethroughput': async ctx => {
        ctx.body = await service.getStorageNodeThroughput(ctx.param);
    },
    '/api/getmetanodessummary': async ctx => {
        ctx.body = await service.getMetaNodesStatus(ctx.param);
    },
    '/api/getmetanodesrequest': async ctx => {
        ctx.body = await service.getMetaNodesRequest(ctx.param);
    },
    '/api/getmetanodesummary': async ctx => {
        ctx.body = await service.getMetaNodeStatus(ctx.param);
    },
    '/api/getknownproblems': async ctx => {
        ctx.body = await service.getKnownProblems(ctx.param);
    },
    '/api/getdisklist': async ctx => {
        ctx.body = await service.getDiskList(ctx.param);
    },
    '/api/getentryinfo': async ctx => {
        ctx.body = await service.getEntryInfo(ctx.param);
    },
    '/api/getfiles': async ctx => {
        ctx.body = await service.getFiles(ctx.param);
    },
    '/api/setpattern': async ctx => {
        ctx.body = await service.setPattern(ctx.param, getUser(ctx), getClientIP(ctx));
    },
    '/api/syncsystemstatus': ctx => {
        ctx.body = { code: 0 };
    },
    '/api/getsnapshot': async ctx => {
        ctx.body = await service.getSnapshot(ctx.param);
    },
    '/api/createsnapshot': async ctx => {
        ctx.body = await service.createSnapshot(ctx.param, getUser(ctx), getClientIP(ctx));
    },
    '/api/deletesnapshot': ctx => {
        ctx.body = { code: 0, data: 'start to delete snapshot' };
        service.deleteSnapshot(ctx.param, getUser(ctx), getClientIP(ctx));
    },
    '/api/rollback': ctx => {
        ctx.body = { code: 0, data: 'start to rollback snapshot' };
        service.rollback(ctx.param, getUser(ctx), getClientIP(ctx));
    },
    '/api/getusermetastats': async ctx => {
        ctx.body = await service.getUserMetaStats(ctx.param);
    },
    '/api/getuserstoragestats': async ctx => {
        ctx.body = await service.getUserStorageStats(ctx.param);
    },
    '/api/getclientmetastats': async ctx => {
        ctx.body = await service.getClientMetaStats(ctx.param);
    },
    '/api/getclientstoragestats': async ctx => {
        ctx.body = await service.getClientStorageStats(ctx.param);
    },
    '/api/getsnapshottask': async ctx => {
        ctx.body = await service.getSnapshotTask(ctx.param);
    },
    '/api/createsnapshottask': async ctx => {
        ctx.body = await service.createSnapshotTask(ctx.param, getUser(ctx), getClientIP(ctx));
    },
    '/api/deletesnapshottask': async ctx => {
        ctx.body = await service.deleteSnapshotTask(ctx.param, getUser(ctx), getClientIP(ctx));
    }
};
module.exports = model;