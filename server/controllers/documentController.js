var documentModel = require('../models/document');
var userModel = require('../models/user');
var helpers = require('../helpers/helpers');
var moment = require('moment');

exports.create = function(req, res){
	if(req.body.title === undefined || req.body.content === undefined){
		res.json({status: 'failed', response: 'incomplete data'});
	}else{
		var documentData = {
			title: req.body.title,
			content: req.body.content,
			owner_id: helpers.getOwner(req.headers.token),
		};

		new documentModel(documentData).save(function(err, doc){
			if(err){
				var error = helpers.errorParser(err.errors);
				res.json({status: 'failed', response: 'Error saving this document', errors: error});
			} else {
				res.json({status: 'success', response: 'Your document was successfully created'});
			}
		});
	}
};

exports.get = function(req, res){
	var lim = req.params.limit === undefined ? 10 : Number(req.params.limit);
	documentModel.find({}).sort({'dateCreated': -1}).limit(lim).exec(function(err, data){
		if(err){
			res.json({status: 'failed', response: 'Error retrieving documents'});
		} else {
			res.json({status: 'success', response: parseDocuments(data)});
		}
	});
};

exports.getAll = function(req, res){
	documentModel.find({}).sort({'dateCreated': -1}).exec(function(err, data){
		if(err){
			res.json({status: 'failed', response: 'Error retrieving documents'});
		} else {
			res.json({status: 'success', response: parseDocuments(data)});
		}
	});
};

exports.getDocument = function(req, res){
	documentModel.findOne({_id: req.params.id}, function(err, data){
		if(err){
			res.json({status: 'failed', response: 'Error retrieving document'});
		} else {
			if(data)
				res.json({ status: 'success', response: helpers.filterOutput(data, ['_id', '__v'])});
			else
				res.json({status: 'success', response: 'this document does not exist'});
		}
	});
};

exports.deleteDocument = function(req, res){
	documentModel.remove({_id: req.params.id}, function(err, data){
		if(err){
			res.json({status: 'failed', response: 'Error deleting document'});
		} else {
			if(data.result.n === 0){
				res.json({status: 'failed', response: 'This document does not exist'});
			} else{
				res.json({status: 'success', response: 'Document successfully deleted'});
			}
		}
	});
};

exports.updateDocument = function(req, res){
	var updateValues = fetchUpdateData(req.body);
	documentModel.update({_id: req.params.id}, updateValues, {multi: true},
		function(err, numAffected){
			if (err) {
				res.json({status: 'failed', response: 'An error occcured during update, please try again later'});
			} else {
				if (numAffected.nModified === 0 ) {
					res.json({status: 'failed', response: 'Document not found'});
				} else {
					res.json({status: 'success', response: 'Document successfully updated'});
				}
			}
		});
};

exports.getUserDocuments = function(req, res){
	userModel.findOne({username: req.params.username}, function(err, userData){
		if(err){res.json({response: 'Document retrieval failed'});}
		else{
			documentModel.find({owner_id: userData._id}, function(err, data){
				if(err){
					res.json({status: 'failed', response: 'Document retrieval failed'});
				} else {
					res.json({status: 'success', response: parseDocuments(data)});
				}
			});
		}
	});
};

exports.documentsByDate = function(req, res){
	var parsedDate = parseDate(req.params.date);
	var date = new Date(parsedDate[0], parsedDate[1], parsedDate[2]);
	documentModel.find({dateCreated: {
		'$gte': moment(date).startOf('Day'),
		'$lt': moment(date).endOf('Day')}}).sort({'dateCreated': -1}).limit(Number(req.params.limit)).exec(
		function(err, data){
		res.json({status: 'success', response: parseDocuments(data)});
	});
};

function parseDocuments(docs){
  var parsedResult = [];
  docs.forEach(function(element){
    var doc = helpers.filterOutput(element, ['__v', '_id']);
    parsedResult.push(doc);
  });
  return parsedResult;
}

function fetchUpdateData(postBody){
  var output = {};
  for(var key in postBody){
    if(postBody.hasOwnProperty(key)){
      output[key] = postBody[key];
    }
  }
  return output;
}

function parseDate(date){
	var r_arr = date.split('-').map(function(num, element){
		if(element == 1) return Number(num);
		return Number(num);
	});
	return r_arr;
}