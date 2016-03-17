var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
var autoIncrement = require('mongoose-auto-increment');
var timestamps = require('mongoose-timestamp');

//Initialize mongoose-auto-increment
var connection = mongoose.createConnection("mongodb://localhost/dms");
autoIncrement.initialize(connection);

var documentSchema = new mongoose.Schema({
  owner_id: {
    type: Number,
    required: [true, "An owner_id is required"]
  },
  title: {
    type: String,
    required: [true, "A title is required"],
    unique: [true, "This title already exists"]
  },
  content: String
});
documentSchema.plugin(uniqueValidator, {message: 'A document with this {PATH} already exists'});
documentSchema.plugin(autoIncrement.plugin, 'Document');
documentSchema.plugin(timestamps, {createdAt: 'dateCreated', updatedAt: 'lastModified'});
module.exports = mongoose.model('Document', documentSchema);
