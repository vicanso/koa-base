'use strict';
var uuid = require('node-uuid');
var moment = require('moment');
var _ = require('lodash');
module.exports = function *(){
  var method = this.method;

  switch(method){
    case 'GET':
      getUserSession(this);
    break;
  }
};


function getUserSession(ctx){
  var cookies = ctx.cookies;
  if(!cookies.get('jtuuid')){
    cookies.set('jtuuid', uuid.v4(), {
      maxAge : 365 * 24 * 3600 * 1000
    });
    // TODO 记录为用户第一次打开（新增用户）
    console.info('user++');
  }
  if(!cookies.get('vicanso')){
    // TODO 记录UV
    console.info('uv++');
  }
  var data;
  if(ctx.session.data){
    data = _.pick(ctx.session.data, ['account', 'name', 'code', 'lastLoginedAt', 'loginTimes', 'created']);
  }else{
    data = {
      code : uuid.v4(),
      created : Date.now()
    }
    ctx.session.data = _.clone(data);
  }
  data.now = Date.now();
  ctx.body = data;
}