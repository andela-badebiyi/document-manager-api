var usr = require('../models/user');
var role = require('../models/role');
var bcrypt = require('bcrypt');


exports.dropUserDatabase = (mongoose, cb) => {
	mongoose.connection.collections['users'].drop((err) => {
		cb(err);
	});
};

exports.dropRoleDatabase = (mongoose, cb) => {
	mongoose.connection.collections['roles'].drop((err) => {
		cb(err);
	});
};

exports.dropDocumentDatabase = (mongoose, cb) => {
	mongoose.connection.collections['documents'].drop((err) => {
		cb(err);
	});
};

exports.register = (userData, cb) => {
	usr.findOne({username: userData.username}, (err, data) => {
		if(!data){
			userData.password = bcrypt.hashSync(userData.password, 8);
			new usr.save(userData, (err, done) => {
				cb();
			});
		} else{
			cb();
		}
	});
};

exports.login = (userData, request, cb) => {
	registerUser(userData, () => {
		request.post('/users/login').set('Content-Type', 'application/x-www-form-urlencoded').
		send({username: userData.username, password: userData.password}).end((err, res) => {
			var usrToken = res.body.token;
			cb(usrToken);
		});
	});
};

exports.formatDate = (date) => {
	var d = new Date(date);
	var year = d.getFullYear() < 10 ? '0'+d.getFullYear() : d.getFullYear();
	var month = d.getMonth() < 10 ? '0'+d.getMonth() : d.getMonth();
	var day = d.getDate() < 10 ? '0'+d.getDate() : d.getDate();
	return year + "-" + month + "-" + day;
}



function registerUser(userData, cb){
	usr.findOne({username: userData.username}, (err, data) => {
		if(!data){
			userData.password = bcrypt.hashSync(userData.password, 8);
			new usr(userData).save(function(err, user){
				cb();
			});
		} else{
			cb();
		}
	});
}