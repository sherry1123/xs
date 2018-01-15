const router = new require('koa-router')();
const controller = require('./controller');

router.all('/api/getcpuusage', controller['/api/getcpuusage']);
router.all('/api/getmemoryusage', controller['/api/getmemoryusage']);

module.exports = router;