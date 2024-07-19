const Router = require('koa-router');
const router = new Router();

const ctrl = require('../controllers/users');

router.get('/users', ctrl.getAllUsers);
router.get('/user/:id', ctrl.getUserById);
router.put('/user/:id', ctrl.updateUser);
router.post('/user', ctrl.createUser);
router.delete('/user/:id', ctrl.deleteUser);
router.get('/manager/:id/employees', ctrl.getManagerAndEmployees);
router.post('/sample-users', ctrl.addSampleUsers);

router.allowedMethods();

module.exports = router;
