const router = new require('koa-router')();
const controller = require('../controller');

router.all('/api/getuser', controller['/api/getuser']);
router.all('/api/adduser', controller['/api/adduser']);
router.all('/api/updateuser', controller['/api/updateuser']);
router.all('/api/deleteuser', controller['/api/deleteuser']);

module.exports = router;