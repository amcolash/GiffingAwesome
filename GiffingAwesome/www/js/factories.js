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

.factory('Favorites', ['$firebaseArray', 'Auth',
  function($firebaseArray, Auth) {
    var favorites = null;

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
        tags: image.tags
      }
      favorites.$add(customImage);
    }

    function removeFavorite(image) {
      for (var i = 0; i < favorites.length; i++) {
        if (favorites[i].originalImgUrl === image.originalImgUrl) {
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

    return {
      addFavorite: addFavorite,
      removeFavorite: removeFavorite,
      updateTags: updateTags,
      getFavorites: getFavorites,
      isFavorite: isFavorite,
    };
  }
])

.factory('Storage', ['$window', 'Auth',
  function($window, Auth) {
    var storage = null;

    Auth.$onAuthStateChanged(function(authData) {
      if (authData !== null) {
        var USER = authData.uid;
        // var storageRef = $window.firebase.storage().ref();
        // var userRef = storageRef.child('users/' + USER + '/uploads');

      }
    });

    return {storage: 'yay'};
  }
])
