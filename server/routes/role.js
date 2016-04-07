var roleRoutes = require('../controllers/roleController');

module.exports = function(roleRouter){
	//route to create roles
	roleRouter.post('/', roleRoutes.create);

	//route to update roles
	roleRouter.patch('/:id', roleRoutes.update);

	//route to delete role
	roleRouter.delete('/:id', roleRoutes.delete);

	//route to show all roles
	roleRouter.get('/', roleRoutes.getAll);
};