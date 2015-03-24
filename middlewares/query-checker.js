'use strict';
var url = require('url');
var querystring = require('querystring');
var _ = require('lodash');

module.exports = function(query){
  var arr = query.split('&');
  var checkParams = {};
  _.forEach(arr, function(str){
    var tmpArr = str.split('=');
    checkParams[tmpArr[0]] = tmpArr[1];
  });
  return function *(next){
    var query = this.query;
    var valid = true;
    _.forEach(checkParams, function(v, k){
      if(valid && query[k] !== v){
        valid = false;
      }
    });
    if(valid){
      yield *next;
    }else{
      var urlInfo = url.parse(this.request.originalUrl);
      _.extend(query, checkParams);
      this.status = 302;
      this.redirect(urlInfo.pathname + '?' + querystring.stringify(query));
    }
  };
};