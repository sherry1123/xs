const router = new require('koa-router')();
const controller = require('../controller');

router.all('/api/getuser', controller['/api/getuser']);
router.all('/api/createuser', controller['/api/createuser']);
router.all('/api/updateuser', controller['/api/updateuser']);
router.all('/api/deleteuser', controller['/api/deleteuser']);

module.exports = router;