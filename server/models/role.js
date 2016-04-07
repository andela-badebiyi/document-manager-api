var mongoose = require('../database/db');
var autoIncrement = require('mongoose-auto-increment');
var uniqueValidator = require('mongoose-unique-validator');

var roleSchema = new mongoose.Schema({
  role: {
    type: String,
    unique: [true, 'This role already exists']
  }
});

roleSchema.plugin(uniqueValidator, {message: 'This {PATH} already exists'});
roleSchema.plugin(autoIncrement.plugin, 'Role');

module.exports = mongoose.model('Role', roleSchema);
