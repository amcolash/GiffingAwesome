angular.module('starter.controllers', [])

.controller('AppController', function($scope) {
})

.controller('SearchController', function($scope, $http, previewData, favoritesData) {
  $scope.preview = previewData;
  $scope.favorites = favoritesData;

  $scope.api = 'Giphy';
  $scope.searchtype = 'Search';
  $scope.hq = false;
  $scope.search = 'cats';

  $scope.images = [];
  $scope.offset = 0;
  $scope.limit = 25;
  $scope.lastData = [];

  $scope.loadImages = function() {
    if ($scope.api === 'Giphy') {
      var search;
      if ($scope.searchtype === 'Search') {
        search = 'http://api.giphy.com/v1/gifs/search?q=' + $scope.search + '&limit=' + $scope.limit +
          '&offset=' + $scope.offset + '&api_key=dc6zaTOxFJmzC';
      } else if ($scope.searchtype === 'Trending') {
        search = 'http://api.giphy.com/v1/gifs/trending?limit=' + $scope.limit +
          '&offset=' + $scope.offset + '&api_key=dc6zaTOxFJmzC';
      }

      $http.get(search)
        .then(function(response) {
          var data = response.data.data;
          $scope.lastData = data;

          console.log(data);
          for(var i = 0; i < data.length; i++) {
            var img = {
              id: i,
              imgUrl: data[i].images.fixed_height_small.url,
              hqImgUrl: data[i].images.fixed_height.url,
              originalImgUrl: data[i].images.original.url,
            }
            img.favorite = favoritesData.isFavorite(img);

            $scope.images.push(img);
          }

          $scope.offset += $scope.limit;
          $scope.$broadcast('scroll.infiniteScrollComplete');
        });
    } else if ($scope.api === 'GifMe') {
      var search;
      if ($scope.searchtype === 'Search') {
        search = 'http://api.gifme.io/v1/search?query=' + $scope.search + '&limit=' + $scope.limit +
          '&page=' + $scope.offset + '&sfw=false&key=rX7kbMzkGu7WJwvG';
      }

      $http.get(search)
        .then(function(response) {
          var data;
          if ($scope.searchtype === 'Search') {
            data = response.data.data;
          } else if ($scope.searchtype === 'Trending') {
            data = response.data.trending;
          }

          $scope.lastData = data;

          console.log(data);
          for(var i = 0; i < data.length; i++) {
            var img = {
              id: i,
              imgUrl: data[i].link,
              hqImgUrl: data[i].link,
              originalImgUrl: data[i].link,
            }
            img.favorite = favoritesData.isFavorite(img);

            $scope.images.push(img);
          }

          // +1 page, different from giphy which is an image index offset
          $scope.offset ++;
          $scope.$broadcast('scroll.infiniteScrollComplete');
        });
    } else if ($scope.api === 'Riffsy') {
      var search;
      if ($scope.searchtype === 'Search') {
        search = 'http://api.riffsy.com/v1/search?tag=' + $scope.search + '&limit=' + $scope.limit +
          '&pos=' + $scope.offset;
      } else if ($scope.searchtype === 'Trending') {
        search = 'http://api.riffsy.com/v1/trending?limit=50';
      }

      $http.get(search)
        .then(function(response) {
          var data = response.data.results;
          $scope.lastData = data;

          console.log(data);
          for(var i = 0; i < data.length; i++) {
            var img = {
              id: i,
              imgUrl: data[i].media[0].nanogif.url,
              hqImgUrl: data[i].media[0].tinygif.url,
              originalImgUrl: data[i].url,
            }
            img.favorite = favoritesData.isFavorite(img);

            $scope.images.push(img);
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

  $scope.setupPreview = function(image) {
    $scope.preview.isLoaded = $scope.preview.url === image.originalImgUrl;
    $scope.preview.url = image.originalImgUrl;
  }

  $scope.onFavorite = function(image) {
    if (!image.favorite) {
      $scope.favorites.addFavorite(image);
    } else {
      $scope.favorites.removeFavorite(image);
    }

    image.favorite = !image.favorite;
  }
})

.controller('MenuController', function($scope, previewData, favoritesData) {
  $scope.preview = previewData;
  $scope.favorites = favoritesData;
})

.controller('FavoritesController', function($scope, previewData, favoritesData) {
  $scope.preview = previewData;
  $scope.favorites = favoritesData;

  $scope.setupPreview = function(image) {
    $scope.preview.isLoaded = $scope.preview.url === image.originalImgUrl;
    $scope.preview.url = image.originalImgUrl;
  }

  $scope.onFavorite = function(image) {
    if (!image.favorite) {
      $scope.favorites.addFavorite(image);
    } else {
      $scope.favorites.removeFavorite(image);
    }

    image.favorite = !image.favorite;
  }
})

.factory('previewData', function() {
  return {
    url: '',
    isLoaded: false
  };
})

.factory('favoritesData', function() {
  var favorites = {};

  function addFavorite(image) {
    favorites[image.originalImgUrl] = image;
  }

  function removeFavorite(image) {
    delete favorites[image.originalImgUrl];
  }

  function getFavorites() {
    return favorites;
  }

  function isFavorite(image) {
    return favorites.hasOwnProperty(image.originalImgUrl);
  }

  return {
    addFavorite: addFavorite,
    getFavorites: getFavorites,
    removeFavorite: removeFavorite,
    isFavorite: isFavorite,
  };
})

.directive('imageonload', function() {
  return {
    restrict: 'A',
    link: function(scope, element, attrs) {
      element.bind('load', function() {
        scope.preview.isLoaded = true;
        scope.$apply();
      });
      element.bind('error', function() {
        alert('image could not be loaded');
        scope.preview.isLoaded = true;
        scope.$apply();
      });
    }
  };
})

;
