process.env.NODE_ENV = 'testing';
var exp = require('../index');
var request = require('supertest')(exp.app);
var mongoose = require('../server/database/db');
var testUsers = require('./data/user');
var th = require('../server/helpers/testHelpers');
var usrToken;

describe('GET /', ()=>{
	it('should say welcome', done =>{
		request.get('/').expect(200).end((err, res)=>{
			expect(err).toBe(null);
			expect(res.body.response).toBe("Welcome to our home page");
			done();
		});
	});
});


describe('user registration', ()=>{
	beforeEach((done)=>{
		th.dropUserDatabase(mongoose, err=>{
			done();
		});
	});

	it('should return "incomplete data" for incomplete fields', done=>{
		request.post('/users').set('Content-Type', 'application/x-www-form-urlencoded')
		.send(testUsers.no_email).end((err, res)=>{
			expect(res.body.response).toBe("Incomplete data");
			expect(res.body.status).toBe("failed");
			done();
		});
	});


	it('should reject invalid emails', done=>{
		request.post('/users').set('Content-Type', 'application/x-www-form-urlencoded').
		send(testUsers.bodun_conflict).end((err, res)=>{
			expect(res.body.status).toBe('failed');
			expect(res.body.error).not.toBe(null);
			expect(res.body.error[0].message).toBe('This is not a valid email');
			done();
		});
	});


	it('should reject a password lesser than 6 digits', done=>{
		request.post('/users').set('Content-Type', 'application/x-www-form-urlencoded').
		send(testUsers.short_password).end((err, res)=>{
			expect(res.body.status).toBe('failed');
			expect(res.body.error).not.toBe(null);
			expect(res.body.error[0].message).toBe('Password is too short');
			done();
		});
	});

	it('should accept valid user and register user', done =>{
		request.post('/users').set('Content-Type', 'application/x-www-form-urlencoded').
		send(testUsers.bodunde).end((err, res) =>{
			expect(res.body.status).toBe('success');
			done();
		});
	});

});


describe('user login', ()=>{
	beforeEach(done=>{
		th.register(testUsers.bodunde, ()=>{
			done();
		});
	});


	it('should reject invalid username', done => {
		request.post('/users/login').set('Content-Type', 'application/x-www-form-urlencoded').
		send({username: 'unknownuser', password: 'unknown_pass'}).end((err, res)=>{
			expect(res.body.status).toBe('failed');
			expect(res.body.response).toBe('Incorrect username');
			done();
		});
	});

	it('should reject valid username but invalid password', done=>{
		request.post('/users/login').set('Content-Type', 'application/x-www-form-urlencoded').
		send({username: testUsers.bodunde.username, password: 'invalid_password'}).end((err, res)=>{
			expect(res.body.status).toBe('failed');
			expect(res.body.response).toBe('You submitted an incorrect password');
			done();
		});
	});

	it('should return accept valid username and password and return token', (done)=>{
		request.post('/users/login').set('Content-Type', 'application/x-www-form-urlencoded').
		send({username: testUsers.bodunde.username, password: testUsers.bodunde.password}).end((err, res)=>{
			expect(res.body.token).not.toBe(undefined);
			expect(res.body.token.length).toBeGreaterThan(20);
			done();
		});
	});
});

describe('fetch users', ()=>{
	beforeEach((done)=>{
		th.login(testUsers.bodunde, request, (token)=>{
			usrToken = token;
			done();
		});
	});

	it('should not return all users if token is invalid', (done)=>{
		request.get('/users').set('token', 'invalidtoken').end((err, res)=>{
			expect(res.body.response).toBe('Your token is invalid');
			expect(res.body.status).toBe('failed');
			done();
		});
	});

	it('should return list of all users if token is valid', (done)=>{
		request.get('/users').set('token', usrToken).end((err, res)=>{
			expect(res.body.status).toBe('success');
			expect(res.body.response.length).toBeGreaterThan(0);
			done();
		});
	});

	it('should return "user does not exist" for invalid single user', (done)=>{
		request.get('/users/badUserName').set('token', usrToken).end((err, res)=>{
			expect(res.body.status).toBe('failed');
			expect(res.body.response).toBe('This user does not exist');
			done();
		});
	});

	it('should fetch single user by username', (done)=>{
		request.get('/users/'+testUsers.bodunde.username).set('token', usrToken).end((err, res)=>{
			expect(res.body.status).toBe('success');
			expect(res.body.response.firstname).toBe(testUsers.bodunde.firstname);
			expect(res.body.response.lastname).toBe(testUsers.bodunde.lastname);
			expect(res.body.response.email).toBe(testUsers.bodunde.email);
			done();
		});
	});
});


describe('update user', ()=>{
	beforeEach((done)=>{
		th.login(testUsers.bodunde, request, (token)=>{
			usrToken = token;
			done();
		});
	});


	it('should fail if you try to modify a user that isn\'t you', (done)=>{
		request.patch('/users/anotherUser').set('token', usrToken).set('Content-Type', 'application/x-www-form-urlencoded')
		.send({email: 'newemail@gmail.com'}).end((err, res)=>{
			expect(res.body.status).toBe('failed');
			expect(res.body.response).toBe('You are not authorized to perform on action on this user');
			done();
		});
	});



	it('should successfully update valid user', (done)=>{
		request.patch('/users/'+testUsers.bodunde.username).set('token', usrToken).set('Content-Type', 'application/x-www-form-urlencoded')
		.send({email: 'newemail@gmail.com'}).end((err, res)=>{
			expect(res.body.status).toBe('success');
			expect(res.body.response).toBe('User successfully updated');
			done();
		});
	});


	it('should modify different user if you are signed in as admin', (done)=>{
		th.login(testUsers.admin, request, (token)=>{
			request.patch('/users/'+testUsers.bodunde.username).set('token', token).set('Content-Type', 'application/x-www-form-urlencoded')
			.send({email: 'jdoe@yahoo.com'}).end((err, res)=>{
				expect(err).toBe(null);
				expect(res.body.response).toBe("User successfully updated");
				done();
			});
		});
	});

});


describe('delete user', ()=>{
	beforeEach((done)=>{
		th.login(testUsers.bodunde, request, (token)=>{
			usrToken = token;
			done();
		});
	});

	it('should fail if you try to delete a user that isn\'t you', (done)=>{
		request.delete('/users/anotherUser').set('token', usrToken).end((err, res)=>{
			expect(res.body.status).toBe('failed');
			expect(res.body.response).toBe('You are not authorized to perform on action on this user');
			done();
		});
	});

	it('should delete user if user is you', (done)=>{
		request.delete('/users/'+testUsers.bodunde.username).set('token', usrToken).end((err, res)=>{
			expect(res.body.status).toBe('success');
			expect(res.body.response).toBe('User successfully removed');
			done();
		});
	});

	it('should any user if you are admin', (done)=>{
		th.login(testUsers.admin, request, (token)=>{
			request.delete('/users/'+testUsers.bodunde.username).set('token', token).end((err, res)=>{
				expect(res.body.status).toBe('success');
				expect(res.body.response).toBe('User successfully removed');
				done();
			});
		});
	});
});