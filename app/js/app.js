'use strict';


// Declare app level module which depends on filters, and services
angular.module('myApp', [
  'ngRoute',
  'myApp.filters',
  'myApp.services',
  'myApp.directives',
  'myApp.controllers'
]).
config(['$routeProvider', '$httpProvider', function($routeProvider, $httpProvider) {
  $routeProvider.when('/view1', {templateUrl: 'partials/partial1.html', controller: 'MyCtrl1'});
  $routeProvider.when('/view2', {templateUrl: 'partials/partial2.html', controller: 'MyCtrl2'});
  $routeProvider.otherwise({redirectTo: '/view1'});

    if (!File.prototype.slice) {
      var newSlice = File.prototype.mozSlice || File.prototype.webkitSlice;
      if ( newSlice ) {
        File.prototype.slice = (function() {
          return function(startingByte, length) {
            return newSlice.call( this, startingByte, length + startingByte );
          };
        })();
      } else {
        throw "File.slice() not supported."
      }
    }
  //$httpProvider.interceptors.push('AzureReqIntercept');
}]);
