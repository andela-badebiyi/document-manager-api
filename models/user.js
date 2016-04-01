var mongoose = require('mongoose');
var autoIncrement = require('mongoose-auto-increment');
var uniqueValidator = require('mongoose-unique-validator');

//Initialize mongoose-auto-increment
var connection = mongoose.createConnection("mongodb://localhost/dms");
autoIncrement.initialize(connection);

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
    match: [/\b[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}\b/gi, "This is not a valid email"],
    unique: true
  },
  password: {
    type: String,
    required: [true, 'You need to enter a password'],
    minlength: [6, 'Password is too short']
  },
  role_id: {
    type: Number,
    required: [true, 'You need a role id']
  }
});

userSchema.plugin(uniqueValidator, {message: 'This {PATH} already exists'});
userSchema.plugin(autoIncrement.plugin, 'User');
module.exports = mongoose.model('User', userSchema);
