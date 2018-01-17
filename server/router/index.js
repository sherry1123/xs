const router = new require('koa-router')();
const controller = require('../controller');

router.all('/api/testapi', controller['/api/testapi']);
router.all('/api/getuser', controller['/api/getuser']);
router.all('/api/adduser', controller['/api/adduser']);
router.all('/api/updateuser', controller['/api/updateuser']);
router.all('/api/deleteuser', controller['/api/deleteuser']);
router.all('/api/login', controller['/api/login']);
router.all('/api/logout', controller['/api/logout']);
router.all('/api/updateeventlog', controller['/api/updateeventlog']);
router.all('/api/updatesomeeventlog', controller['/api/updatesomeeventlog']);

module.exports = router;