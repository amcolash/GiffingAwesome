angular.module('app.controllers', [])

.controller('MenuController', ['$scope', '$ionicModal', 'Auth', 'Preview', 'Settings', function($scope, $ionicModal, Auth, Preview,  Settings) {
  $scope.year = new Date().getFullYear();

  Preview.then(function(data) {
    $scope.Preview = data;
  });

  $scope.signOut = function() {
    Auth.$signOut();
  };

  $scope.$on('$destroy', function() {
    $scope.Preview.remove();
  });
}])

.controller('UploadController', ['$scope', '$state', '$timeout', 'Favorites', 'Storage', function($scope, $state, $timeout, Favorites, Storage) {
  Favorites.then(function(data) {
    $scope.Favorites = data;
  });

  Storage.then(function(data) {
    $scope.FileList = data.fileList;
    $scope.Storage = data.storage;
  });

  $scope.fileChanged = function(data) {
    $scope.files = data;
    $scope.$apply();
  };

  // $scope.uploadProgress = 0;
  // $scope.showSuccess = false;
  // $scope.showError = false;
  $scope.customType = "link";
  $scope.customGif = { imgUrl: '', imgData: '', tags: [], failed: false};

  $scope.addCustomGif = function() {
    if ($scope.customType === 'link') {
      if ($scope.customGif.imgUrl !== "") {
        var image = {
          imgUrl: $scope.customGif.imgUrl,
          hqImgUrl: $scope.customGif.imgUrl,
          originalImgUrl: $scope.customGif.imgUrl,
          favorite: true,
          tags: $scope.customGif.tags
        }
        $scope.Favorites.addFavorite(image);
        $state.go('app.favorites');
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

  $scope.$watch('files', function(oldValue, newValue) {
    if ($scope.files) {
      var file = $scope.files;

      if (file.name) {
        var reader = new FileReader();
        reader.onload = function (e) {
          $scope.customGif.imgData = e.target.result;
          $scope.$apply();
        }

        reader.readAsDataURL(file);
      }
    }
  });

  $scope.uploadCustomGif = function() {
    if ($scope.files) {
      var file = $scope.files;
      var name = new Date().getTime().toString() + '.' + file.name.split('.').pop();
      var uploadTask = $scope.Storage.child(name).put(file);

      uploadTask.on('state_changed', function(snapshot) {
        // Observe state change events such as progress, pause, and resume
        $scope.uploadProgress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        $scope.$apply();
      }, function(error) {
        // Handle unsuccessful uploads
      }, function() {
        // Handle successful uploads
        console.log(uploadTask.snapshot);
        var downloadURL = uploadTask.snapshot.downloadURL;
        // Remove token from the url
        // downloadURL = downloadURL.substring(0, downloadURL.indexOf('&token'));

        var image = {
          imgUrl: downloadURL,
          hqImgUrl: downloadURL,
          originalImgUrl: downloadURL,
          filename: name,
          favorite: true,
          tags: $scope.customGif.tags || []
        }

        $scope.Favorites.addFavorite(image);

        // Clear preview, before changing files so that the apply works correctly
        $scope.customGif.imgData = null;
        $scope.uploadProgress = 0;
        $scope.$apply();

        $scope.files = undefined;

        // $scope.modal.hide();
      });
    }
  };
}])

.controller('SearchController', ['$scope', '$http', 'Favorites', 'Preview', 'Settings',
  function($scope, $http, Favorites, Preview, Settings) {

  Favorites.then(function(data) {
    $scope.Favorites = data;
  });

  Preview.then(function(data) {
    $scope.Preview = data;
  });

  Settings.then(function(data) {
    $scope.Settings = data;
  });

  $scope.api = 'Giphy';
  $scope.searchtype = 'Search';
  $scope.hq = false;
  $scope.mobile = false;
  $scope.expanded = true;
  $scope.ios = false;
  $scope.android = false;
  $scope.animate = true;
  $scope.search = '';

  $scope.images = [];
  $scope.offset = 0;
  $scope.mobileLimit = 10;
  $scope.desktopLimit = 25;
  $scope.lastData = [];

  // run changeSearch each time the view is entered - that way, favorites are synced
  $scope.$on('$ionicView.enter', function() {
    $scope.mobile = ionic.Platform.isAndroid() || ionic.Platform.isIOS() || ionic.Platform.isWindowsPhone();
    $scope.ios = ionic.Platform.isIOS();
    $scope.android = ionic.Platform.isAndroid();
    $scope.animate = !$scope.mobile;
    $scope.expanded = !$scope.mobile;
    $scope.limit = $scope.mobile ? $scope.mobileLimit : $scope.desktopLimit;

    $scope.changeSearch();
  })

  $scope.endResults = function() {
    return $scope.search === '' ? 'Enter a Search' : 'End of Results';
  }

  $scope.loadImages = function() {
    console.log("loading images, offset: " + $scope.offset);

    var nsfw = $scope.Settings.nsfw || false;

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
              hqImgUrl: data[i].images.fixed_height.url,
              hqThumbnailUrl: data[i].images.fixed_height_still.url,
              originalImgUrl: data[i].images.original.url,
            }
            img.favorite = $scope.Favorites.isFavorite(img);
            img.tags = $scope.Favorites.getTags(img);

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
            }
            img.favorite = $scope.Favorites.isFavorite(img);
            img.tags = $scope.Favorites.getTags(img);

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
            }
            img.favorite = $scope.Favorites.isFavorite(img);
            img.tags = $scope.Favorites.getTags(img);

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
    $scope.Preview.scope.ios = ionic.Platform.isIOS();
    $scope.Preview.scope.android = ionic.Platform.isAndroid();
    $scope.Preview.scope.image = image;
    $scope.Preview.scope.parentScope = $scope;
    $scope.Preview.show();
  }
}])

.controller('FavoritesController', ['$q', '$scope', 'Favorites', 'Preview', 'Storage',
  function($q, $scope, Favorites, Preview, Storage) {

  var favoritesResolve = Favorites.then(function(data) {
    $scope.Favorites = data;
  });

    // Storage resolve after favorites
  var storageResolve = Storage.then(function(data) {
    $scope.FileList = data.fileList;
    $scope.Storage = data.storage;
  });

  Preview.then(function(data) {
    $scope.Preview = data;
  });

  // Wait for both favorites and storage to resolve before trying to generate thumbnails
  $q.all([favoritesResolve, storageResolve]).then(function() {
    $scope.generateMissingThumbnails();
  });

  $scope.mobile = false;
  $scope.ios = false;
  $scope.android = false;
  $scope.animate = true;

  // debug option to regenerate all favorites thumbnails
  $scope.regen = false;

  $scope.$on('$ionicView.enter', function() {
    $scope.mobile = ionic.Platform.isAndroid() || ionic.Platform.isIOS() || ionic.Platform.isWindowsPhone();
    $scope.ios = ionic.Platform.isIOS();
    $scope.android = ionic.Platform.isAndroid();
    $scope.animate = !$scope.mobile;
  });

  //  Generate missing thumbnails. For now, custom gifs will need to be generated from here (also includes old images that do not contain the thumbnail code that was added)
  $scope.generateMissingThumbnails = function() {

    var numGen = 0;
    for (var i = 0; i < $scope.Favorites.getFavorites().length; i++) {
      var image = $scope.Favorites.getFavorites()[i];

      // Generate normal thumbnail if missing
      if (!image.thumbnailUrl || $scope.regen) {
        numGen++;
        console.log("generating normal thumbnail for: " + JSON.stringify(image));
        if (image.thumbnailUrl && image.thumbnailName) {
          // If there is an existing thumbnail, delete it
          console.log("deleted old thumbnail for: " + image);
          $scope.Storage.child(image.thumbnailName).delete().then(function() {
            // Deleted successfully
          }).catch(function(error) {
            console.error(error);
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
          console.log("deleted old thumbnail for: " + image);
          $scope.Storage.child(image.hqThumbnailName).delete().then(function() {
            // Deleted successfully
          }).catch(function(error) {
            console.error(error);
          });
        }

        $scope.generateThumbnail(image, true);
      }
    }

    if (numGen > 0) {
      console.log("total gen: " + numGen);
    }
  }

  $scope.generateThumbnail = function(image, hq) {
    var myCan = document.createElement('canvas');
    var img = new Image();
    img.crossOrigin = 'Anonymous';
    img.src = hq ? image.hqImgUrl : image.imgUrl;

    img.onload = function () {
      var size = hq ? 400 : 200;

      if (img.height > img.width) {
        myCan.height = size;
        myCan.width = Number((img.width / img.height) * size);
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
    var uploadTask = $scope.Storage.child(file.name).put(file);

    uploadTask.on('state_changed', function(snapshot) {
      // Uploading
    }, function(error) {
      // Handle unsuccessful uploads
      console.error(error);
    }, function() {
      // Handle successful uploads
      var downloadURL = uploadTask.snapshot.downloadURL;
      // Remove token from the url
      // downloadURL = downloadURL.substring(0, downloadURL.indexOf('&token'));

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

      $scope.Favorites.updateTags(temp);
    })
  }

  $scope.setupPreview = function(image) {
    $scope.Preview.scope.ios = ionic.Platform.isIOS();
    $scope.Preview.scope.android = ionic.Platform.isAndroid();
    $scope.Preview.scope.image = image;
    $scope.Preview.scope.parentScope = $scope;
    $scope.Preview.show();
  }

  $scope.clearSearch = function() {
    $scope.search = '';
  }

}])

.controller('SettingsController', ['$scope', 'Settings', 'Auth', 'Credentials', function($scope, Settings, Auth, Credentials) {

  Settings.then(function(data) {
    data.$bindTo($scope, "settings").then(function(unbind) {
      $scope.$on('$ionicView.beforeLeave', function() {
        unbind();
      })
    });
  });

  $scope.auth = Auth;
  $scope.credentials = Credentials;

  $scope.googleAuth;
  $scope.twitterAuth;

  $scope.updateProviders = function(init) {
    $scope.googleAuth = undefined;
    $scope.twitterAuth = undefined;

    var providerData = $scope.auth.$getAuth().providerData;
    for (var i = 0; i < providerData.length; i++) {
      if (providerData[i].providerId === "google.com") {
        $scope.googleAuth = providerData[i];
      } else if (providerData[i].providerId === "twitter.com") {
        $scope.twitterAuth = providerData[i];
      }
    }

    if (!init) {
      $scope.$apply();
    }
  }

  // Do this after the function is defined
  $scope.updateProviders(true);

  $scope.unlink = function(authMethod) {
    if (authMethod === "google") {
      var id = $scope.googleAuth.providerId;
    } else if (authMethod === "twitter") {
      var id = $scope.twitterAuth.providerId;
    }

    $scope.auth.$getAuth().unlink(id).then(function(result) {
      console.log("Success unlinking: " + authMethod);
      $scope.updateProviders();
    }).catch(function(error) {
      console.error("Error: " + JSON.stringify(error));
      $scope.updateProviders();
    });

  }

  $scope.link = function(authMethod) {
    console.log($scope.auth)

    $scope.credentials(authMethod).then(function(credential) {
      if (ionic.Platform.isAndroid() && window.cordova) {
        $scope.auth.$getAuth().link(credential).then(function(result) {
          console.log("Success linking: " + authMethod);
          $scope.updateProviders();
        }).catch(function(error) {
          console.error("Error: " + JSON.stringify(error));
          $scope.updateProviders();
        });
      } else {
        $scope.auth.$getAuth().linkWithPopup(credential).then(function(result) {
          console.log("Success linking: " + authMethod);
          $scope.updateProviders();
        }).catch(function(error) {
          console.error("Error: " + JSON.stringify(error));
          $scope.updateProviders();
        });
      }
    }, function(error) {
      console.error("Error: " + JSON.stringify(error));
      $scope.updateProviders();
    })

  }
}])

.controller('ErrorController', ['$interval', '$scope', '$state', function($interval, $scope, $state) {
  if (navigator.onLine) {
    $state.go('login');
  } else {
    $scope.check = $interval(function() {
      if (navigator.onLine) {
        $interval.cancel($scope.check);
        $state.go('login');
      }
    }, 3000);
  }
}])

.controller('LoginController', ['$scope', 'Auth', 'Credentials', function($scope, Auth, Credentials) {
  $scope.auth = Auth;
  $scope.credentials = Credentials;

  $scope.login = function(authMethod) {
    $scope.credentials(authMethod).then(function(credentials) {
      console;
      if (ionic.Platform.isAndroid() && window.cordova) {
        $scope.auth.$signInWithCredential(credentials);
      } else {
        $scope.auth.$signInWithPopup(credentials);
      }
    }, function(error) {
      console.error("Error: " + JSON.stringify(error));
    })
  };
}])

;
