describe('the user model', function(){
  var mongoose = require('mongoose');
  var usrModel = require('../models/user.js');
  var docModel = require('../models/document.js');
  var roleModel = require('../models/role.js');
  var userRole;

  beforeEach(function(done){
    
  });

  afterEach(function(){
    usrModel.remove({}, function(err){
      if(err) console.log(err);
    })
  });
});
