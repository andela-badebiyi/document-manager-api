process.env.NODE_ENV = 'testing';
var exp = require('../index');
var request = require('supertest')(exp.app);
var mongoose = require('../server/database/db');
var testRoles = require('./data/role');
var th = require('../server/helpers/testHelpers');
var usrToken;

describe('create roles', function(){
	beforeEach(function(done){
		th.dropRole.Database(mongoose, function(err){
			th.roleSeeder(testRoles, function(){
				done();
			});
		});
	});

	it('should fail to create if user isn\'t an admin', function(done){
		th.login(testUsers.bodunde, request, function(token){
			request.post('/roles/').set('token', token).set('Content-Type', 'application/x-www-form-urlencoded').
			send({role: 'new role'});
			done();
		});
	});
});