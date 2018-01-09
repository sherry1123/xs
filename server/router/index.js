const router = new require('koa-router')();
const controller = require('../controller');

router.get('/test', controller.test.index);
router.get('/test/get', controller.test.get);
router.post('/test/post', controller.test.post);

module.exports = router;