var jwt = require('jsonwebtoken');
var config = require('../../config.js');
exports.errorParser = function (errs){
  var errors = [];
  for(var key in errs){
    if(errs.hasOwnProperty(key)){
      var error = {field: key, message: errs[key].message};
      errors.push(error);
    }
  }
  return errors;
};

exports.getOwner = function(token){
	return jwt.verify(token, config.secretkey)._doc;
};

exports.filterOutput = function(data, field){
	var result = {};
	for(var key in data){
		if(data._doc.hasOwnProperty(key)){
			if(field.indexOf(key) == -1){
				result[key] = data[key];
			}
		}
	}
	return result;
};