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
  $scope.mobile = false;
  $scope.animate = true;
  $scope.search = '';

  $scope.images = [];
  $scope.offset = 0;
  $scope.mobileLimit = 10;
  $scope.desktopLimit = 25;
  $scope.lastData = [];

  // run changeSearch each time the view is entered - that way, favorites are synced
  $scope.$on('$ionicView.enter', function() {
    $scope.mobile = (ionic.Platform.isAndroid() || ionic.Platform.isIOS() || ionic.Platform.isWindowsPhone()) && !ionic.Platform.is('tablet');
    $scope.animate = !$scope.mobile;
    $scope.limit = $scope.mobile ? $scope.mobileLimit : $scope.desktopLimit;

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
              thumbnailUrl: data[i].images.fixed_height_small_still.url,
              // imgUrl: 'https://placehold.it/' + (i + $scope.offset + 100) + 'x' + (i + $scope.offset + 100),
              hqImgUrl: data[i].images.fixed_height.url,
              hqThumbnailUrl: data[i].images.fixed_height_still.url,
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
              thumbnailUrl: data[i].thumb,
              hqImgUrl: data[i].link,
              hqThumbnailUrl: data[i].thumb,
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
              thumbnailUrl: data[i].media[0].nanogif.preview,
              hqImgUrl: data[i].media[0].gif.url,
              hqThumbnailUrl: data[i].media[0].gif.preview,
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
  $scope.mobile = false;
  $scope.animate = true;

  // debug option to regenerate all favorites thumbnails
  $scope.regen = false;

  $scope.$on('$ionicView.enter', function() {
    $scope.mobile = (ionic.Platform.isAndroid() || ionic.Platform.isIOS() || ionic.Platform.isWindowsPhone()) && !ionic.Platform.is('tablet');
    $scope.animate = !$scope.mobile;

    var numGen = 0;

    // Generate missing thumbnails. For now, custom gifs will need to be generated from here (also includes old images that do not contain the thumbnail code that was added)
    for (var i = 0; i < $scope.favorites.getFavorites().length; i++) {
      var image = $scope.favorites.getFavorites()[i];

      // Generate normal thumbnail if missing
      if (!image.thumbnailUrl || $scope.regen) {
        numGen++;
        console.log("generating normal thumbnail for: " + JSON.stringify(image));
        if (image.thumbnailUrl && image.thumbnailName) {
          // If there is an existing thumbnail, delete it
          $scope.storage().child(image.thumbnailName).delete().then(function() {
            // Deleted successfully
          }).catch(function(error) {
            // Something went wrong or the file does not exist
          });
        }

        $scope.generateThumbnail(image, false);
      }

      // Generate hq thumbnail if missing
      if (!image.hqThumbnailUrl || $scope.regen) {
        numGen++;
        console.log("generating hq thumbnail for: " + JSON.stringify(image));
        if (image.hqThumbnailUrl && image.hqThumbnailName) {
          // If there is an existing thumbnail, delete it
          $scope.storage().child(image.hqThumbnailName).delete().then(function() {
            // Deleted successfully
          }).catch(function(error) {
            // Something went wrong or the file does not exist
          });
        }

        $scope.generateThumbnail(image, true);
      }
    }

    if (numGen > 0) {
      console.log("total gen: " + numGen);
    }
  });

  $scope.generateThumbnail = function(image, hq) {
    var myCan = document.createElement('canvas');
    var img = new Image();
    img.setAttribute('crossOrigin', 'anonymous');
    img.src = hq ? image.hqImgUrl : image.imgUrl;
    img.onload = function () {

      var size = hq ? 400 : 200;
      if (img.height > img.width) {
        myCan.height = size;
        myCan.width = Number((img.height / img.width) * size);
      } else {
        myCan.height = Number((img.height / img.width) * size);
        myCan.width = size;
      }

      if (myCan.getContext) {
        var cntxt = myCan.getContext("2d");
        cntxt.drawImage(img, 0, 0, myCan.width, myCan.height);

        myCan.toBlob(function(blob) {
          var file = blob;
          var name = new Date().getTime().toString() + image.$id + '.png';
          file.lastModifiedDate = new Date();
          file.name = name;

          $scope.uploadThumbnail(image, file, hq);
        });
      }
    }
  }

  $scope.uploadThumbnail = function(image, file, hq) {
    var uploadTask = $scope.storage().child(file.name).put(file);

    uploadTask.on('state_changed', function(snapshot) {
      // Uploading
    }, function(error) {
      // Handle unsuccessful uploads
    }, function() {
      // Handle successful uploads
      var downloadURL = uploadTask.snapshot.downloadURL;
      // Remove token from the url
      downloadURL = downloadURL.substring(0, downloadURL.indexOf('&token'));

      if (hq) {
        image.hqThumbnailUrl = downloadURL;
        image.hqThumbnailName = file.name;
      } else {
        image.thumbnailUrl = downloadURL;
        image.thumbnailName = file.name;
      }

      // Make a temp "image" object, it is slightly different when using updateTags()
      var temp = {};
      temp.image = image;

      $scope.favorites.updateTags(temp);
    })
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

.controller('SettingsController', ['$scope', 'Settings', 'Auth', function($scope, Settings, Auth) {
  $scope.auth = Auth;
  Settings().$bindTo($scope, 'settings');
  $scope.googleAuth = {};
  $scope.twitterAuth = {};

  $scope.updateProviders = function() {
    $scope.googleAuth = {};
    $scope.twitterAuth = {};

    for (var i = 0; i < Auth.authData.providerData.length; i++) {
      if (Auth.authData.providerData[i].providerId === "google.com") {
        $scope.googleAuth = Auth.authData.providerData[i];
      } else if (Auth.authData.providerData[i].providerId === "twitter.com") {
        $scope.twitterAuth = Auth.authData.providerData[i];
      }
    }
  }

  // Do this after the function is defined
  $scope.updateProviders();

  $scope.unlink = function(authMethod) {
    if (authMethod === "google") {
      var id = $scope.googleAuth.providerId;
    } else if (authMethod === "twitter") {
      var id = $scope.twitterAuth.providerId;
    }

    $scope.auth.authData.unlink(id).then(function(result) {
      console.log("Success unlinking: " + result);
      $scope.updateProviders();
    }).catch(function(error) {
      console.error("Error: " + error);
      $scope.updateProviders();
    });

  }

  $scope.link = function(authMethod) {
    console.log($scope.auth)

    if (ionic.Platform.isAndroid()) {
      if(authMethod === "google") {
        window.plugins.googleplus.login({
          'webClientId': keys.googleId,
    	    'offline': true
        },
        function (oauth) {
          var credential = firebase.auth.GoogleAuthProvider.credential(oauth.idToken);
          $scope.auth.$link(credential).then(function(result) {
            console.log("Success linking: " + result);
            $scope.updateProviders();
          }).catch(function(error) {
            console.error("Error: " + error);
            $scope.updateProviders();
          });
        },
        function (msg) {
          console.error('Error: ' + JSON.stringify(msg));
        });
      } else if (authMethod === "twitter") {
        $cordovaOauth.twitter(keys.twitterId, keys.twitterSecret).then(function(oauth) {
          var credential = firebase.auth.TwitterAuthProvider.credential(oauth.oauth_token, oauth.oauth_token_secret);
          $scope.auth.$link(credential).then(function(result) {
            console.log("Success linking: " + result);
            $scope.updateProviders();
          }).catch(function(error) {
            console.error("Error: " + error);
            $scope.updateProviders();
          });
        }, function(error) {
          console.error("Error: " + JSON.stringify(error));
        });
      }
    } else {
      if (authMethod === "google") {
        var provider = new firebase.auth.GoogleAuthProvider();
      } else if (authMethod === "twitter") {
        var provider = new firebase.auth.TwitterAuthProvider();
      }

      $scope.auth.authData.linkWithPopup(provider).then(function(result) {
        console.log("Success linking: " + result);
        $scope.updateProviders();
      }).catch(function(error) {
        console.error("Error: " + error);
        $scope.updateProviders();
      });

    }

  }
}])

.controller('LoginController', ['$scope', 'Auth', 'keys', '$cordovaOauth', function($scope, Auth, keys, $cordovaOauth) {
  $scope.auth = Auth;

  $scope.login = function(authMethod) {
    // Redirect login method
    if(ionic.Platform.isAndroid()) {
      if(authMethod === "google") {
        window.plugins.googleplus.login({
          'webClientId': keys.googleId,
    	    'offline': true
        },
        function (oauth) {
          var credential = firebase.auth.GoogleAuthProvider.credential(oauth.idToken);
          $scope.auth.$signInWithCredential(credential).then(function(authData) {
            console.log("Signed in as: " + authData.uid);
          }).catch(function(error) {
            console.error("Authentication failed: " + JSON.stringify(error))
          });
        },
        function (msg) {
          console.error('Error: ' + JSON.stringify(msg));
        });
      } else if (authMethod === "twitter") {
        $cordovaOauth.twitter(keys.twitterId, keys.twitterSecret).then(function(oauth) {
          var credential = firebase.auth.TwitterAuthProvider.credential(oauth.oauth_token, oauth.oauth_token_secret);
          $scope.auth.$signInWithCredential(credential).then(function(authData) {
            console.log("Signed in as: " + authData.uid);
          }).catch(function(error) {
            console.error("Authentication failed: " + JSON.stringify(error));
          });
        }, function(error) {
          console.error("Error: " + JSON.stringify(error));
        });
      }
    } else {
      // Default popup on desktop
      console.log("attempting to log in with popup")
      $scope.auth.$signInWithPopup(authMethod).then(function(authData) {
        console.log("Signed in as:", authData.uid);
      }).catch(function(error) {
        console.log(JSON.stringify(error));
      });
    }
  }
}])

;
