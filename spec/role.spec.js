process.env.NODE_ENV = 'testing';
var exp = require('../index');
var request = require('supertest')(exp.app);
var mongoose = require('../server/database/db');
var testRoles = require('./data/role');
var testUsers = require('./data/user');
var th = require('../server/helpers/testHelpers');
var seed = require('../server/database/seed');
var usrToken, userId, guestId, adminId;

describe('create roles', function(){
	beforeEach(function(done){
		th.dropRoleDatabase(mongoose, function(err){
			seed.role(()=>{
				th.login(testUsers.admin, request, function(token){
					usrToken = token;
					done();
				});
			});
		});
	});

	it('should fail to create if user isn\'t an admin', function(done){
		th.login(testUsers.bodunde, request, function(token){
			request.post('/roles').set('token', token).set('Content-Type', 'application/x-www-form-urlencoded').
			send({role: 'new role'}).end(function(err, res){
				expect(res.body.status).toBe('failed');
				expect(res.body.response).toBe('You are not an admin user');
				done();
			});
		});
	});

	it('should create if user is admin', function(done){
		request.post('/roles').set('token', usrToken).set('Content-Type', 'application/x-www-form-urlencoded')
		.send({role: 'new role'}).end(function(err, res){
			expect(res.body.status).toBe('success');
			expect(res.body.response).toBe('new role created successfully');
			done();
		});
	});

	it('should reject duplicate roles', function(done){
		request.post('/roles').set('token', usrToken).set('Content-Type', 'application/x-www-form-urlencoded')
		.send({role: 'user'}).end(function(err, res){
			expect(res.body.status).toBe('failed');
			expect(res.body.errors[0].message).toBe('This role already exists');
			done();
		});
	});
});

describe('update roles', function(){
	beforeEach(function(done){
		th.dropRoleDatabase(mongoose, function(err){
			seed.role(function(user_id, admin_id, guest_id){
				th.login(testUsers.admin, request, function(token){
					userId = user_id;
					adminId = admin_id;
					guestId = guest_id;
					usrToken = token;
					done();
				});
			});
		});
	});

	it('should fail to update if user isn\'t an admin', function(done){
		th.login(testUsers.bodunde, request, function(token){
			request.patch('/roles/'+userId).set('token', token).set('Content-Type', 'application/x-www-form-urlencoded').
			send({role: 'updated role'}).end(function(err, res){
				expect(res.body.status).toBe('failed');
				expect(res.body.response).toBe('You are not an admin user');
				done();
			});
		});
	});

	it('should update if user is admin', function(done){
		request.patch('/roles/'+userId).set('token', usrToken).set('Content-Type', 'application/x-www-form-urlencoded').
		send({role: 'updated role'}).end(function(err, res){
			expect(res.body.status).toBe('success');
			expect(res.body.response).toBe('Record updated successfully');
			done();
		});
	});

	it('should throw error if you try to update role that does not exist', function(done){
		request.patch('/roles/1000').set('token', usrToken).set('Content-Type', 'application/x-www-form-urlencoded').
		send({role: 'updated role'}).end(function(err, res){
			expect(res.body.status).toBe('failed');
			expect(res.body.response).toBe('Record not found, unable to update');
			done();
		});
	});
});

describe('delete roles', function(){
	beforeEach(function(done){
		th.dropRoleDatabase(mongoose, function(err){
			seed.role(function(user_id, admin_id, guest_id){
				th.login(testUsers.admin, request, function(token){
					userId = user_id;
					adminId = admin_id;
					guestId = guest_id;
					usrToken = token;
					done();
				});
			});
		});
	});

	it('should not delete is user isnt\'t admin', function(done){
		th.login(testUsers.bodunde, request, function(token){
			request.delete('/roles/'+userId).set('token', token).end(function(err, res){
				expect(res.body.status).toBe('failed');
				expect(res.body.response).toBe('You are not an admin user');
				done();
			});
		});
	});

	it('should delete role if user is admin', function(done){
		request.delete('/roles/'+userId).set('token', usrToken).end(function(err, res){
			expect(res.body.status).toBe('success');
			expect(res.body.response).toBe('successfully deleted');
			done();
		});
	});
});

describe('get roles', function(){
	beforeEach(function(done){
		th.dropRoleDatabase(mongoose, function(err){
			seed.role(function(user_id, admin_id, guest_id){
				th.login(testUsers.admin, request, function(token){
					userId = user_id;
					adminId = admin_id;
					guestId = guest_id;
					usrToken = token;
					done();
				});
			});
		});
	});
	
	it('should return roles if you are the admin', function(done){
		request.get('/roles/').set('token', usrToken).end(function(err, res){
			expect(res.body.response.length).toBe(3);
			done();
		});
	});

	it('should fail to return roles if you are not admin', function(done){
		th.login(testUsers.bodunde, request, function(token){
			request.get('/roles/').set('token', token).end(function(err, res){
				expect(res.body.status).toBe('failed');
				expect(res.body.response).toBe('You are not an admin user');
				done();
			});
		});
	});

});
