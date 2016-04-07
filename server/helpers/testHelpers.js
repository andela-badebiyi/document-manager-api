var usr = require('../models/user');
var role = require('../models/role');


exports.dropUserDatabase = function(mongoose, cb){
	mongoose.connection.collections['users'].drop( function(err) {
		cb(err);
	});
};

exports.dropRoleDatabase = function(mongoose, cb){
	mongoose.connection.collections['roles'].drop( function(err) {
		cb(err);
	});
};

exports.dropDocumentDatabase = function(mongoose, cb){
	mongoose.connection.collections['documents'].drop( function(err) {
		cb(err);
	});
};

exports.register = function(userData, cb){
	usr.findOne({username: userData.username}, function(err, data){
		if(!data){
			new usr.save(userData, function(err, done){
				cb();
			});
		} else{
			cb();
		}
	});
};

exports.login = function(userData, request, cb){
	registerUser(userData, function(){
		request.post('/users/login').set('Content-Type', 'application/x-www-form-urlencoded').
		send({username: userData.username, password: userData.password}).end(function(err, res){
			var usrToken = JSON.parse(res.text).token;
			cb(usrToken);
		});
	});
};

exports.roleSeeder = function(seed, cb){
	role.create(seed.user, seed.admin, seed.guest, function(err, user, admin, guest){
		cb();
	});
};

function registerUser(userData, cb){
	usr.findOne({username: userData.username}, function(err, data){
		if(!data){
			new usr(userData).save(function(err, user){
				cb();
			});
		} else{
			cb();
		}
	});
}