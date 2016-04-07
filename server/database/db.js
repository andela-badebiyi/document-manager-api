var mongoose = require('mongoose');
var config = require('../../config');
var autoIncrement = require('mongoose-auto-increment');

//Initialize mongoose-auto-increment
if(process.env.NODE_ENV === 'testing')
	var connection = mongoose.createConnection(config.test_db);
else
	var connection = mongoose.createConnection(config.database);

autoIncrement.initialize(connection);

//connect to database
if(process.env.NODE_ENV === 'testing')
	mongoose.connect(config.test_db);
else
	mongoose.connect(config.database);
module.exports = mongoose;