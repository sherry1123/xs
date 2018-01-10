const router = new require('koa-router')();
const controller = require('../controller');

router.get('/test', controller.test.get);
router.post('/test', controller.test.post);
router.put('/test', controller.test.put);
router.delete('/test', controller.test.delete);

module.exports = router;