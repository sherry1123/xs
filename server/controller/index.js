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
    '/api/getraidrecommendedconfiguration': async ctx => {
        ctx.body = await service.getRaidRecommendedConfiguration(ctx.param);
    },
    '/api/getdisklist': async ctx => {
        ctx.body = await service.getDiskList(ctx.param);
    },
    '/api/init': ctx => {
        ctx.body = { code: 0, data: 'start to initialize cluster' };
        service.initCluster(ctx.param);
    },
    '/api/deinit': ctx => {
        ctx.body = { code: 0, data: 'start to de-initialize cluster' };
        service.antiInitCluster(1);
    },
    '/api/receiveevent': ctx => {
        ctx.body = { code: 0, data: 'orcafs-gui receive event successfully' };
        service.receiveEvent(ctx.param);
    },
    '/api/login': async ctx => {
        ctx.body = await service.login(ctx.param, handler.clientIP(ctx));
        if (!ctx.body.code) {
            ctx.cookies.set('login', 'true', config.cookie);
            ctx.cookies.set('user', ctx.param.username, config.cookie);
        }
    },
    '/api/logout': async ctx => {
        ctx.body = await service.logout(ctx.param, handler.clientIP(ctx));
        ctx.cookies.set('login', 'false', config.cookie);
        ctx.cookies.set('user', '', config.cookie);
    },
    '/api/getuser': async ctx => {
        ctx.body = await service.getUser(ctx.param);
    },
    '/api/createuser': async ctx => {
        ctx.body = await service.createUser(ctx.param, handler.user(ctx), handler.clientIP(ctx));
    },
    '/api/updateuser': async ctx => {
        ctx.body = await service.updateUser(ctx.param, handler.user(ctx), handler.clientIP(ctx));
    },
    '/api/deleteuser': async ctx => {
        ctx.body = await service.deleteUser(ctx.param, handler.user(ctx), handler.clientIP(ctx));
    },
    '/api/testmail': async ctx => {
        ctx.body = await service.testMail(ctx.param, handler.user(ctx), handler.clientIP(ctx));
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
    '/api/getstoragethroughput': async ctx => {
        ctx.body = await service.getStorageThroughput(ctx.param);
    },
    '/api/getclientmetastats': async ctx => {
        ctx.body = await service.getClientMetaStats(ctx.param);
    },
    '/api/getclientstoragestats': async ctx => {
        ctx.body = await service.getClientStorageStats(ctx.param);
    },
    '/api/getusermetastats': async ctx => {
        ctx.body = await service.getUserMetaStats(ctx.param);
    },
    '/api/getuserstoragestats': async ctx => {
        ctx.body = await service.getUserStorageStats(ctx.param);
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
        ctx.body = { code: 0, data: 'start to create snapshot' };
        service.createSnapshot(ctx.param, handler.user(ctx), handler.clientIP(ctx));
    },
    '/api/updatesnapshot': async ctx => {
        ctx.body = await service.updateSnapshot(ctx.param, handler.user(ctx), handler.clientIP(ctx));
    },
    '/api/deletesnapshot': ctx => {
        ctx.body = { code: 0, data: 'start to delete snapshot' };
        service.deleteSnapshot(ctx.param, handler.user(ctx), handler.clientIP(ctx));
    },
    '/api/batchdeletesnapshot': ctx => {
        ctx.body = { code: 0, data: 'start to batch delete snapshot' };
        service.batchDeleteSnapshot(ctx.param, handler.user(ctx), handler.clientIP(ctx));
    },
    '/api/rollbacksnapshot': ctx => {
        ctx.body = { code: 0, data: 'start to rollback snapshot' };
        service.rollbackSnapshot(ctx.param, handler.user(ctx), handler.clientIP(ctx));
    },
    '/api/getsnapshotschedule': async ctx => {
        ctx.body = await service.getSnapshotSchedule(ctx.param);
    },
    '/api/createsnapshotschedule': async ctx => {
        ctx.body = await service.createSnapshotSchedule(ctx.param, handler.user(ctx), handler.clientIP(ctx));
    },
    '/api/updatesnapshotschedule': async ctx => {
        ctx.body = await service.updateSnapshotSchedule(ctx.param, handler.user(ctx), handler.clientIP(ctx));
    },
    '/api/enablesnapshotschedule': async ctx => {
        ctx.body = await service.enableSnapshotSchedule(ctx.param, handler.user(ctx), handler.clientIP(ctx));
    },
    '/api/disablesnapshotschedule': async ctx => {
        ctx.body = await service.disableSnapshotSchedule(ctx.param, handler.user(ctx), handler.clientIP(ctx));
    },
    '/api/deletesnapshotschedule': async ctx => {
        ctx.body = await service.deleteSnapshotSchedule(ctx.param, handler.user(ctx), handler.clientIP(ctx));
    },
    '/api/batchdeletesnapshotschedule': async ctx => {
        ctx.body = await service.batchDeleteSnapshotSchedule(ctx.param, handler.user(ctx), handler.clientIP(ctx));
    },
    '/api/getcifsshare': async ctx => {
        ctx.body = await service.getCIFSShare(ctx.param);
    },
    '/api/createcifsshare': async ctx => {
        ctx.body = await service.createCIFSShare(ctx.param, handler.user(ctx), handler.clientIP(ctx));
    },
    '/api/updatecifsshare': async ctx => {
        ctx.body = await service.updateCIFSShare(ctx.param, handler.user(ctx), handler.clientIP(ctx));
    },
    '/api/deletecifsshare': async ctx => {
        ctx.body = await service.deleteCIFSShare(ctx.param, handler.user(ctx), handler.clientIP(ctx));
    },
    '/api/batchdeletecifsshare': async ctx => {
        ctx.body = await service.batchDeleteCIFSShare(ctx.param, handler.user(ctx), handler.clientIP(ctx));
    },
    '/api/getuserorgroupfromcifsshare': async ctx => {
        ctx.body = await service.getUserOrGroupFromCIFSShare(ctx.param);
    },
    '/api/adduserorgrouptocifsshare': async ctx => {
        ctx.body = await service.addUserOrGroupToCIFSShare(ctx.param, handler.user(ctx), handler.clientIP(ctx));
    },
    '/api/updateuserorgroupincifsshare': async ctx => {
        ctx.body = await service.updateUserOrGroupInCIFSShare(ctx.param, handler.user(ctx), handler.clientIP(ctx));
    },
    '/api/removeuserorgroupfromcifsshare': async ctx => {
        ctx.body = await service.removeUserOrGroupFromCIFSShare(ctx.param, handler.user(ctx), handler.clientIP(ctx));
    },
    '/api/getnfsshare': async ctx => {
        ctx.body = await service.getNFSShare(ctx.param);
    },
    '/api/createnfsshare': async ctx => {
        ctx.body = await service.createNFSShare(ctx.param, handler.user(ctx), handler.clientIP(ctx));
    },
    '/api/updatenfsshare': async ctx => {
        ctx.body = await service.updateNFSShare(ctx.param, handler.user(ctx), handler.clientIP(ctx));
    },
    '/api/deletenfsshare': async ctx => {
        ctx.body = await service.deleteNFSShare(ctx.param, handler.user(ctx), handler.clientIP(ctx));
    },
    '/api/batchdeletenfsshare': async ctx => {
        ctx.body = await service.batchDeleteNFSShare(ctx.param, handler.user(ctx), handler.clientIP(ctx));
    },
    '/api/getclientinnfsshare': async ctx => {
        ctx.body = await service.getClientInNFSShare(ctx.param);
    },
    '/api/createclientinnfsshare': async ctx => {
        ctx.body = await service.createClientInNFSShare(ctx.param, handler.user(ctx), handler.clientIP(ctx));
    },
    '/api/updateclientinnfsshare': async ctx => {
        ctx.body = await service.updateClientInNFSShare(ctx.param, handler.user(ctx), handler.clientIP(ctx));
    },
    '/api/deleteclientinnfsshare': async ctx => {
        ctx.body = await service.deleteClientInNFSShare(ctx.param, handler.user(ctx), handler.clientIP(ctx));
    },
    '/api/getlocalauthusergroup': async ctx => {
        ctx.body = await service.getLocalAuthUserGroup(ctx.param);
    },
    '/api/createlocalauthusergroup': async ctx => {
        ctx.body = await service.createLocalAuthUserGroup(ctx.param, handler.user(ctx), handler.clientIP(ctx));
    },
    '/api/updatelocalauthusergroup': async ctx => {
        ctx.body = await service.updateLocalAuthUserGroup(ctx.param, handler.user(ctx), handler.clientIP(ctx));
    },
    '/api/deletelocalauthusergroup': async ctx => {
        ctx.body = await service.deleteLocalAuthUserGroup(ctx.param, handler.user(ctx), handler.clientIP(ctx));
    },
    '/api/getlocalauthuserfromgroup': async ctx => {
        ctx.body = await service.getLocalAuthUserFromGroup(ctx.param);
    },
    '/api/addlocalauthusertogroup': async ctx => {
        ctx.body = await service.addLocalAuthUserToGroup(ctx.param, handler.user(ctx), handler.clientIP(ctx));
    },
    '/api/removelocalauthuserfromgroup': async ctx => {
        ctx.body = await service.removeLocalAuthUserFromGroup(ctx.param, handler.user(ctx), handler.clientIP(ctx));
    },
    '/api/getlocalauthuser': async ctx => {
        ctx.body = await service.getLocalAuthUser(ctx.param);
    },
    '/api/createlocalauthuser': async ctx => {
        ctx.body = await service.createLocalAuthUser(ctx.param, handler.user(ctx), handler.clientIP(ctx));
    },
    '/api/updatelocalauthuser': async ctx => {
        ctx.body = await service.updateLocalAuthUser(ctx.param, handler.user(ctx), handler.clientIP(ctx));
    },
    '/api/deletelocalauthuser': async ctx => {
        ctx.body = await service.deleteLocalAuthUser(ctx.param, handler.user(ctx), handler.clientIP(ctx));
    },
    '/api/batchdeletelocalauthuser': async ctx => {
        ctx.body = await service.batchDeleteLocalAuthUser(ctx.param, handler.user(ctx), handler.clientIP(ctx));
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
    '/api/getclusterinfo': async ctx => {
        ctx.body = await service.getClusterInfo(ctx.param);
    },
    '/api/getclustertarget': async ctx => {
        ctx.body = await service.getClusterTarget(ctx.param);
    },
    '/api/getclusterthroughput': async ctx => {
        ctx.body = await service.getClusterThroughput(ctx.param);
    },
    '/api/getclusteriops': async ctx => {
        ctx.body = await service.getClusterIops(ctx.param);
    },
    '/api/getnodelist': async ctx => {
        ctx.body = await service.getNodeList(ctx.param);
    },
    '/api/getnodeservice': async ctx => {
        ctx.body = await service.getNodeService(ctx.param);
    },
    '/api/getnodecpu': async ctx => {
        ctx.body = await service.getNodeCpu(ctx.param);
    },
    '/api/getnodememory': async ctx => {
        ctx.body = await service.getNodeMemory(ctx.param);
    },
    '/api/getnodeiops': async ctx => {
        ctx.body = await service.getNodeIops(ctx.param);
    },
    '/api/getnodethroughput': async ctx => {
        ctx.body = await service.getNodeThroughput(ctx.param);
    },
    '/api/getnodetarget': async ctx => {
        ctx.body = await service.getNodeTarget(ctx.param);
    },
    '/api/getnasserver': async ctx => {
        ctx.body = await service.getNasServer(ctx.param);
    },
    '/api/createnasserver': async ctx => {
        ctx.body = await service.createNasServer(ctx.param, handler.user(ctx), handler.clientIP(ctx));
    }
};
module.exports = model;