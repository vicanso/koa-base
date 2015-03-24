'use strict';
var requireTree = require('require-tree');
var controllers = requireTree('./controllers');
var router = require('./helpers/router');
var config = require('./config');
var addImporter = getImporterMiddleware();

var routeInfos = [
  {
    route : '/',
    template : 'index',
    middleware : [addImporter],
    handler : controllers.home
  },
  {
    method : 'post',
    route : '/httplog',
    handler : controllers['http-log']
  },
  {
    method : 'post',
    route : '/statistics',
    handler : controllers.statistics
  },
  {
    method : ['get', 'post'],
    route : '/user',
    handler : controllers.user
  }
];


module.exports = router.getRouteHandlers(routeInfos);


/**
 * [getImporterMiddleware 获取file importer的middleware]
 * @return {[type]} [description]
 */
function getImporterMiddleware(){
  var importer = require('./middlewares/importer');
  var staticVerion = null;
  var staticMerge = null;
  var importerOptions = {
    prefix : config.staticUrlPrefix,
    versionMode : 1,
    srcPath : 'src'
  };
  try{
    staticVerion = require('./crc32');
    staticMerge = require('./merge');
  }catch(err){
    console.error(err);
  }
  if(config.env !== 'development'){
    importerOptions.version = staticVerion;
    importerOptions.merge = staticMerge;
  }
  return importer(importerOptions);
}