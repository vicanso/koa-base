'use strict';
var co = require('co');
var router = require('koa-router')();
var path = require('path');
var fs = require('fs');
var config = require('../config');
var versionFile = path.join(__dirname, '../version');
var appVersion = 'no version';
var jtpromise = require('../helpers/jtpromise');


module.exports = function(adminPath){

  router.get('/jt/version', validate, versionHandler);
  return router.routes();;
};

/**
 * [getVersion 获取版本号]
 * @return {[type]} [description]
 */
function *getVersion(){
  return yield jtpromise.wrap(fs.readFile, versionFile, 'utf8');
}

function *validate(next){
  var crypto = require('crypto');
  var key = this.query.key;
  var shasum = crypto.createHash('sha1');
  if(!key || config.token !== shasum.update(key).digest('hex')){
    this.status = 401;
    this.body = 'Unauthorized';
  }else{
    yield* next;
  }
}


/**
 * [versionHandler 响应http请求，返回取当前运行版本号与当前代码版本号]
 * @return {[type]} [description]
 */
function *versionHandler(){
  try{
    var version = yield getVersion();
  }catch(err){
    console.error(err);
    version = 'no version';
  }
  this.body = {
    running : appVersion,
    code : version
  };
}


co(function *(){
  appVersion = yield getVersion();
}).catch(function(err){
  console.error(err);
});

