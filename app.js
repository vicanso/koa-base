'use strict';
var co = require('co');
var config = require('./config');
var _ = require('lodash');
var request = require('request');
var debug = require('debug')('jt.koa');
var jtpromise = require('./helpers/jtpromise');





/**
 * [initServer 初始化服务器]
 * @param  {[type]} port [description]
 * @return {[type]}      [description]
 */
function initServer(port){
  var path = require('path');
  var koa = require('koa');
  var mount = require('koa-mount');
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


  app.keys = config.keys;


  // 用于检测服务是否可用
  app.use(middlewares.ping('/ping'));

  // http log
  if(config.env === 'development'){
    app.use(require('koa-logger')());
  }

  // 在http response header中添加一些信息：用时、服务器当前处理的请求数等；
  app.use(middlewares.jtinfo(config.processName));

  // fresh的处理
  app.use(require('koa-fresh')());

  // etag的处理
  app.use(require('koa-etag')());

  // 静态文件的处理
  var serve = middlewares.static(config.staticPath, {
    maxAge : staticMaxAge
  });
  app.use(mount(config.staticUrlPrefix, serve));

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
  app.use(mount('/jt', middlewares.admin()));


  app.use(require('./router'));


  app.listen(port);
  console.info('server listen on:%s', port);
}


function *getServers(){
  if(config.env === 'development'){
    return {
      "log" : {
        "host" : "127.0.0.1",
        "port" : 7000
      },
      "zmq" : {
        "host" : "127.0.0.1",
        "port" : 7010
      },
      "stats" : {
        "host" : "127.0.0.1",
        "port" : 6000
      },
      "mongodb" : {
        "host" : "127.0.0.1",
        "port" : 5000
      },
      "redis" : {
        "host" : "127.0.0.1",
        "port" : 4000
      }
    };
  }else{
    var fn = function(cbf){
      request.get(config.serverConfigUrl, function(err, res, data){
        if(err){
          cbf(err);
        }
        try{
          data = JSON.parse(data);
        }catch(err){
          cbf(err);
          return;
        }
      });
    }
    return yield jtpromise.wrap(fn);
  }
}
co(function *(){
  var servers = yield getServers();
  if(!servers){
    console.error('servers is null');
    return;
  }
  debug('servers:%j', servers);
  config.servers = servers;
  initServer(config.port);
}).catch(function(err){
  console.error(err);
});
