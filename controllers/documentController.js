var documentModel = require('../models/document');
var userModel = require('../models/user');
var helpers = require('../helpers/helpers');

exports.create = function(req, res){
	if(req.body.title === undefined || req.body.content === undefined){
		res.json({message: 'incomplete data'});
	}else{
		var documentData = {
			title: req.body.title,
			content: req.body.content,
			owner_id: helpers.getOwner(req.headers.token),
		};

		new documentModel(documentData).save(function(err, doc){
			if(err){
				var error = helpers.errorParser(err.errors);
				res.json({message: 'Error saving this document', errors: error});
			} else {
				res.json({message: 'Your document was successfully created'});
			}
		});
	}
};

exports.getAll = function(req, res){
	documentModel.find({}, function(err, data){
		if(err){
			res.json({message: 'Error retrieving documents'});
		} else {
			res.json(parseDocuments(data));
		}
	});
};

exports.getDocument = function(req, res){
	documentModel.findOne({_id: req.params.id}, function(err, data){
		if(err){
			res.json({message: 'Error retrieving document'});
		} else {
			if(data)
				res.json(helpers.filterOutput(data, ['_id', '__v']));
			else
				res.json({message: 'this document does not exist'});
		}
	});
};

exports.deleteDocument = function(req, res){
	documentModel.remove({_id: req.params.id}, function(err, data){
		if(err){
			res.json({message: 'Error deleting document'});
		} else {
			if(data.result.n === 0){
				res.json({message: 'This document does not exist'});
			} else{
				res.json({message: 'Document successfully deleted'});
			}
		}
	});
};

exports.updateDocument = function(req, res){
	var updateValues = fetchUpdateData(req.body);
	documentModel.update({_id: req.params.id}, updateValues, {multi: true},
		function(err, numAffected){
			if (err) {
				res.json({message: 'An error occcured during update, please try again later'});
			} else {
				if (numAffected.nModified === 0 ) {
					res.json({message: 'Document not found'});
				} else {
					res.json({message: 'Document successfully updated'});
				}
			}
		});
};

exports.getUserDocuments = function(req, res){
	userModel.findOne({username: req.params.username}, function(err, userData){
		if(err){res.json({message: 'Document retrieval failed'});}
		else{
			documentModel.find({owner_id: userData._id}, function(err, data){
				if(err){
					res.json({message: 'Document retrieval failed'});
				} else {
					console.log(req.params.username);
					res.json(parseDocuments(data));
				}
			});
		}
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