'use strict';
var serve = require('koa-static');
var moment = require('moment');
var util = require('util');
var path = require('path');
var config = require('../config');
var fs = require('fs');
var co = require('co');
var jtpromise = require('../helpers/jtpromise');
/**
 * [exports 静态文件处理]
 * @param  {[type]} staticPath [静态文件所在目录]
 * @param  {[type]} options    [参数配置{maxAge : Number, mount : String}]
 * @return {[type]}            [description]
 */
module.exports = function(staticPath, options){

  var handler = serve(staticPath, {});
  options = options || {};
  var maxAge = options.maxAge;
  var mount = options.mount || '';
  var length = mount.length;
  
  var notFoundMaxAge = 600;
  return function *(next){
    if(mount){
      var url = this.request.url;
      if(url.substring(0, length) === mount){
        this.request.url = url.substring(length);
      }else{
        yield* next;
        return;
      }
    }

    yield handler.call(this, next);
    // 开发环境下，请求到stylus等文件的处理
    if(config.env === 'development' && !this.body){
      var file = path.join(staticPath, this.request.url);
      var ext = path.extname(file);
      if(ext === '.css'){
        var data = yield parseStylus(file);
        this.body = data;
        this.set('Content-Type', 'text/css; charset=utf-8');
      }
    }
    if(this.body){
      if(!maxAge){
        return;
      }
      var sMaxAge = Math.min(3600, maxAge);
      this.set({
        'Expires' : moment().add(maxAge, 'seconds').toString(),
        'Cache-Control' : util.format('public, max-age=%d, s-maxage=%d', maxAge, sMaxAge),
        'Vary' : 'Accept-Encoding'
      });
    }else{
      this.set({
        'Expires' : moment().add(notFoundMaxAge, 'seconds').toString(),
        'Cache-Control' : util.format('public, max-age=%d', notFoundMaxAge),
        'Vary' : 'Accept-Encoding'
      });
      this.throw(404);
    }
  }
};

/**
 * [parseStylus 编译stylus]
 * @param  {[type]} file [description]
 * @return {[type]}      [description]
 */
function *parseStylus(file){
  file = file.replace('.css', '.styl');
  var nib = require('nib');
  var stylus = require('stylus');
  jtpromise.wrap(fs.exists, file);
  var exists = yield jtpromise.wrap(fs.exists, file);
  if(!exists){
    return;
  }
  var data = yield jtpromise.wrap(fs.readFile, file, 'utf8');

  function render(cbf){
    stylus(data).set('filename', file).use(nib()).render(cbf);
  }
  var css = yield jtpromise.wrap(render);

  return css;
}