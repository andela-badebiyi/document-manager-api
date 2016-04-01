var express = require('express');
var bodyparser = require('body-parser');
var config = require('./config');
var authRoutes = require('./controllers/authController');
var userRoutes = require('./controllers/userController');
var documentRoutes = require('./controllers/documentController');
var roleRoutes = require('./controllers/roleController');
var middleware = require('./middleware/middlewares');

var app = express();
var router = express.Router();
var roleRouter = express.Router();

//register middleware for router
router.use(middleware.userIsAuthenticated);
roleRouter.use(middleware.userIsAdmin);

//use this middleware on all routes
app.use(bodyparser.urlencoded({extended: true}));
//app.use(middleware.logInfo);

/** these routes require no form of authentication or validation **/

//homepage
app.get('/', function(req, res){
  return res.json({message: 'Welcome to our home page'});
});

//log a user in
app.post('/users/login', authRoutes.login);

//create a new user
app.post('/users', userRoutes.register);

/** end of no-validation-needed routes **/


//fetch all users
router.get('/users', userRoutes.getAllUsers);

//fetch user by username
router.get('/users/:username', userRoutes.getUser);

//fetch update user by username
router.patch('/users/:username', middleware.allowedToModify, userRoutes.updateUser);

//delete a user by username
router.delete('/users/:username', middleware.allowedToModify, userRoutes.deleteUser);

//create a document
router.post('/documents', documentRoutes.create);

//fetch all documents
router.get('/documents', documentRoutes.getAll);

//fetch a single document
router.get('/documents/:id', documentRoutes.getDocument);

//delete a document by document_id
router.delete('/documents/:id', middleware.allowedToModify, documentRoutes.deleteDocument);

//update a document by id
router.patch('/documents/:id', middleware.allowedToModify, documentRoutes.updateDocument);

//fetch user documents
router.get('/users/:username/documents', documentRoutes.getUserDocuments);

//route to create roles
roleRouter.post('/', rolesRoutes.create);

//route to update roles
roleRouter.patch('/:id', rolesRoutes.update);

//route to delete role
roleRouter.delete('/:id', rolesRoutes.delete);

//route to show all roles
roleRouter.get('/', rolesRoutes.getAll);

//mount router
app.use('/', router);

//mount roleRouter
app.use('/roles', roleRouter);


//deploy
app.listen(3000);
