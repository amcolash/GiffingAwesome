angular.module('starter.controllers', [])

.controller('AppController', function($scope) {
})

.controller('SearchController', function($scope, $http, $ionicModal) {
  $scope.images = [];
  $scope.search = 'cats';
  $scope.hq = false;
  $scope.offset = 0;
  $scope.limit = 25;
  $scope.lastData = [];

  $scope.loadImages = function() {
    $http.get('http://api.giphy.com/v1/gifs/search?q=' + $scope.search + '&limit=' + $scope.limit +
      '&offset=' + $scope.offset + '&api_key=dc6zaTOxFJmzC')
      .then(function(response) {
          var data = response.data.data;
          $scope.lastData = data;

          console.log(data);
          for(var i = 0; i < data.length; i++) {
            $scope.images.push({
              id: i,
              imgUrl: data[i].images.fixed_height_small.url,
              hqImgUrl: data[i].images.fixed_height.url,
              originalImgUrl: data[i].images.original.url,
              favorite: false
            });
          }

          $scope.offset += $scope.limit;
          $scope.$broadcast('scroll.infiniteScrollComplete');
        }
      );
  }

  $scope.changeSearch = function() {
    $scope.images = [];
    $scope.offset = 0;
    $scope.lastData = [];

    $scope.loadImages();
  }

  $scope.moreDataCanBeLoaded = function() {
    return $scope.lastData.length > 0;
  }

  $ionicModal.fromTemplateUrl('templates/preview.html', {
    scope: $scope,
    animation: 'slide-in-up',
  }).then(function(modal) {
    $scope.modal = modal;
    $scope.modal.scope.url = '';
  });

  $scope.openModal = function(url) {
    if ($scope.modal.scope.url == '') {
      $scope.modal.scope.url = url;
    }
    $scope.modal.show();
  };

  $scope.closeModal = function() {
    $scope.modal.hide();
  };

  $scope.$on('modal.hidden', function() {
    $scope.modal.scope.url = '';
  });

   //Cleanup the modal when we're done with it!
  $scope.$on('$destroy', function() {
    $scope.modal.remove();
  });
});
