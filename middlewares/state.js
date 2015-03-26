'use strict';
var _ = require('lodash');
var moment = require('moment');
var path = require('path');
var config = require('../config');
var fileTag = require('../helpers/util').fileTag;
/**
 * [exports 添加常量或者一些工具方法到state中]
 * @return {[type]} [description]
 */
module.exports = function(){
  return function *(next){
    var state = this.state;
    state.STATIC_URL_PREFIX = config.staticUrlPrefix;
    state.ENV = config.env;
    state._ = _;
    state.moment = moment;
    //用于对图片文件生成版本号
    state.TAG = function(file){
      var url = path.join(config.staticUrlPrefix, file);
      file = path.join(config.staticPath, file);
      var tag;
      if(config.env === 'development'){
        tag = Date.now();
      }else{
        tag = fileTag(file);
      }
      return url + '?v=' + tag;
    };
    yield* next;
  };
}