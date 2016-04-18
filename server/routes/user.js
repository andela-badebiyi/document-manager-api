var userRoutes = require('../controllers/userController');
var middleware = require('../middleware/middlewares');

module.exports = function(router){
	//delete user
	router.delete('/users/:username', middleware.allowedToModify, userRoutes.deleteUser);
	//fetch all users
	router.get('/users', userRoutes.getAllUsers);

	//fetch user by username
	router.get('/users/:username', userRoutes.getUser);

	//fetch update user by username
	router.patch('/users/:username', middleware.allowedToModify, userRoutes.updateUser);

  router.put('/users/:username', middleware.allowedToModify, userRoutes.updateUser);
};