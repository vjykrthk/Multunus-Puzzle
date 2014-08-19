'use strict';

angular.module('multunusPuzzleApp', [
  'ngRoute', 'ui.bootstrap'
])
  .config(function ($routeProvider, $locationProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'tweeters.html'
      })
      .when('/:id', {
        templateUrl: 'retweeters.html'
      })
      .otherwise({
        redirectTo: '/'
      });
      
    $locationProvider.html5Mode(true);
  });