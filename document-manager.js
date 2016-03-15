var UserModel = require('./models/user.js');
var DocumentModel = require('./models/document.js');
var RoleModel = require('./models/role.js');
var mongoose = require('mongoose');

new RoleModel({role: 'user'}).save(function(err, data){
  if(!err) console.log('saved!');
});

new RoleModel({role: 'admin'}).save(function(err, data){
  if(!err) console.log('saved!');
});
mongoose.connect('mongodb://localhost/dms');
