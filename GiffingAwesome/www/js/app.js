// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
var ionicApp = angular.module('starter', ['ionic'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    if(window.cordova && window.cordova.plugins.Keyboard) {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

      // Don't remove this line unless you know what you are doing. It stops the viewport
      // from snapping when text inputs are focused. Ionic handles this internally for
      // a much nicer keyboard experience.
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
})

.controller("ExampleController", function($scope, $http) {
    $scope.images = [];
    $scope.search = "cats";

    $scope.loadImages = function() {
      $http.get("http://api.giphy.com/v1/gifs/search?q=" +
          $scope.search + "&api_key=dc6zaTOxFJmzC").then(function(response) {
        var data = response.data.data;
        $scope.images = [];
        for(var i = 0; i < data.length; i++) {
          $scope.images.push({id: i, src: data[i].images.fixed_height_small.url});
        }
      });
    }
});
