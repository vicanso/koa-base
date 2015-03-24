'use strict';
var FileImporter = require('jtfileimporter');
var _ = require('lodash');
module.exports = function(options){
  return function *(next){
    var importer = new FileImporter();
    var state = this.state;
    _.forEach(options, function(v, k){
      importer[k] = v;
    });
    importer.debug = !!state.DEBUG;
    state.importer = importer;
    yield* next;
  };
};