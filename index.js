var express = require('express');
var bodyparser = require('body-parser');
var config = require('./config');
var documentRoute = require('./server/routes/document');
var userRoute = require('./server/routes/user');
var roleRoute = require('./server/routes/role');
var authRoutes = require('./server/controllers/authController');
var userRoutes = require('./server/controllers/userController');


var middleware = require('./server/middleware/middlewares');

var app = express();
var router = express.Router();
var roleRouter = express.Router();

//register middleware for routes
router.use(middleware.userIsAuthenticated);
roleRouter.use(middleware.userIsAdmin);

//use this middleware on all routes
app.use(bodyparser.urlencoded({extended: true}));

//log a user in
app.post('/users/login', authRoutes.login);

//create a new user
app.post('/users', userRoutes.register);

//homepage
app.get('/', function(req, res){
  return res.json({response: 'Welcome to our home page'});
});

userRoute(router);
documentRoute(router);
roleRoute(roleRouter);


//mount roleRouter
app.use('/roles', roleRouter);

//mount router
app.use('/', router);


//deploy
server = app.listen(3000);


//export for testing
exports.app = app;
exports.serv = server;