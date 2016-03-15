var mongoose = require('mongoose');
var db = mongoose.connection;
db.on('error', function(err){
  console.log(err);
});
db.on('open', function(){
  var userSchema = new mongoose.Schema({
    username: {
      type: String,
      required: [true, 'You need to enter a username'],
      maxlength: [50, 'Username is too long'];
    },
    firstname: {
      type: String,
      required: [true, 'You need to enter a firstname']
    },
    lastname: {
      type: String,
      required: [true, 'You need to enter a lastname'];
    },
    email: {
      type: String,
      required: [true, 'You need to enter a username'],
      match: [/\b[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}\b/gi, "This is not a valid email"]
    },
    password: {
      type: String,
      required: [true, 'You need to enter a password'],
      minlength: [6, 'Password is too short']
    }
  });

  var userModel = mongoose.model('User', userSchema);
  module.exports = userModel;
});
mongoose.connect('mongodb://localhost/dms');
