'use strict';
var os = require('os');
var util = require('util');

/**
 * [exports 添加信息到response header]
 * @param  {[type]} processName [description]
 * @return {[type]}             [description]
 */
module.exports = function(processName){
  var requestTotal = 0;
  var handlingReqTotal = 0;
  var hostname = os.hostname();
  var pid = process.pid;
  return function *(next){
    var start = Date.now();
    handlingReqTotal++;
    requestTotal++;

    var ctx = this;
    var res = this.res;
    var onfinish = done.bind(null, 'finish');
    var onclose = done.bind(null, 'close');

    res.once('finish', onfinish);
    res.once('close', onclose);

    function done(event){
      res.removeListener('finish', onfinish);
      res.removeListener('close', onclose);
      var use = Date.now() - start;
      var ip = ctx.ips[0] || ctx.ip;
      var method = ctx.method;
      var url = ctx.request.url;
      var httpVersion = ctx.req.httpVersion;
      var headers = ctx.request.headers;
      var str = util.format('%s "%s %s HTTP/%s" %d %d %dms "%s" "%s" %d-%d', ip, method, url, httpVersion, ctx.status, ctx.length, use, headers.referer || '', headers['user-agent'], handlingReqTotal, requestTotal);
      console.info(str);
    }
    yield* next;
    var use = Date.now() - start;
    var jtInfo = util.format('%s,%s,%d,%d,%d,%d', hostname, processName, pid, handlingReqTotal, requestTotal, use);
    handlingReqTotal--;
    this.set('JT-Info', jtInfo);
  };
};