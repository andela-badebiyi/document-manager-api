var mongoose = require('mongoose');
var jwt = require('jsonwebtoken');
var userModel = require('../models/user');
var config = require('../config');

exports.login = function(req, res){
  //fetch username and password from post vars
  var username = req.body.username;
  var password = req.body.password;

  userModel.findOne({'username': username}, function(err, user){
    if(err) {
      res.json({message: 'error connecting to database'});
    } else {
      if (user.length == 0) {
        res.json({message: 'This user doesn\'t exist'});
      } else {
        if(password !== user.password){
          res.json({message: 'You submitted an incorrect password'});
        } else {
          res.json({token: fetchToken(user)});
        }
      }
    }
  });
};

exports.logout = function(req, res){

};

function fetchToken(user){
  return jwt.sign(user, config.secretkey,{expiresIn: 3600});
}
