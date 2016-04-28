angular.module('starter.controllers', [])

.controller('AppController', function($scope) {
})

.controller("SearchController", function($scope, $http, $ionicModal) {
  $scope.images = [];
  $scope.search = "cats";
  $scope.hq = false;
  $scope.data = "";

  $scope.loadImages = function() {
    $http.get("http://api.giphy.com/v1/gifs/search?q=" +
        $scope.search + "&limit=50&api_key=dc6zaTOxFJmzC").then(function(response) {
          $scope.data = response.data.data;
          $scope.refreshImages();
      });
  }

  $scope.refreshImages = function() {
    $scope.images = [];
    console.log($scope.data);
    for(var i = 0; i < $scope.data.length; i++) {
      var imgUrl = $scope.data[i].images.fixed_height_small.url;
      if ($scope.hq) {
        imgUrl = $scope.data[i].images.fixed_height.url;
      }

      $scope.images.push({id: i, src: imgUrl, url: $scope.data[i].url, originalImgUrl: $scope.data[i].images.original.url, favorite: false});
    }
  }

  $scope.copySuccess = function() {
    console.log('copied!');
  }

  $ionicModal.fromTemplateUrl('templates/preview.html', {
    scope: $scope,
    animation: 'slide-in-up',
  }).then(function(modal) {
    $scope.modal = modal;
    $scope.modal.scope.url = "";
  });

  $scope.openModal = function(url) {
    if ($scope.modal.scope.url == "") {
      $scope.modal.scope.url = url;
    }
    $scope.modal.show();
  };

  $scope.closeModal = function() {
    $scope.modal.hide();
  };

  $scope.$on('modal.hidden', function() {
    $scope.modal.scope.url = "";
  });

   //Cleanup the modal when we're done with it!
  $scope.$on('$destroy', function() {
    $scope.modal.remove();
  });
});
