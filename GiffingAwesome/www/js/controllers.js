angular.module('starter.controllers', [])

.controller('AppController', function($scope) {
})

.controller('SearchController', function($scope, $http, $ionicModal) {
  $scope.api = 'Giphy';
  $scope.hq = false;
  $scope.search = 'cats';

  $scope.images = [];
  $scope.offset = 0;
  $scope.limit = 25;
  $scope.lastData = [];

  $scope.loadImages = function() {
    if ($scope.api === 'Giphy') {
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
        });
    } else if ($scope.api === 'GifMe') {
      $http.get('http://api.gifme.io/v1/search?query=' + $scope.search + '&limit=' + $scope.limit +
        '&page=' + $scope.offset + '&key=rX7kbMzkGu7WJwvG')
        .then(function(response) {
          var data = response.data.data;
          $scope.lastData = data;

          console.log(data);
          for(var i = 0; i < data.length; i++) {
            $scope.images.push({
              id: i,
              imgUrl: data[i].link,
              hqImgUrl: data[i].link,
              originalImgUrl: data[i].link,
              favorite: false
            });
          }

          // +1 page, different from giphy which is an image index offset
          $scope.offset ++;
          $scope.$broadcast('scroll.infiniteScrollComplete');
        });
    } else if ($scope.api === 'Riffsy') {
      $http.get('http://api.riffsy.com/v1/search?tag=' + $scope.search + '&limit=' + $scope.limit +
        '&pos=' + $scope.offset)
        .then(function(response) {
          var data = response.data.results;
          $scope.lastData = data;

          console.log(data);
          for(var i = 0; i < data.length; i++) {
            $scope.images.push({
              id: i,
              imgUrl: data[i].media[0].nanogif.url,
              hqImgUrl: data[i].media[0].tinygif.url,
              originalImgUrl: data[i].url,
              favorite: false
            });
          }

          $scope.offset += $scope.limit;
          $scope.$broadcast('scroll.infiniteScrollComplete');
      });
    }
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
})

;
