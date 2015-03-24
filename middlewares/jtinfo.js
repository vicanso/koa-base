'use strict';
var os = require('os');
var util = require('util');

/**
 * [exports 添加信息到response header]
 * @param  {[type]} processName [description]
 * @return {[type]}             [description]
 */
module.exports = function(processName, httpLogType){
  var requestTotal = 0;
  var handlingReqTotal = 0;
  var hostname = os.hostname();
  var pid = process.pid;
  return function *(next){
    var start = Date.now();
    handlingReqTotal++;
    requestTotal++;
    yield* next;
    var use = Date.now() - start;
    var jtInfo = util.format('%s,%s,%d,%d,%d,%d', hostname, processName, pid, handlingReqTotal, requestTotal, use);
    handlingReqTotal--;
    // console.info(jtInfo);
    this.set('JT-Info', jtInfo);
  };
};