angular.module('starter.factories', [])

.factory('previewData', function() {
  return {
    url: '',
    isLoaded: false
  };
})

.factory('Auth', ['$firebaseAuth', '$state', function($firebaseAuth, $state) {
    // Init firebase 3.x.x
    var config = {
      apiKey: "AIzaSyDvGo3D5AhgdzcAbli3H3lXuawv-yeOoao",
      authDomain: "giffingawesome.firebaseapp.com",
      databaseURL: "https://giffingawesome.firebaseio.com",
      storageBucket: "firebase-giffingawesome.appspot.com",
    };
    firebase.initializeApp(config);

    var auth = $firebaseAuth();

    // any time auth status updates, add the user data to scope
    auth.$onAuthStateChanged(function(authData) {
      auth.authData = authData;

      if (authData === null || authData === undefined) {
        $state.go('app.login');
      } else {
        $state.go('app.search');
      }
    });

    return auth;
  }
])

.factory('Settings', ['$firebaseObject', 'Auth',
  function($firebaseObject, Auth) {
    var settings = null;

    Auth.$onAuthStateChanged(function(authData) {
      if (authData !== null) {
        var USER = authData.uid;
        var ref = firebase.database().ref('users/' + USER + '/settings');
        settings = $firebaseObject(ref);
      }
    });

    function getSettings() {
      return settings;
    }

    return getSettings;
  }
])

.factory('Favorites', ['$firebaseArray', 'Auth', 'Storage',
  function($firebaseArray, Auth, Storage) {
    var favorites = null;
    var storage = Storage;

    Auth.$onAuthStateChanged(function(authData) {
      if (authData !== null) {
        var USER = authData.uid;
        var ref = firebase.database().ref('users/' + USER + '/favorites');
        favorites = $firebaseArray(ref);
      }
    });

    function addFavorite(image) {
      // Strip out stuff that isn't important
      var customImage = {
        imgUrl: image.imgUrl,
        hqImgUrl: image.hqImgUrl,
        originalImgUrl: image.originalImgUrl,
        favorite: image.favorite,
        tags: image.tags,
        // Only used with custom uploaded files
        filename: image.filename || null
      }
      favorites.$add(customImage);
    }

    function removeFavorite(image) {
      for (var i = 0; i < favorites.length; i++) {
        if (favorites[i].originalImgUrl === image.originalImgUrl) {
          if (favorites[i].filename !== undefined && favorites[i].filename !== null) {
            storage().child(favorites[i].filename).delete();
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
          image.tags = image.tags || [tag];
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

    return {
      addFavorite: addFavorite,
      removeFavorite: removeFavorite,
      updateTags: updateTags,
      getFavorites: getFavorites,
      isFavorite: isFavorite,
      getTags: getTags,
    };
  }
])

.factory('Storage', ['Auth',
  function(Auth) {
    var storage = null;

    Auth.$onAuthStateChanged(function(authData) {
      if (authData !== null) {
        var USER = authData.uid;

        var storageRef = firebase.storage().ref();
        storage = storageRef.child('users/' + USER + '/uploads');
      }
    });

    function getStorage() {
      return storage;
    }

    return getStorage;
  }
])
