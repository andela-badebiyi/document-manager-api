process.env.NODE_ENV = 'testing';
var exp = require('../index');
var request = require('supertest')(exp.app);
var mongoose = require('../server/database/db');
var testUsers = require('./data/user');
var th = require('../server/helpers/testHelpers');
var usrToken;

describe('GET /', function(){
	it('should say welcome', function(done){
		request.get('/').expect(200).end(function(err, res){
			expect(err).toBe(null);
			expect(JSON.parse(res.text).response).toBe("Welcome to our home page");
			done();
		});
	});
});


describe('user registration', function(){
	beforeEach(function(done){
		th.dropUserDatabase(mongoose, function(err){
			done();
		});
	});
	
	it('should return "incomplete data" for incomplete fields', function(done){
		request.post('/users').set('Content-Type', 'application/x-www-form-urlencoded')
		.send(testUsers.no_email).end(function(err, res){
			expect(JSON.parse(res.text).response).toBe("Incomplete data");
			expect(JSON.parse(res.text).status).toBe("failed");
			done();
		});
	});

	
	it('should reject invalid emails', function(done){
		request.post('/users').set('Content-Type', 'application/x-www-form-urlencoded').
		send(testUsers.bodun_conflict).end(function(err, res){
			expect(JSON.parse(res.text).status).toBe('failed');
			expect(JSON.parse(res.text).error).not.toBe(null);
			expect(JSON.parse(res.text).error[0].message).toBe('This is not a valid email');
			done();
		});
	});


	it('should reject a password lesser than 6 digits', function(done){
		request.post('/users').set('Content-Type', 'application/x-www-form-urlencoded').
		send(testUsers.short_password).end(function(err, res){
			expect(JSON.parse(res.text).status).toBe('failed');
			expect(JSON.parse(res.text).error).not.toBe(null);
			expect(JSON.parse(res.text).error[0].message).toBe('Password is too short');
			done();
		});
	});

	it('should accept valid user and register user', function(done){
		request.post('/users').set('Content-Type', 'application/x-www-form-urlencoded').
		send(testUsers.bodunde).end(function(err, res){
			expect(JSON.parse(res.text).status).toBe('success');
			done();
		});
	});
	
});

describe('user login', function(){
	beforeEach(function(done){
		th.register(testUsers.bodunde, function(){
			done();
		});
	});


	it('should reject invalid username', function(done){
		request.post('/users/login').set('Content-Type', 'application/x-www-form-urlencoded').
		send({username: 'unknownuser', password: 'unknown_pass'}).end(function(err, res){
			expect(JSON.parse(res.text).status).toBe('failed');
			expect(JSON.parse(res.text).response).toBe('Incorrect username');
			done();
		});
	});

	it('should reject valid username but invalid password', function(done){
		request.post('/users/login').set('Content-Type', 'application/x-www-form-urlencoded').
		send({username: testUsers.bodunde.username, password: 'invalid_password'}).end(function(err, res){
			expect(JSON.parse(res.text).status).toBe('failed');
			expect(JSON.parse(res.text).response).toBe('You submitted an incorrect password');
			done();
		});
	});

	it('should return accept valid username and password and return token', function(done){
		request.post('/users/login').set('Content-Type', 'application/x-www-form-urlencoded').
		send({username: testUsers.bodunde.username, password: testUsers.bodunde.password}).end(function(err, res){
			expect(JSON.parse(res.text).token).not.toBe(undefined);
			expect(JSON.parse(res.text).token.length).toBeGreaterThan(20);
			done();
		});
	});
});

describe('fetch users', function(){
	beforeEach(function(done){
		th.login(testUsers.bodunde, request, function(token){
			usrToken = token;
			done();
		});
	});

	it('should not return all users if token is invalid', function(done){
		request.get('/users').set('token', 'invalidtoken').end(function(err, res){
			expect(JSON.parse(res.text).response).toBe('Your token is invalid');
			expect(JSON.parse(res.text).status).toBe('failed');
			done();
		});
	});

	it('should return list of all users if token is valid', function(done){
		request.get('/users').set('token', usrToken).end(function(err, res){
			expect(JSON.parse(res.text).status).toBe('success');
			expect(JSON.parse(res.text).response.length).toBeGreaterThan(0);
			done();
		});
	});

	it('should return "user does not exist" for invalid single user', function(done){
		request.get('/users/badUserName').set('token', usrToken).end(function(err, res){
			expect(JSON.parse(res.text).status).toBe('failed');
			expect(JSON.parse(res.text).response).toBe('This user does not exist');
			done();
		});
	});

	it('should fetch single user by username', function(done){
		request.get('/users/'+testUsers.bodunde.username).set('token', usrToken).end(function(err, res){
			expect(JSON.parse(res.text).status).toBe('success');
			expect(JSON.parse(res.text).response.firstname).toBe(testUsers.bodunde.firstname);
			expect(JSON.parse(res.text).response.lastname).toBe(testUsers.bodunde.lastname);
			expect(JSON.parse(res.text).response.email).toBe(testUsers.bodunde.email);
			done();
		});
	});
});


describe('update user', function(){
	beforeEach(function(done){
		th.login(testUsers.bodunde, request, function(token){
			usrToken = token;
			done();
		});
	});

	
	it('should fail if you try to modify a user that isn\'t you', function(done){
		request.patch('/users/anotherUser').set('token', usrToken).set('Content-Type', 'application/x-www-form-urlencoded')
		.send({email: 'newemail@gmail.com'}).end(function(err, res){
			expect(JSON.parse(res.text).status).toBe('failed');
			expect(JSON.parse(res.text).response).toBe('You are not authorized to perform on action on this user');
			done();
		});
	});


	
	it('should successfully update valid user', function(done){
		request.patch('/users/'+testUsers.bodunde.username).set('token', usrToken).set('Content-Type', 'application/x-www-form-urlencoded')
		.send({email: 'newemail@gmail.com'}).end(function(err, res){
			expect(JSON.parse(res.text).status).toBe('success');
			expect(JSON.parse(res.text).response).toBe('User successfully updated');
			done();
		});
	});
	
	
	it('should modify different user if you are signed in as admin', function(done){
		th.login(testUsers.admin, request, function(token){
			request.patch('/users/'+testUsers.bodunde.username).set('token', token).set('Content-Type', 'application/x-www-form-urlencoded')
			.send({email: 'jdoe@yahoo.com'}).end(function(err, res){
				expect(err).toBe(null);
				expect(JSON.parse(res.text).response).toBe("User successfully updated");
				done();
			});
		});
	});
	
});


describe('delete user', function(){
	beforeEach(function(done){
		th.login(testUsers.bodunde, request, function(token){
			usrToken = token;
			done();
		});
	});

	it('should fail if you try to delete a user that isn\'t you', function(done){
		request.delete('/users/anotherUser').set('token', usrToken).end(function(err, res){
			expect(JSON.parse(res.text).status).toBe('failed');
			expect(JSON.parse(res.text).response).toBe('You are not authorized to perform on action on this user');
			done();
		});
	});

	it('should delete user if user is you', function(done){
		request.delete('/users/'+testUsers.bodunde.username).set('token', usrToken).end(function(err, res){
			expect(JSON.parse(res.text).status).toBe('success');
			expect(JSON.parse(res.text).response).toBe('User successfully removed');
			done();
		});
	});

	it('should any user if you are admin', function(done){
		th.login(testUsers.admin, request, function(token){
			request.delete('/users/'+testUsers.bodunde.username).set('token', token).end(function(err, res){
				expect(JSON.parse(res.text).status).toBe('success');
				expect(JSON.parse(res.text).response).toBe('User successfully removed');
				done();
			});
		});
	});
});