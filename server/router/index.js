const Router = require('koa-router');
const router = new Router();
const controller = require('../controller');

router.all('/api/testapi', controller['/api/testapi']);
router.all('/api/syncsystemstatus', controller['/api/syncsystemstatus']);
router.all('/api/checkclusterenv', controller['/api/checkclusterenv']);
router.all('/api/getdisklist', controller['/api/getdisklist']);
router.all('/api/init', controller['/api/init']);
router.all('/api/antiinit', controller['/api/antiinit']);
router.all('/api/receiveevent', controller['/api/receiveevent']);
router.all('/api/login', controller['/api/login']);
router.all('/api/logout', controller['/api/logout']);
router.all('/api/getuser', controller['/api/getuser']);
router.all('/api/adduser', controller['/api/adduser']);
router.all('/api/updateuser', controller['/api/updateuser']);
router.all('/api/deleteuser', controller['/api/deleteuser']);
router.all('/api/testmail', controller['/api/testmail']);
router.all('/api/gethardware', controller['/api/gethardware']);
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
router.all('/api/deletesnapshots', controller['/api/deletesnapshots']);
router.all('/api/rollbacksnapshot', controller['/api/rollbacksnapshot']);
router.all('/api/getsnapshottask', controller['/api/getsnapshottask']);
router.all('/api/createsnapshottask', controller['/api/createsnapshottask']);
router.all('/api/updatesnapshottask', controller['/api/updatesnapshottask']);
router.all('/api/enablesnapshottask', controller['/api/enablesnapshottask']);
router.all('/api/disablesnapshottask', controller['/api/disablesnapshottask']);
router.all('/api/deletesnapshottask', controller['/api/deletesnapshottask']);
router.all('/api/deletesnapshottasks', controller['/api/deletesnapshottasks']);
router.all('/api/getnasexport', controller['/api/getnasexport']);
router.all('/api/createnasexport', controller['/api/createnasexport']);
router.all('/api/updatenasexport', controller['/api/updatenasexport']);
router.all('/api/deletenasexport', controller['/api/deletenasexport']);
router.all('/api/geteventlog', controller['/api/geteventlog']);
router.all('/api/updateeventlog', controller['/api/updateeventlog']);
router.all('/api/getauditlog', controller['/api/getauditlog']);
router.all('/api/getentryinfo', controller['/api/getentryinfo']);
router.all('/api/getfiles', controller['/api/getfiles']);
router.all('/api/setpattern', controller['/api/setpattern']);

module.exports = router;