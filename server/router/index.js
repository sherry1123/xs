const router = new require('koa-router')();
const controller = require('../controller');

router.all('/api/testapi', controller['/api/testapi']);
router.all('/api/getuser', controller['/api/getuser']);
router.all('/api/adduser', controller['/api/adduser']);
router.all('/api/updateuser', controller['/api/updateuser']);
router.all('/api/deleteuser', controller['/api/deleteuser']);
router.all('/api/login', controller['/api/login']);
router.all('/api/logout', controller['/api/logout']);
router.all('/api/geteventlog', controller['/api/geteventlog']);
router.all('/api/updateeventlog', controller['/api/updateeventlog']);
router.all('/api/getauditlog', controller['/api/getauditlog']);
router.all('/api/gethardware', controller['/api/gethardware']);
router.all('/api/testmail', controller['/api/testmail']);
router.all('/api/init', controller['/api/init']);
router.all('/api/antiinit', controller['/api/antiinit']);
router.all('/api/clusterenvcheck', controller['/api/clusterenvcheck']);

module.exports = router;