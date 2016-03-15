var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
var autoIncrement = require('mongoose-auto-increment');

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
  content: String,
  dateCreated: String,
  lastModified: String
});
documentSchema.plugin(uniqueValidator);
documentSchema.plugin(autoIncrement.plugin, 'Document');
module.exports = mongoose.model('Document', documentSchema);
