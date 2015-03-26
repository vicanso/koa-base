'use strict';
var fs = require('fs');
var crc32 = require('buffer-crc32');


exports.fileTag = fileTag;


/**
 * [fileTag description]
 * @param  {[type]} file [description]
 * @return {[type]}      [description]
 */
var tagDict = {};
var defaultVersion = Date.now();
function fileTag(file){
  var tag = tagDict[file];
  if(!tag){
    try{
      var buf = fs.readFileSync(file);
      tag = crc32.unsigned(buf);
    }catch(err){
      tag = defaultVersion;
      console.error(err);
    }
    tagDict[file] = tag;
  }
  return tag;
}