var mongoose = require('mongoose');
var autoIncrement = require('mongoose-auto-increment');
var uniqueValidator = require('mongoose-unique-validator');

var connection = mongoose.createConnection('mongodb://localhost/dms');
autoIncrement.initialize(connection);

var roleSchema = new mongoose.Schema({
  role: {
    type: String,
    unique: [true, 'This role already exists']
  }
});

roleSchema.plugin(uniqueValidator);
roleSchema.plugin(autoIncrement.plugin, 'Role');

module.exports = mongoose.model('Role', roleSchema);
