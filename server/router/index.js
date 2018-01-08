const router = new require('koa-router')();
const testController = require('../controller/test');

router.get('/test', testController.index);
router.get('/test/get', testController.get);
router.post('/test/post', testController.post);

module.exports = router;