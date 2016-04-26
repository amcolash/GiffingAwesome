angular.module('starter.controllers', [])

.controller('AppCtrl', function($scope) {
})

.controller("SearchCtrl", function($scope, $http) {
    $scope.images = [];
    $scope.search = "cats";
    $scope.hq = false;

    $scope.loadImages = function() {
      $http.get("http://api.giphy.com/v1/gifs/search?q=" +
          $scope.search + "&api_key=dc6zaTOxFJmzC").then(function(response) {
        var data = response.data.data;

        $scope.images = [];

        for(var i = 0; i < data.length; i++) {
          var imgUrl = data[i].images.fixed_width_small.url;
          if ($scope.hq) {
            imgUrl = data[i].images.fixed_width.url;
          }

          $scope.images.push({id: i, src: imgUrl, url: data[i].url});
        }
      });
    }
})
