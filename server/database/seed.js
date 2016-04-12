var role = require('../models/role');
var doc = require('../models/document');
var usr = require('../models/user');
var roleData = require('../../spec/data/role');
var docData = require('../../spec/data/document');
exports.role = (cb)=>{
	role.create(roleData.user, roleData.admin, roleData.guest, (err, user, admin, guest)=>{
		cb(user._id, admin._id, guest._id)
	});
};

exports.doc = (username, cb)=>{
	usr.findOne({'username': username}, (err, data) =>{
		docData.doc_1.owner_id = data._id;
		docData.doc_2.owner_id = data._id;
		doc.create(docData.doc_1, docData.doc_2, (err, doc1, doc2)=>{
			cb(doc1, doc2);
		})
	})	
}
