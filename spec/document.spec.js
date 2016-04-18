process.env.NODE_ENV = 'testing';
var exp = require('../index');
var request = require('supertest')(exp.app);
var mongoose = require('../server/database/db');
var testUsers = require('./data/user');
var testDocuments = require('./data/document');
var th = require('../server/helpers/testHelpers');
var seed = require('../server/database/seed');
var usrToken, doc1, doc2;


describe('create document', () => {
	beforeEach( done => {
		th.dropDocumentDatabase(mongoose, err => {
			th.dropUserDatabase(mongoose, err => {
				th.login(testUsers.admin, request, token => {
					usrToken = token
					done()
				})
			})
		})
	})

	it('should fail to create document if user is not logged in', done => {
		request.post('/documents').set('Content-Type', 'application/x-www-form-urlencoded').end((err, res)=>{
			expect(res.body.status).toBe('failed')
			done()
		})
	})

	it('should fail if document does not have title', done=>{
		request.post('/documents').set('token', usrToken).set('Content-Type', 'application/x-www-form-urlencoded').send(testDocuments.no_title)
		.end((err, res)=>{
			expect(res.body.status).toBe('failed')
			done()
		})
	})

	it('should pass if user is logged in and all fields are complete', done=>{
		request.post('/documents').set('token', usrToken).set('Content-Type', 'application/x-www-form-urlencoded').send(testDocuments.doc_1)
		.end((err, res)=>{
			expect(res.body.status).toBe('success');
			done();
		})
	})
})

describe('update document', ()=>{
	beforeEach( done=>{
		th.dropDocumentDatabase(mongoose, err => {
			th.login(testUsers.bodunde, request, token => {
				usrToken = token
				seed.doc(testUsers.bodunde.username, (d1, d2)=>{
					doc1 = d1;
					doc2 = d2;
					done()
				})
			})
		})
	})

	it('should fail if user is not logged in', done => {
		request.patch('/documents').set('Content-Type', 'application/x-www-form-urlencoded').end((err, res)=>{
			expect(res.body.status).toBe('failed')
			done()
		})
	})

	it('should fail if user tries to modify another persons document', done=>{
		th.login(testUsers.kikelomo, request, token => {
			request.patch('/documents/'+doc1._id).set('token', token).set('Content-Type', 'application/x-www-form-urlencoded').send({title: 'new title'})
			.end((err, res)=>{
				expect(res.body.status).toBe('failed');
				expect(res.body.response).toBe('You are not authorized to perform any action on this document');
				done();
			});
		});
	})

	it('should pass if user is logged in and is modifying his own document', done => {
		request.patch('/documents/'+doc1._id).set('token', usrToken).set('Content-Type', 'application/x-www-form-urlencoded').send({title: 'new title'})
		.end((err, res)=>{
			expect(res.body.status).toBe('success')
			done()
		})
	})

})

describe('delete document', ()=>{
	beforeEach( done=>{
		th.dropDocumentDatabase(mongoose, err => {
			th.login(testUsers.bodunde, request, token => {
				usrToken = token
				seed.doc(testUsers.bodunde.username, (d1, d2)=>{
					doc1 = d1;
					doc2 = d2;
					done()
				})
			})
		})
	})

	it('should fail if user is not logged in', done => {
		request.delete('/documents').set('Content-Type', 'application/x-www-form-urlencoded').end((err, res)=>{
			expect(res.body.status).toBe('failed')
			done()
		})
	})

	it('should fail if user tries to delete another persons document', done=>{
		th.login(testUsers.kikelomo, request, token => {
			request.delete('/documents/'+doc1._id).set('token', token).set('Content-Type', 'application/x-www-form-urlencoded')
			.end((err, res)=>{
				expect(res.body.status).toBe('failed');
				expect(res.body.response).toBe('You are not authorized to perform any action on this document');
				done();
			});
		});
	})

	it('should pass if user is logged in and is deleting his own document', done => {
		request.delete('/documents/'+doc1._id).set('token', usrToken).set('Content-Type', 'application/x-www-form-urlencoded')
		.end((err, res)=>{
			expect(res.body.status).toBe('success')
			done()
		})
	})
});

describe('fetch document', ()=>{
	beforeEach( done=>{
		th.dropDocumentDatabase(mongoose, err => {
			th.login(testUsers.bodunde, request, token => {
				usrToken = token
				seed.doc(testUsers.bodunde.username, (d1, d2)=>{
					doc1 = d1;
					doc2 = d2;
					done()
				})
			})
		})
	})

	it('should fail if user is not signed in', done=>{
		request.get('/documents').end((err, res)=>{
			expect(res.body.status).toBe('failed');
			done();
		});
	})

	it('should fetch all documents', done=>{
		request.get('/documents').set('token', usrToken).end((err, res)=>{
			expect(res.body.response.length).toBe(2);
			expect(res.body.status).toBe('success');
			done();
		})
	})


	it('should fetch single document by id', done=>{
		request.get('/documents/'+doc1._id).set('token', usrToken).end((err, res)=>{
			expect(res.body.status).toBe('success');
			expect(res.body.response.title).toBe(testDocuments.doc_1.title);
			done();
		})
	});

	it('should fetch all the documents for a particular user', done=>{
		request.get('/users/'+testUsers.bodunde.username+'/documents').set('token', usrToken).
		end((err, res)=>{
			expect(res.body.response.length).toBe(2);
			expect(res.body.response[0].owner_id).toBe(doc1.owner_id);
			done();
		})
	})

	it('should fetch documents based on a certain date', done=>{
		var date = th.formatDate(doc1.dateCreated);
		request.get('/documents/'+date+'/10').set('token', usrToken).
		end((err, res)=>{
			expect(res.body.response.length).toBe(2);
			done();
		})
	})

	it('should fetch documents based on wrong date', done=>{
		request.get('/documents/2012-05-13/10').set('token', usrToken).
		end((err, res)=>{
			expect(res.body.response.length).toBe(0);
			done();
		})
	})
})