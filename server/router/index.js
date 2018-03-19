const Router = require('koa-router');
const router = new Router();
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
router.all('/api/checkclusterenv', controller['/api/checkclusterenv']);
router.all('/api/getnodelist', controller['/api/getnodelist']);
router.all('/api/getmetanodesoverview', controller['/api/getmetanodesoverview']);
router.all('/api/getmetanode', controller['/api/getmetanode']);
router.all('/api/getstoragenodesoverview', controller['/api/getstoragenodesoverview']);
router.all('/api/getstoragenode', controller['/api/getstoragenode']);
router.all('/api/getclientstats', controller['/api/getclientstats']);
router.all('/api/getuserstats', controller['/api/getuserstats']);

module.exports = router;