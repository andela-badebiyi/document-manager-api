var jwt = require('jsonwebtoken');
var config = require('../config');
var documentModel = require('../models/document');


exports.userIsAuthenticated = function(req, res, next){
	jwt.verify(req.headers.token, config.secretkey, function(err, decoded){
		if(err){
			res.json({message: 'Your token is invalid'});
		} else {
			next();
		}
	});
};

exports.allowedToModify = function(req, res, next){
	jwt.verify(req.headers.token, config.secretkey, function(err, decoded){
		if(err){
			res.json({message: 'Your token is invalid'});
		} else{
			if(decoded.role_id == 1){
				next();
			} else {
				if(/\/users\//.test(req.originalUrl)){
					if(decoded._doc.username == req.params.username){
						next();
					} else {
						res.json({message: 'You are not authorized to perform on action on this user'});
					}
				} else if(/\/documents\//.test(req.originalUrl)){
					documentModel.findOne({_id: req.params.id}, function(err, data){
						if(decoded._doc._id == data.owner_id){
							next();
						} else {
							res.json({message: 'You are not authorized to perform any action on this document'});
						}
					});
				}
			}
		}
	});
};

exports.logInfo = function(req, res, next){
	console.log('base url is:', req.originalUrl);
	next();
	console.log('after next');
};