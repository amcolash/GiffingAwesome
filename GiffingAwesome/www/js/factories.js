angular.module('starter.factories', [])

.factory('previewData', function() {
  return {
    url: '',
    isLoaded: false
  };
})

.factory('Auth', ['$firebaseAuth', '$state', function($firebaseAuth, $state) {
    var ref = new Firebase('https://giffingawesome.firebaseio.com');
    var auth = $firebaseAuth(ref);

    // any time auth status updates, add the user data to scope
    auth.$onAuth(function(authData) {
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

    Auth.$onAuth(function(authData) {
      var USER = Auth.authData.uid;
      var ref = new Firebase('https://giffingawesome.firebaseio.com/users/' + USER + '/settings');
      settings = $firebaseObject(ref);
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

    Auth.$onAuth(function(authData) {
      var USER = Auth.authData.uid;
      var ref = new Firebase('https://giffingawesome.firebaseio.com/users/' + USER + '/favorites');
      favorites = $firebaseArray(ref);
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
