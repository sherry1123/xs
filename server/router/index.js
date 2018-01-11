const router = new require('koa-router')();
const controller = require('../controller');

router.get('/user', controller.user.get);
router.post('/user', controller.user.post);
router.put('/user', controller.user.put);
router.delete('/user', controller.user.delete);

module.exports = router;