var session = require('koa-generic-session');
var redisStore = require('koa-redis');
var _ = require('lodash');
var debug = require('debug')('jt.koa');

module.exports = function(options){
  debug('options:%j', options);
  var keys = ['host', 'port', 'pass'];
  var redisOptions = _.pick(options, keys);
  options = _.omit(options, keys);
  options.store = redisStore(redisOptions);
  return session(options);
};