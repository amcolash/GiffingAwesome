// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'app' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
var ionicApp = angular.module('app', [
  'ionic',
  'firebase',
  'app.controllers',
  'app.directives',
  'app.factories',
  'app.keys',
  'angular-clipboard',
  'file-model',
  'ngTagsInput',
  'ngCordovaOauth'
])

.run(['keys', function(keys) {
  if (keys.googleId.length == 0) {
    console.error("Missing googleId for Oauth");
  }
  if (keys.twitterId.length == 0) {
    console.error("Missing twitterId for Oauth");
  }
  if (keys.twitterSecret.length == 0) {
    console.error("Missing twitterSecret for Oauth");
  }
}])

.run(['$ionicPlatform', 'firebase', function($ionicPlatform, firebase) {
  $ionicPlatform.ready(function() {
    if(window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

      // Don't remove this line unless you know what you are doing. It stops the viewport
      // from snapping when text inputs are focused. Ionic handles this internally for
      // a much nicer keyboard experience.
      cordova.plugins.Keyboard.disableScroll(true);
    }

    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });

  var config = {
    apiKey: "AIzaSyDvGo3D5AhgdzcAbli3H3lXuawv-yeOoao",
    authDomain: "giffingawesome.firebaseapp.com",
    databaseURL: "https://giffingawesome.firebaseio.com",
    storageBucket: "firebase-giffingawesome.appspot.com",
  };

  firebase.initializeApp(config);
}])

.run(['$rootScope', '$state', '$ionicLoading', 'Auth', function($rootScope, $state, $ionicLoading, Auth) {

  $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams, error) {
    // Prevent going back to the login page after a successful authentication
    if (toState.name === 'login' && Auth.$getAuth()) {
      event.preventDefault();
    }

    if (toState.name !== 'error' && !navigator.onLine) {
      event.preventDefault();
      $state.go('error');
    }

    $ionicLoading.show({
      content: 'Loading',
      animation: 'fade-in',
      showBackdrop: true,
      maxWidth: 200,
      showDelay: 0
    });
  });

  $rootScope.$on('$stateChangeError', function(event, toState, toParams, fromState, fromParams, error) {
    $ionicLoading.hide();
    // We can catch the error thrown when the $requireSignIn promise is rejected
    // and redirect the user back to the home page
    if (error === 'AUTH_REQUIRED') {
      console.error('not authenticated');
      $state.go('login');
    } else {
      console.log("state change error")
      $state.go('error');
    }
  });

  $rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams, error) {
    $ionicLoading.hide();
  });

  // When logging in / logging out, change states automatically
  Auth.$onAuthStateChanged(function(authData) {
    if (authData) {
      // Go to search after logging in
      if ($state.current.name === "login") {
        $state.go('app.search');
      }
    } else {
      // Go back to login when logging out
      $state.go('login');
    }
  });
}])

.config(['$ionicConfigProvider', function($ionicConfigProvider) {
  $ionicConfigProvider.scrolling.jsScrolling(false);
}])

.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider

    .state('login', {
      url: '/login',
      templateUrl: 'templates/login.html',
      controller: 'LoginController'
    })

    .state('error', {
      url: '/error',
      templateUrl: 'templates/error.html',
      controller: 'ErrorController'
    })

    .state('app', {
      abstract: true,
      templateUrl: 'templates/menu.html',
      controller: 'MenuController',
      resolve: {
        'currentAuth': ['Auth', function(Auth) {
          // controller will not be loaded until $requireSignIn resolves
          // Auth refers to our $firebaseAuth wrapper in the factory below
          // $requireSignIn returns a promise so the resolve waits for it to complete
          // If the promise is rejected, it will throw a $stateChangeError (see above)
          // This promise will require all substates of app to have authentication
          return Auth.$requireSignIn();
        }]
      }
    })

    .state('app.search', {
      url: '/',
      views: {
        'menuContent': {
          templateUrl: 'templates/search.html',
          controller: 'SearchController'
        }
      }
    })

    .state('app.favorites', {
      url: '/favorites',
      views: {
        'menuContent': {
          templateUrl: 'templates/favorites.html',
          controller: 'FavoritesController'
        }
      }
    })

    .state('app.upload', {
      url: '/upload',
      views: {
        'menuContent': {
          templateUrl: 'templates/custom-gif.html',
          controller: 'UploadController'
        }
      }
    })

    .state('app.settings', {
      url: '/settings',
      views: {
        'menuContent': {
          templateUrl: 'templates/settings.html',
          controller: 'SettingsController'
        }
      }
    })

    ;

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/');
})

;
