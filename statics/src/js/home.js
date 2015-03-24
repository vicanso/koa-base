;(function(global){
'use strict';
var fn = function($scope, $http, debug){
  $http.get('/user').success(function(res){

  }).error(function(err){

  });
};
fn.$inject = ['$scope', '$http', 'debug'];

angular.module('jtApp')
  .controller('HomePageController', fn);

})(this);