'use strict';
var path = require('path');

process.env.NODE_ENV = process.env.NODE_ENV || 'development';

exports.port = 10000;

exports.env = process.env.NODE_ENV;
// 静态文件目录
exports.staticPath = path.join(__dirname, exports.env === 'development'? 'statics/src' : 'statics/dest');
// 静态文件url前缀
exports.staticUrlPrefix = '/static';

exports.token = '6a3f4389a53c889b623e67f385f28ab8e84e5029';

exports.viewPath = path.join(__dirname, 'views');


exports.processName = 'pm2-' + (process.env.pm_id || '');