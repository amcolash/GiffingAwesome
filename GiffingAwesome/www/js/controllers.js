angular.module('starter.controllers', [])

.controller('AppController', function($scope) {
})

.controller('SearchController', ['$scope', '$http', 'previewData', 'Favorites',
  function($scope, $http, previewData, Favorites) {

  $scope.preview = previewData;
  $scope.favorites = Favorites;

  $scope.api = 'Giphy';
  $scope.searchtype = 'Search';
  $scope.hq = false;
  $scope.search = '';

  $scope.images = [];
  $scope.offset = 0;
  $scope.limit = 25;
  $scope.lastData = [];

  $scope.endResults = function() {
    return $scope.search === '' ? 'Enter a Search' : 'End of Results';
  }

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

          // console.log(data);
          for(var i = 0; i < data.length; i++) {
            var img = {
              imgUrl: data[i].images.fixed_height_small.url,
              hqImgUrl: data[i].images.fixed_height.url,
              originalImgUrl: data[i].images.original.url,
              failed: false,
            }
            img.favorite = $scope.favorites.isFavorite(img);

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

          // console.log(data);
          for(var i = 0; i < data.length; i++) {
            var img = {
              imgUrl: data[i].link,
              hqImgUrl: data[i].link,
              originalImgUrl: data[i].link,
              failed: false,
            }
            img.favorite = $scope.favorites.isFavorite(img);

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

          // console.log(data);
          for(var i = 0; i < data.length; i++) {
            var img = {
              imgUrl: data[i].media[0].nanogif.url,
              hqImgUrl: data[i].media[0].tinygif.url,
              originalImgUrl: data[i].url,
              failed: false,
            }
            img.favorite = $scope.favorites.isFavorite(img);

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
      image.favorite = true;
      $scope.favorites.addFavorite(image);
    } else {
      image.favorite = false;
      $scope.favorites.removeFavorite(image);
    }
  }
}])

.controller('FavoritesController', ['$scope', 'previewData', 'Favorites',
  function($scope, previewData, Favorites) {
  $scope.preview = previewData;
  $scope.favorites = Favorites;

  $scope.setupPreview = function(image) {
    $scope.preview.isLoaded = $scope.preview.url === image.originalImgUrl;
    $scope.preview.url = image.originalImgUrl;
  }

  $scope.onFavorite = function(image) {
    if (!image.favorite) {
      image.favorite = true;
      $scope.favorites.addFavorite(image);
    } else {
      image.favorite = false;
      $scope.favorites.removeFavorite(image);
    }
  }
}])

.controller('MenuController', ['$scope', 'Auth', 'previewData', function($scope, Auth, previewData) {
  $scope.auth = Auth;
  $scope.preview = previewData;
  // $scope.favorites = favoritesData;
}])

.controller('LoginController', ['$scope', 'Auth', function($scope, Auth) {
  $scope.auth = Auth;
}])

;
