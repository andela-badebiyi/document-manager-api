var mongoose = require('mongoose');
var jwt = require('jsonwebtoken');
var userModel = require('../models/user');
var config = require('../config');
var helpers = require('../helpers/helpers');

exports.register = function(req, res){
  var userData = {
    username: req.body.username,
    password: req.body.password,
    email: req.body.email,
    firstname: req.body.firstname,
    lastname: req.body.lastname,
    role_id: 0
  };

  if (noBlankInput(userData)) {
    new userModel(userData).save(function(err, user){
      if(err){
        var errors = helpers.errorParser(err.errors);
        res.json({message: 'You account could not be created', error: errors});
      } else {
        res.json({message: 'You have successfully registered'});
      }
    });
  } else {
    res.json({message: 'Incomplete data'});
  }
};

exports.getAllUsers = function(req, res){
  userModel.find({}, function(err, users){
    if (err) {
      res.json({message: 'files could not be retrieved, pls try again later'});
    } else {
      var data = parseUserRecords(users);
      res.json(data);
    }
  });
}

exports.getUser = function(req, res){
  userModel.findOne({username: req.params.username}, function(err, user){
    if (err) {
      res.json({message: 'User couldn\'t be retrieved, try again later'});
    } else {
      if (user == null){
        res.json({message: 'This user does not exist'});
      } else {
        res.json(helpers.filterOutput(user, ['__v', 'password', '_id', 'role_id']));
      }
    }
  });
}

exports.updateUser = function(req, res){
  var updateValues = fetchUpdateData(req.body);
  userModel.update({username: req.params.username}, updateValues, { multi: true },
  function(err, numAffected){
    if (err) {
      res.json({message: 'An error occcured during update, please try again later'});
    } else {
      if (numAffected.nModified == 0 ) {
        res.json({message: 'User not found'});
      } else {
        res.json({message: 'User successfully updated'});
      }
    }
  });
}

exports.deleteUser = function(req, res){
  userModel.remove({username: req.params.username}, function(err){
    if (err) {
      res.json({message: 'Error deleting this username'});
    } else {
      res.json({message: 'User successfully removed'});
    }
  })
}

mongoose.connect(config.database);

function noBlankInput(userData){
  if(userData.username !== undefined && userData.email !== undefined &&
  userData.password !== undefined && userData.firstname !== undefined &&
  userData.lastname !== undefined){
    return true;
  }
  return false;
}

function parseUserRecords(users){
  var parsedResult = [];
  users.forEach(function(element){
    var usr = helpers.filterOutput(element, ['__v','password', '_id', 'role_id']);
    parsedResult.push(usr);
  });
  return parsedResult;
}


function fetchUpdateData(postBody){
  var output = {};
  for(var key in postBody){
    if(postBody.hasOwnProperty(key)){
      output[key] = postBody[key];
    }
  }
  return output;
}
