var jwt = require('jsonwebtoken');
var userModel = require('../models/user');
var helpers = require('../helpers/helpers');
var config = require('../../config');

exports.register = function(req, res){
  var userData = {
    username: req.body.username,
    password: req.body.password,
    email: req.body.email,
    firstname: req.body.firstname,
    lastname: req.body.lastname,
    role: 'user'
  };
  if (noBlankInput(userData)) {
    new userModel(userData).save(function(err, user){
      if(err){
        var errors = helpers.errorParser(err.errors);
        res.json({status: 'failed', response: 'You account could not be created', error: errors});
      } else {
        res.json({status: 'success', response: 'You have successfully registered'});
      }
    });
  } else {
    res.json({status: 'failed', response: 'Incomplete data'});
  }
};

exports.getAllUsers = function(req, res){
  userModel.find({}, function(err, users){
    if (err) {
      res.json({status: 'failed', response: 'files could not be retrieved, pls try again later'});
    } else {
      var data = parseUserRecords(users);
      res.json({status: 'success', response: data});
    }
  });
};

exports.getUser = function(req, res){
  userModel.findOne({username: req.params.username}, function(err, user){
    if (err) {
      res.json({status: 'failed', response: 'User couldn\'t be retrieved, try again later'});
    } else {
      if (user === null){
        res.json({status: 'failed', response: 'This user does not exist'});
      } else {
        res.json({status: 'success', response: helpers.filterOutput(user, ['__v', 'password', '_id', 'role'])});
      }
    }
  });
};

exports.updateUser = function(req, res){
  var updateValues = fetchUpdateData(req.body);
  userModel.update({username: req.params.username}, updateValues, { multi: true },
  function(err, numAffected){
    if (err) {
      res.json({status: 'failed', response: 'An error occcured during update, please try again later'});
    } else {
      if (numAffected.nModified === 0 ) {
        res.json({status: 'failed', response: 'User not found'});
      } else {
        res.json({status: 'success', response: 'User successfully updated'});
      }
    }
  });
};

exports.deleteUser = function(req, res){
  userModel.remove({username: req.params.username}, function(err){
    if (err) {
      res.json({status: 'failed', response: 'Error deleting this username'});
    } else {
      res.json({status: 'success', response: 'User successfully removed'});
    }
  });
};


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
    var usr = helpers.filterOutput(element, ['__v','password', '_id', 'role']);
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
