var mongoose = require('../database/db');
var autoIncrement = require('mongoose-auto-increment');
var uniqueValidator = require('mongoose-unique-validator');
var bcrypt = require('bcrypt');

var userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'You need to enter a username'],
    maxlength: [50, 'Username is too long'],
    unique: true
  },
  firstname: {
    type: String,
    required: [true, 'You need to enter a firstname']
  },
  lastname: {
    type: String,
    required: [true, 'You need to enter a lastname']
  },
  email: {
    type: String,
    required: [true, 'You need to enter a username'],
    match: [/^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/, "This is not a valid email"],
    unique: true
  },
  password: {
    type: String,
    required: [true, 'You need to enter a password'],
    minlength: [6, 'Password is too short']
  },
  role: {
    type: String,
    required: [true, 'You need a role id']
  }
});

//hash passwords
userSchema.pre('save', function(next){
  user = this;
  this.password = bcrypt.hashSync(user.password, 8);
  next();
})

userSchema.plugin(uniqueValidator, {message: 'This {PATH} already exists'});
userSchema.plugin(autoIncrement.plugin, 'User');
module.exports = mongoose.model('User', userSchema);