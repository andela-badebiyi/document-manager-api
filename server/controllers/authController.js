var jwt = require('jsonwebtoken');
var userModel = require('../models/user');
var config = require('../../config');
var bcrypt = require('bcrypt');

exports.login = function(req, res){
  //fetch username and password from post vars
  var username = req.body.username;
  var password = req.body.password;

  userModel.findOne({'username': username}, function(err, user){
    if(err) {
      res.json({status: 'failed', response: 'error connecting to database'});
    } else {
      if (user === null) {
        res.json({status: 'failed', response: 'Incorrect username'});
      } else {
        if(!bcrypt.compareSync(password, user.password)){
          res.json({status: 'failed', response: 'You submitted an incorrect password'});
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
  return jwt.sign(user, config.secretkey,{expiresIn: 3600*12});
}
