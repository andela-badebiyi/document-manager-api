var mongoose = require('mongoose');
var documentModel = require('../models/document');
var config = require('../config.js');
var helpers = require('../helpers/helpers');

exports.create = function(req, res){
	if(req.body.title == undefined || req.body.content == undefined){
		res.json({message: 'incomplete data'});
	}else{
		var documentData = {
			title: req.body.title, 
			content: req.body.content,
			owner_id: helpers.getOwner(req.headers.token),
		};

		new documentModel(documentData).save(function(err, doc){
			if(err){
				var error = helpers.errorParser(err.errors)
				res.json({message: 'Error saving this document', errors: error});
			} else {
				res.json({message: 'Your document was successfully created'});
			}
		});

	}
}

exports.getAll = function(req, res){
	documentModel.find({}, function(err, data){
		if(err){
			res.json({message: 'Error retrieving documents'});
		} else {
			res.json(parseDocuments(data));
		}
	});
}

exports.getDocument = function(req, res){
	documentModel.findOne({_id: req.params.id}, function(err, data){
		if(err){
			res.json({message: 'Error retrieving document'});
		} else {
			if(data)
				res.json(helpers.filterOutput(data, ['_id', '__v']));
			else
				res.json({message: 'this document does not exist'})
		}
	});
}

exports.deleteDocument = function(req, res){

}

exports.updateDocument = function(req, res){
	
}

function parseDocuments(docs){
  var parsedResult = [];
  docs.forEach(function(element){
    var doc = helpers.filterOutput(element, ['__v', '_id']);
    parsedResult.push(doc);
  });
  return parsedResult;
}