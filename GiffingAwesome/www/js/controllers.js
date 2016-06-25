angular.module('starter.controllers', [])

.controller('AppController', function($scope) {
})

.controller('SearchController', ['$scope', '$http', 'previewData', 'Favorites', 'Settings',
  function($scope, $http, previewData, Favorites, Settings) {

  $scope.preview = previewData;
  $scope.favorites = Favorites;
  $scope.settings = Settings;

  $scope.api = 'Giphy';
  $scope.searchtype = 'Search';
  $scope.hq = false;
  $scope.search = '';

  $scope.images = [];
  $scope.offset = 0;
  $scope.limit = 25;
  $scope.lastData = [];

  // run changeSearch each time the view is entered - that way, favorites are synced
  $scope.$on('$ionicView.enter', function() {
    $scope.changeSearch();
  })

  $scope.endResults = function() {
    return $scope.search === '' ? 'Enter a Search' : 'End of Results';
  }

  $scope.loadImages = function() {
    console.log("loading images, offset: " + $scope.offset);

    var nsfw = Settings().nsfw || false;

    if ($scope.api === 'Giphy') {
      var search;
      var nsfwFilter = nsfw ? '' : '&rating=pg-13';
      if ($scope.searchtype === 'Search') {
        search = 'https://api.giphy.com/v1/gifs/search?q=' + $scope.search + '&limit=' + $scope.limit +
          '&offset=' + $scope.offset + nsfwFilter + '&api_key=dc6zaTOxFJmzC';
      } else if ($scope.searchtype === 'Trending') {
        search = 'https://api.giphy.com/v1/gifs/trending?limit=' + $scope.limit +
          '&offset=' + $scope.offset + nsfwFilter + '&api_key=dc6zaTOxFJmzC';
      }

      $http.get(search)
        .then(function(response) {
          var data = response.data.data;
          $scope.lastData = data;

          for(var i = 0; i < data.length; i++) {
            var img = {
              imgUrl: data[i].images.fixed_height_small.url,
              // imgUrl: 'https://placehold.it/' + (i + $scope.offset + 100) + 'x' + (i + $scope.offset + 100),
              hqImgUrl: data[i].images.fixed_height.url,
              originalImgUrl: data[i].images.original.url,
              failed: false
            }
            img.favorite = $scope.favorites.isFavorite(img);
            img.tags = $scope.favorites.getTags(img);

            $scope.images.push(img);
          }

          $scope.offset += $scope.limit;
          $scope.$broadcast('scroll.infiniteScrollComplete');
        });
    } else if ($scope.api === 'GifMe') {
      var search;
      var nsfwFilter = nsfw ? '&sfw=false' : '&sfw=true';
      if ($scope.searchtype === 'Search') {
        search = 'https://api.gifme.io/v1/search?query=' + $scope.search + '&limit=' + $scope.limit +
          '&page=' + $scope.offset + nsfwFilter + '&key=rX7kbMzkGu7WJwvG';
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
              failed: false
            }
            img.favorite = $scope.favorites.isFavorite(img);
            img.tags = $scope.favorites.getTags(img);

            $scope.images.push(img);
          }

          // +1 page, different from giphy which is an image index offset
          $scope.offset ++;
          $scope.$broadcast('scroll.infiniteScrollComplete');
        });
    } else if ($scope.api === 'Riffsy') {
      var search;
      if ($scope.searchtype === 'Search') {
        search = 'https://api.riffsy.com/v1/search?tag=' + $scope.search + '&limit=' + $scope.limit +
          '&pos=' + $scope.offset;
      } else if ($scope.searchtype === 'Trending') {
        search = 'https://api.riffsy.com/v1/trending?limit=50';
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
              failed: false
            }
            img.favorite = $scope.favorites.isFavorite(img);
            img.tags = $scope.favorites.getTags(img);

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

    if ($scope.searchtype === 'Trending' || ($scope.searchtype === 'Search' && $scope.search !== '')) {
      $scope.loadImages();
    }
  }

  $scope.clearSearch = function() {
    $scope.search = '';
    $scope.changeSearch();
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

  $scope.updateTags = function(image) {
    $scope.favorites.updateTags(image);
  };
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

  $scope.updateTags = function(image) {
    $scope.favorites.updateTags(image);
  };

  $scope.clearSearch = function() {
    $scope.search = '';
  }

}])

.controller('MenuController', ['$scope', 'Auth', 'previewData', '$ionicModal', 'Favorites', 'Storage',
  function($scope, Auth, previewData, $ionicModal, Favorites, Storage) {
  $scope.auth = Auth;
  $scope.favorites = Favorites;
  $scope.storage = Storage;

  $scope.preview = previewData;
  $scope.customGif = { imgUrl: '', tags: [], failed: false};
  $scope.year = new Date().getFullYear();
  $scope.customType = 'upload';
  $scope.uploadProgress = 0;

  $ionicModal.fromTemplateUrl('templates/custom-gif.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.modal = modal;
  });
  $scope.openModal = function() {
    $scope.modal.show();
  };
  // Reset modal on hide
  $scope.$on('modal.hidden', function() {
    $scope.customGif = { imgUrl: '', tags: [], failed: false };
  });
  // Cleanup the modal when we're done with it!
  $scope.$on('$destroy', function() {
    $scope.modal.remove();
  });

  $scope.addCustomGif = function() {
    console.log($scope.customType);
    if ($scope.customType === 'link') {
      if ($scope.customGif.imgUrl !== "") {
        var image = {
          imgUrl: $scope.customGif.imgUrl,
          hqImgUrl: $scope.customGif.imgUrl,
          originalImgUrl: $scope.customGif.imgUrl,
          favorite: true,
          tags: $scope.customGif.tags
        }
        $scope.favorites.addFavorite(image);

        $scope.modal.hide();
      } else {
        console.error("No url given!");
      }
    } else {
      if ($scope.files !== undefined) {
        $scope.uploadCustomGif();
      } else {
        console.error("No file selected to upload!");
      }
    }
  };

  $scope.uploadCustomGif = function() {
    var file = $scope.files[0];
    var name = new Date().getTime().toString() + '.' + file.name.split('.').pop();
    var uploadTask = $scope.storage().child(name).put(file);

    uploadTask.on('state_changed', function(snapshot) {
      // Observe state change events such as progress, pause, and resume
      $scope.uploadProgress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      $scope.$apply();
    }, function(error) {
      // Handle unsuccessful uploads
    }, function() {
      // Handle successful uploads
      var downloadURL = uploadTask.snapshot.downloadURL;
      // Remove token from the url
      downloadURL = downloadURL.substring(0, downloadURL.indexOf('&token'));

      // TODO: Save url without auth, maybe it expires?
      var image = {
        imgUrl: downloadURL,
        hqImgUrl: downloadURL,
        originalImgUrl: downloadURL,
        filename: name,
        favorite: true,
        tags: $scope.customGif.tags
      }

      $scope.favorites.addFavorite(image);
      $scope.files = [];

      $scope.uploadProgress = 0;
      $scope.modal.hide();
    });
  }

}])

.controller('SettingsController', ['$scope', 'Settings', function($scope, Settings) {
  Settings().$bindTo($scope, 'settings');
}])

.controller('LoginController', ['$scope', 'Auth', function($scope, Auth) {
  $scope.auth = Auth;
}])

;
