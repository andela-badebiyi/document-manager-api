var express = require('express');
var bodyparser = require('body-parser');
var UserModel = require('./models/user');
var DocumentModel = require('./models/document');
var RoleModel = require('./models/role');
var config = require('./config');
var authRoutes = require('./controllers/authController');
var userRoutes = require('./controllers/userController');
var documentRoutes = require('./controllers/documentController');

var app = express();

//use body parser
app.use(bodyparser.urlencoded({extended: true}));

//homepage
app.get('/', function(req, res){
  return res.json({message: 'Welcome to our home page'});
});

//log a user in
app.post('/users/login',  function(req, res){
  authRoutes.login(req, res);
});

//create a new user
app.post('/users', function(req, res){
  userRoutes.register(req, res);
});

//fetch all users
app.get('/users', function(req, res){
  userRoutes.getAllUsers(req, res);
});

//fetch user by username
app.get('/users/:username', function(req, res){
  userRoutes.getUser(req, res);
});

//fetch update user by username
app.patch('/users/:username', function(req, res){
	userRoutes.updateUser(req, res);
});

//delete a user by username
app.delete('/users/:username', function(req, res){
	userRoutes.deleteUser(req, res);
});

//create a document
app.post('/documents', function(req, res){
	documentRoutes.create(req, res);
});

//fetch all documents
app.get('/documents', function(req, res){
	documentRoutes.getAll(req, res);
});

//fetch a single document
app.get('/documents/:id', function(req, res){
	documentRoutes.getDocument(req, res);
});


app.listen(3000);
