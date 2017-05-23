angular.module('app.factories', [])

.factory('Credentials', ['keys', '$cordovaOauth', '$q', function(keys, $cordovaOauth, $q) {
  return function(authMethod) {
    var deferred = $q.defer();
    // Redirect login method
    if(ionic.Platform.isAndroid()) {
      if(authMethod === "google") {
        window.plugins.googleplus.login({
    	  'offline': true,
          'webClientId': keys.googleId,
        },
        function (oauth) {
          deferred.resolve(firebase.auth.GoogleAuthProvider.credential(oauth.idToken));
        },
        function (error) {
          console.error('Error: ' + JSON.stringify(error));
          deferred.reject(error);
        });
      } else if (authMethod === "twitter") {
        $cordovaOauth.twitter(keys.twitterId, keys.twitterSecret).then(function(oauth) {
          deferred.resolve(firebase.auth.TwitterAuthProvider.credential(oauth.oauth_token, oauth.oauth_token_secret));
        }, function(error) {
          console.error("Error: " + JSON.stringify(error));
          deferred.reject(error);
        });
      }
    } else {
      if (authMethod === "google") {
        deferred.resolve(new firebase.auth.GoogleAuthProvider());
      } else if (authMethod === "twitter") {
        deferred.resolve(new firebase.auth.TwitterAuthProvider());
      }
    }

    return deferred.promise;
  }
}])

.factory('Auth', ['$firebaseAuth', function($firebaseAuth) {
  return $firebaseAuth();
}])

// The below factories have deferred promises because we need to wait for a uid first
.factory('Settings', ['Auth', '$firebaseObject', '$q', function(Auth, $firebaseObject, $q) {
  var deferred = $q.defer();

  Auth.$onAuthStateChanged(function(authData) {
    if (authData && authData.uid) {
      var ref = firebase.database().ref('users/' + authData.uid + '/settings');
      var settings = $firebaseObject(ref);

      // Need to wait while the object is loaded
      settings.$loaded().then(function() {
        deferred.resolve(settings);
      });
    }
  });

  return deferred.promise;
}])

.factory('Favorites', ['$firebaseArray', '$q', 'Auth', 'Storage', function($firebaseArray, $q, Auth, Storage) {
  var deferred = $q.defer();
  var favorites = null;
  var storage = null;

  var storageResolve = Storage.then(function(data) {
    storage = data;
  })

  Auth.$onAuthStateChanged(function(authData) {
    if (authData && authData.uid) {
      var ref = firebase.database().ref('users/' + authData.uid + '/favorites');
      favorites = $firebaseArray(ref);

      var favoritesResolve = favorites.$loaded();

      // Need to wait for storage and array resolve
      $q.all([favoritesResolve, storageResolve]).then(function() {
        deferred.resolve({
          addFavorite: addFavorite,
          removeFavorite: removeFavorite,
          updateTags: updateTags,
          getFavorites: getFavorites,
          isFavorite: isFavorite,
          getTags: getTags,
        });
      });
    }
  });

  function addFavorite(image) {
    // Strip out stuff that isn't important
    var customImage = {
      imgUrl: image.imgUrl,
      hqImgUrl: image.hqImgUrl,
      originalImgUrl: image.originalImgUrl,
      thumbnailUrl: image.thumbnailUrl || null,
      hqThumbnailUrl: image.hqThumbnailUrl || null,
      favorite: image.favorite,
      tags: image.tags,
      // Only used with custom uploaded files
      filename: image.filename || null,
      thumbnailName: image.thumbnailName || null,
      hqThumbnailName: image.hqThumbnailName || null,
    }
    favorites.$add(customImage).then(function(data) {
      console.log(data);
    }, function(error) {
      console.error(error)
    });
  }

  function removeFavorite(image) {
    for (var i = 0; i < favorites.length; i++) {
      if (favorites[i].originalImgUrl === image.originalImgUrl) {
        if (favorites[i].filename !== undefined && favorites[i].filename !== null) {
          storage.storage.child(favorites[i].filename).delete();
        }
        if (favorites[i].thumbnailName !== undefined && favorites[i].thumbnailName !== null) {
          storage.storage.child(favorites[i].thumbnailName).delete();
        }
        if (favorites[i].hqThumbnailName !== undefined && favorites[i].hqThumbnailName !== null) {
          storage.storage.child(favorites[i].hqThumbnailName).delete();
        }

        favorites.$remove(i);
        return;
      }
    }

    console.error('unable to remove favorite');
  }

  function updateTags(value) {
    var image = value.image;
    var tag = value.tag;

    for (var i = 0; i < favorites.length; i++) {
      if (favorites[i].originalImgUrl === image.originalImgUrl) {
        image.tags = image.tags || (tag ? [tag] : null);
        favorites[i].tags = image.tags;
        favorites.$save(i);
      }
    }
  }

  function getFavorites() {
    if (favorites === null) {
      return [];
    }
    return favorites;
  }

  function isFavorite(image) {
    for (var i = 0; i < favorites.length; i++) {
      if (favorites[i].originalImgUrl === image.originalImgUrl) {
        return true;
      }
    }
    return false;
  }

  function getTags(image) {
    for (var i = 0; i < favorites.length; i++) {
      if (favorites[i].originalImgUrl === image.originalImgUrl) {
        return favorites[i].tags;
      }
    }
    return [];
  }

  return deferred.promise;
}])

.factory('Storage', ['Auth', '$firebaseArray', '$q', function(Auth, $firebaseArray, $q) {
  var deferred = $q.defer();

  Auth.$onAuthStateChanged(function(authData) {
    if (authData && authData.uid) {
      var fileRef = firebase.database().ref('users/' + authData.uid + '/files');
      var fileList = $firebaseArray(fileRef);

      var storageRef = firebase.storage().ref();
      var storage = storageRef.child('users/' + authData.uid + '/uploads');

      deferred.resolve({
        fileList: fileList,
        storage: storage
      });
    }
  });

  return deferred.promise;
}])

.factory('Preview', ['$ionicModal', '$q', function($ionicModal, $q) {
  var deferred = $q.defer();

  $ionicModal.fromTemplateUrl('templates/preview.html', {
    // scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    deferred.resolve(modal);
  });

  return deferred.promise;
}])
