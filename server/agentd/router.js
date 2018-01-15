const router = new require('koa-router')();
const controller = require('./controller');

router.all('/api/getcpu', controller['/api/getcpu']);
router.all('/api/getmemory', controller['/api/getmemory']);
router.all('/api/getiops', controller['/api/getiops']);

module.exports = router;