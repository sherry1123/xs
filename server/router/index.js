const Router = require('koa-router');
const router = new Router();
const controller = require('../controller');

router.all('/api/testapi', controller['/api/testapi']);
router.all('/api/syncsystemstatus', controller['/api/syncsystemstatus']);
router.all('/api/checkclusterenv', controller['/api/checkclusterenv']);
router.all('/api/getraidrecommendedconfiguration', controller['/api/getraidrecommendedconfiguration']);
router.all('/api/getdisklist', controller['/api/getdisklist']);
router.all('/api/init', controller['/api/init']);
router.all('/api/deinit', controller['/api/deinit']);
router.all('/api/receiveevent', controller['/api/receiveevent']);
router.all('/api/login', controller['/api/login']);
router.all('/api/logout', controller['/api/logout']);
router.all('/api/getuser', controller['/api/getuser']);
router.all('/api/getdefaultuser', controller['/api/getdefaultuser']);
router.all('/api/createuser', controller['/api/createuser']);
router.all('/api/updateuser', controller['/api/updateuser']);
router.all('/api/deleteuser', controller['/api/deleteuser']);
router.all('/api/testmail', controller['/api/testmail']);
router.all('/api/getmetanodestatus', controller['/api/getmetanodestatus']);
router.all('/api/getstoragenodestatus', controller['/api/getstoragenodestatus']);
router.all('/api/getstoragediskspace', controller['/api/getstoragediskspace']);
router.all('/api/getstoragetarget', controller['/api/getstoragetarget']);
router.all('/api/getstoragethroughput', controller['/api/getstoragethroughput']);
router.all('/api/getclientmetastats', controller['/api/getclientmetastats']);
router.all('/api/getclientstoragestats', controller['/api/getclientstoragestats']);
router.all('/api/getusermetastats', controller['/api/getusermetastats']);
router.all('/api/getuserstoragestats', controller['/api/getuserstoragestats']);
router.all('/api/getsnapshotsetting', controller['/api/getsnapshotsetting']);
router.all('/api/updatesnapshotsetting', controller['/api/updatesnapshotsetting']);
router.all('/api/getsnapshot', controller['/api/getsnapshot']);
router.all('/api/createsnapshot', controller['/api/createsnapshot']);
router.all('/api/updatesnapshot', controller['/api/updatesnapshot']);
router.all('/api/deletesnapshot', controller['/api/deletesnapshot']);
router.all('/api/batchdeletesnapshot', controller['/api/batchdeletesnapshot']);
router.all('/api/rollbacksnapshot', controller['/api/rollbacksnapshot']);
router.all('/api/getsnapshotschedule', controller['/api/getsnapshotschedule']);
router.all('/api/createsnapshotschedule', controller['/api/createsnapshotschedule']);
router.all('/api/updatesnapshotschedule', controller['/api/updatesnapshotschedule']);
router.all('/api/enablesnapshotschedule', controller['/api/enablesnapshotschedule']);
router.all('/api/disablesnapshotschedule', controller['/api/disablesnapshotschedule']);
router.all('/api/deletesnapshotschedule', controller['/api/deletesnapshotschedule']);
router.all('/api/batchdeletesnapshotschedule', controller['/api/batchdeletesnapshotschedule']);
router.all('/api/getcifsshare', controller['/api/getcifsshare']);
router.all('/api/createcifsshare', controller['/api/createcifsshare']);
router.all('/api/updatecifsshare', controller['/api/updatecifsshare']);
router.all('/api/deletecifsshare', controller['/api/deletecifsshare']);
router.all('/api/batchdeletecifsshare', controller['/api/batchdeletecifsshare']);
router.all('/api/getuserorgroupfromcifsshare', controller['/api/getuserorgroupfromcifsshare']);
router.all('/api/adduserorgrouptocifsshare', controller['/api/adduserorgrouptocifsshare']);
router.all('/api/updateuserorgroupincifsshare', controller['/api/updateuserorgroupincifsshare']);
router.all('/api/removeuserorgroupfromcifsshare', controller['/api/removeuserorgroupfromcifsshare']); 
router.all('/api/getnfsshare', controller['/api/getnfsshare']);
router.all('/api/createnfsshare', controller['/api/createnfsshare']);
router.all('/api/updatenfsshare', controller['/api/updatenfsshare']);
router.all('/api/deletenfsshare', controller['/api/deletenfsshare']);
router.all('/api/batchdeletenfsshare', controller['/api/batchdeletenfsshare']);
router.all('/api/getclientinnfsshare', controller['/api/getclientinnfsshare']);
router.all('/api/createclientinnfsshare', controller['/api/createclientinnfsshare']);
router.all('/api/updateclientinnfsshare', controller['/api/updateclientinnfsshare']);
router.all('/api/deleteclientinnfsshare', controller['/api/deleteclientinnfsshare']);
router.all('/api/getlocalauthusergroup', controller['/api/getlocalauthusergroup']);
router.all('/api/createlocalauthusergroup', controller['/api/createlocalauthusergroup']);
router.all('/api/updatelocalauthusergroup', controller['/api/updatelocalauthusergroup']);
router.all('/api/deletelocalauthusergroup', controller['/api/deletelocalauthusergroup']);
router.all('/api/getlocalauthuserfromgroup', controller['/api/getlocalauthuserfromgroup']);
router.all('/api/addlocalauthusertogroup', controller['/api/addlocalauthusertogroup']);
router.all('/api/removelocalauthuserfromgroup', controller['/api/removelocalauthuserfromgroup']);
router.all('/api/getlocalauthuser', controller['/api/getlocalauthuser']);
router.all('/api/createlocalauthuser', controller['/api/createlocalauthuser']);
router.all('/api/updatelocalauthuser', controller['/api/updatelocalauthuser']);
router.all('/api/deletelocalauthuser', controller['/api/deletelocalauthuser']);
router.all('/api/batchdeletelocalauthuser', controller['/api/batchdeletelocalauthuser']);
router.all('/api/geteventlog', controller['/api/geteventlog']);
router.all('/api/updateeventlog', controller['/api/updateeventlog']);
router.all('/api/getauditlog', controller['/api/getauditlog']);
router.all('/api/getentryinfo', controller['/api/getentryinfo']);
router.all('/api/getfiles', controller['/api/getfiles']);
router.all('/api/setpattern', controller['/api/setpattern']);

router.all('/api/getclusterinfo', controller['/api/getclusterinfo']);
router.all('/api/getclustertarget', controller['/api/getclustertarget']);
router.all('/api/getclusterthroughput', controller['/api/getclusterthroughput']);
router.all('/api/getclusteriops', controller['/api/getclusteriops']);
router.all('/api/getnodelist', controller['/api/getnodelist']);
router.all('/api/getnodeservice', controller['/api/getnodeservice']);
router.all('/api/getnodecpu', controller['/api/getnodecpu']);
router.all('/api/getnodememory', controller['/api/getnodememory']);
router.all('/api/getnodeiops', controller['/api/getnodeiops']);
router.all('/api/getnodethroughput', controller['/api/getnodethroughput']);
router.all('/api/getnodetarget', controller['/api/getnodetarget']);

router.all('/api/getnasserver', controller['/api/getnasserver']);
router.all('/api/createnasserver', controller['/api/createnasserver']);
router.all('/api/updatenasserver', controller['/api/updatenasserver']);
router.all('/api/getclusterserviceandclientip', controller['/api/getclusterserviceandclientip']);
 
router.all('/api/createtarget', controller['/api/createtarget']);
router.all('/api/getbuddygroup', controller['/api/getbuddygroup']);
router.all('/api/createbuddygroup', controller['/api/createbuddygroup']);
router.all('/api/getclient', controller['/api/getclient']);
router.all('/api/addclienttocluster', controller['/api/addclienttocluster']);
router.all('/api/addmetadatatocluster', controller['/api/addmetadatatocluster']);
router.all('/api/addstoragetocluster', controller['/api/addstoragetocluster']);
router.all('/api/addmanagementtocluster', controller['/api/addmanagementtocluster']);

module.exports = router;