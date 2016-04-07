var roleModel = require('../models/role');
var helpers = require('../helpers/helpers');

exports.create = function(req, res){
	new roleModel({role: req.body.role}).save(function(err, data){
		if(err) {
			var error = helpers.errorParser(err.errors);
			res.json({status: 'failed', response: 'Error saving this document', errors: error});
		} else {
			res.json({status: 'success', response: 'new role created successfully'});
		}
	});
};

exports.update = function(req, res){
	roleModel.update({_id: req.params.id}, {role: req.body.role}, {multi: true},
	function(err, numAffected){
		if(err){
			res.json({status: 'failed', response: 'update failed'});
		} else {
			if (numAffected.nModified === 0 ) {
				res.json({status: 'failed', response: 'Record not found, unable to update'});
			} else {
				res.json({status: 'success', response: 'Record updated successfully'});
			}
		}
	});
};

exports.delete = function(req, res){
	roleModel.remove({_id: req.params.id}, function(err, data){
		if(err){
			res.json({status: 'failed', response: 'An error occurred'});
		} else {
			if(data.result.n === 0){
				res.json({status: 'failed', response: 'This record does not exist'});
			} else{
				res.json({status: 'success', response: 'successfully deleted'});
			}
		}
	});
};

exports.getAll = function(req, res){
	roleModel.find({}, function(err, data){
		if(err){
			res.json({status: 'failed', response: 'This request failed'});
		} else {
			res.json({status: 'success', response: refineRecords(data)});
		}
	});
};

function refineRecords(roles){
  var parsedResult = [];
  roles.forEach(function(element){
    var role = helpers.filterOutput(element, ['__v', '_id']);
    parsedResult.push(role);
  });
  return parsedResult;
}