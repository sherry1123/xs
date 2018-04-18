const config = require('../config');
const service = require('../service');
const handler = require('../module/handler');
const model = {
    '/api/testapi': ctx => {
        ctx.body = ctx;
    },
    '/api/syncsystemstatus': ctx => {
        ctx.body = { code: 0 };
    },
    '/api/checkclusterenv': async ctx => {
        ctx.body = await service.checkClusterEnv(ctx.param);
    },
    '/api/getdisklist': async ctx => {
        ctx.body = await service.getDiskList(ctx.param);
    },
    '/api/init': ctx => {
        ctx.body = { code: 0, data: 'start to initialize cluster' };
        service.initCluster(ctx.param);
    },
    '/api/antiinit': ctx => {
        ctx.body = { code: 0, data: 'start to anti-initialize cluster' };
        service.antiInitCluster(1);
    },
    '/api/receiveevent': ctx => {
        ctx.body = { code: 0, data: 'orcafs-gui receive event successfully' };
        service.receiveEvent(ctx.param);
    },
    '/api/login': async ctx => {
        ctx.body = await service.login(ctx.param, handler.clientIP(ctx));
        if (!ctx.body.code) {
            ctx.cookies.set('login', 'true', config.cookies);
            ctx.cookies.set('user', ctx.param.username, config.cookies);
        }
    },
    '/api/logout': async ctx => {
        ctx.body = await service.logout(ctx.param, handler.clientIP(ctx));
        ctx.cookies.set('login', 'false', config.cookies);
        ctx.cookies.set('user', '', config.cookies);
    },
    '/api/getuser': async ctx => {
        ctx.body = await service.getUser(ctx.param);
    },
    '/api/adduser': async ctx => {
        ctx.body = await service.addUser(ctx.param);
    },
    '/api/updateuser': async ctx => {
        ctx.body = await service.updateUser(ctx.param, handler.clientIP(ctx));
    },
    '/api/deleteuser': async ctx => {
        ctx.body = await service.deleteUser(ctx.param);
    },
    '/api/testmail': async ctx => {
        ctx.body = await service.testMail(ctx.param);
    },
    '/api/gethardware': async ctx => {
        ctx.body = await service.getHardware(ctx.param);
    },
    '/api/getmetanodestatus': async ctx => {
        ctx.body = await service.getMetaNodeStatus(ctx.param);
    },
    '/api/getstoragenodestatus': async ctx => {
        ctx.body = await service.getStorageNodeStatus(ctx.param);
    },
    '/api/getstoragediskspace': async ctx => {
        ctx.body = await service.getStorageDiskSpace(ctx.param);
    },
    '/api/getstoragetarget': async ctx => {
        ctx.body = await service.getStorageTarget(ctx.param);
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
    '/api/getsnapshotsetting': async ctx => {
        ctx.body = await service.getSnapshotSetting(ctx.param);
    },
    '/api/updatesnapshotsetting': async ctx => {
        ctx.body = await service.updateSnapshotSetting(ctx.param, handler.user(ctx), handler.clientIP(ctx));
    },
    '/api/getsnapshot': async ctx => {
        ctx.body = await service.getSnapshot(ctx.param);
    },
    '/api/createsnapshot': async ctx => {
        ctx.body = await service.createSnapshot(ctx.param, handler.user(ctx), handler.clientIP(ctx));
    },
    '/api/deletesnapshot': ctx => {
        ctx.body = { code: 0, data: 'start to delete snapshot' };
        service.deleteSnapshot(ctx.param, handler.user(ctx), handler.clientIP(ctx));
    },
    '/api/deletesnapshots': ctx => {
        ctx.body = { code: 0, data: 'start to delete snapshots' };
        service.deleteSnapshots(ctx.param, handler.user(ctx), handler.clientIP(ctx));
    },
    '/api/rollbacksnapshot': ctx => {
        ctx.body = { code: 0, data: 'start to rollback snapshot' };
        service.rollbackSnapshot(ctx.param, handler.user(ctx), handler.clientIP(ctx));
    },
    '/api/getsnapshottask': async ctx => {
        ctx.body = await service.getSnapshotTask(ctx.param);
    },
    '/api/createsnapshottask': async ctx => {
        ctx.body = await service.createSnapshotTask(ctx.param, handler.user(ctx), handler.clientIP(ctx));
    },
    '/api/updatesnapshottask': async ctx => {
        ctx.body = await service.updateSnapshotTask(ctx.param, handler.user(ctx), handler.clientIP(ctx));
    },
    '/api/enablesnapshottask': async ctx => {
        ctx.body = await service.enableSnapshotTask(ctx.param, handler.user(ctx), handler.clientIP(ctx));
    },
    '/api/disablesnapshottask': async ctx => {
        ctx.body = await service.disableSnapshotTask(ctx.param, handler.user(ctx), handler.clientIP(ctx));
    },
    '/api/deletesnapshottask': async ctx => {
        ctx.body = await service.deleteSnapshotTask(ctx.param, handler.user(ctx), handler.clientIP(ctx));
    },
    '/api/deletesnapshottasks': async ctx => {
        ctx.body = await service.deleteSnapshotTasks(ctx.param, handler.user(ctx), handler.clientIP(ctx));
    },
    '/api/getnasexport': async ctx => {
        ctx.body = await service.getNasExport(ctx.param);
    },
    '/api/createnasexport': async ctx => {
        ctx.body = await service.createNasExport(ctx.param, handler.user(ctx), handler.clientIP(ctx));
    },
    '/api/deletenasexport': async ctx => {
        ctx.body = await service.deleteNasExport(ctx.param, handler.user(ctx), handler.clientIP(ctx));
    },
    '/api/updatenasexport': async ctx => {
        ctx.body = await service.updateNasExport(ctx.param, handler.user(ctx), handler.clientIP(ctx));
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
    '/api/getentryinfo': async ctx => {
        ctx.body = await service.getEntryInfo(ctx.param);
    },
    '/api/getfiles': async ctx => {
        ctx.body = await service.getFiles(ctx.param);
    },
    '/api/setpattern': async ctx => {
        ctx.body = await service.setPattern(ctx.param, handler.user(ctx), handler.clientIP(ctx));
    },
    '/api/getstoragenodesthroughput': async ctx => {
        ctx.body = await service.getStorageNodesThroughput(ctx.param);
    },
    '/api/getstoragenodethroughput': async ctx => {
        ctx.body = await service.getStorageNodeThroughput(ctx.param);
    }
};
module.exports = model;