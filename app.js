'use strict';

var config = require('./config');
var _ = require('lodash');


initServer(config.port);


/**
 * [initServer 初始化服务器]
 * @param  {[type]} port [description]
 * @return {[type]}      [description]
 */
function initServer(port){
  var path = require('path');
  var koa = require('koa');
  var requireTree = require('require-tree');
  var middlewares = requireTree('./middlewares');
  var app = koa();

  // 超时，单位ms
  var timeout = 30 * 1000;
  // 静态文件缓存时间，单位秒
  var staticMaxAge = 365 * 24 * 3600;
  if(config.env === 'development'){
    staticMaxAge = 0;
    timeout = 5 * 1000;
  }

  // 增加一个timeout的middleware
  
  
  // http response默认为不缓存
  app.use(function *(next){
    this.set('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0');
    yield* next;
  });


  // 用于检测服务是否可用
  app.use(middlewares.ping('/ping'));

  // http log
  if(config.env === 'development'){
    app.use(require('koa-logger')());
  }

  // 在http response header中添加一些信息：用时、服务器当前处理的请求数等；
  app.use(middlewares.jtinfo(config.processName));
  // etag的处理
  app.use(require('koa-etag')());

  // 静态文件的处理
  app.use(middlewares.static(config.staticPath, {
    maxAge : staticMaxAge,
    mount : config.staticUrlPrefix
  }));


  // 添加常量或者一些工具方法到state中
  app.use(middlewares.state());


  // bodyparser的处理
  app.use(require('koa-bodyparser')());
  
  var debugParams = {
    DEBUG : '_debug',
    pretty : '_pretty',
    pattern : '_pattern'
  };
  // 从请求中的query中获取debug的相关参数，写到ctx.state中
  app.use(middlewares.debug(debugParams));


  // admin的middleware
  app.use(middlewares.admin('/jt'));


  app.use(require('./router'));


  app.listen(port);
  console.info('server listen on:%s', port);
}
