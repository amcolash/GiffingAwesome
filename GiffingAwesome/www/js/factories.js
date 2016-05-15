angular.module('starter.factories', [])

.factory('previewData', function() {
  return {
    url: '',
    isLoaded: false
  };
})

.factory("Auth", ["$firebaseAuth", "$state", function($firebaseAuth, $state) {
    var ref = new Firebase("https://giffingawesome.firebaseio.com");
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

.factory("Favorites", ["$firebaseArray", "Auth",
  function($firebaseArray, Auth) {
    var USER = Auth.authData.uid;
    var ref = new Firebase("https://giffingawesome.firebaseio.com/users/" + USER + "/favorites");
    var favorites = $firebaseArray(ref);

    function addFavorite(image) {
      favorites.$add(image);
    }

    function removeFavorite(image) {
      for (var i = 0; i < favorites.length; i++) {
        if (favorites[i].originalImgUrl === image.originalImgUrl) {
          favorites.$remove(i);
          return;
        }
      }
      console.error("unable to remove favorite");
    }

    function getFavorites() {
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
      getFavorites: getFavorites,
      removeFavorite: removeFavorite,
      isFavorite: isFavorite
    };
  }
])
