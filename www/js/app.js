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
  'ngTagsInput',
  'ngCordovaOauth'
])

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

  $rootScope.$on('$stateChangeError', function(event, toState, toParams, fromState, fromParams, error) {
    console.log("error")
    $ionicLoading.hide();
    // We can catch the error thrown when the $requireSignIn promise is rejected
    // and redirect the user back to the home page
    if (error === 'AUTH_REQUIRED') {
      console.error('not authenticated');
      $state.go('login');
    } else {
      $state.go('app.error');
    }
  });

  $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams, error, $state) {
    // Prevent going back to the login page after a successful authentication
    if (toState.name === 'login' && Auth.$getAuth()) {
      event.preventDefault();
    }

    console.log("changing")
    $ionicLoading.show({
      content: 'Loading',
      animation: 'fade-in',
      showBackdrop: true,
      maxWidth: 200,
      showDelay: 0
    });
  });

  $rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams, error, $state) {
    console.log("success")
    $ionicLoading.hide();
  });

  // When logging in / logging out, change states automatically
  Auth.$onAuthStateChanged(function(authData) {
    if (authData) {
      // Go to dashboard after logging in
      if ($state.current.name === "login") {
        $state.go('app.dashboard');
      }
    } else {
      // Go back to login when logging out
      $state.go('login');
    }
  });
}])

.config(['$ionicConfigProvider', function($ionicConfigProvider) {
  if (!ionic.Platform.isAndroid()) {
    $ionicConfigProvider.scrolling.jsScrolling(false);
  }
}])

.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider

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
          return Auth.$requireSignIn();
        }]
      }
    })

    .state('login', {
      url: '/login',
      templateUrl: 'templates/login.html',
      controller: 'LoginController'
    })

    .state('app.dashboard', {
      url: '/',
      views: {
        'menuContent': {
          templateUrl: 'templates/dashboard.html',
          controller: 'DashboardController'
        }
      },
      // resolve: {
      //   'currentAuth': ['Auth', function(Auth) {
      //     // controller will not be loaded until $requireSignIn resolves
      //     // Auth refers to our $firebaseAuth wrapper in the factory below
      //     // $requireSignIn returns a promise so the resolve waits for it to complete
      //     // If the promise is rejected, it will throw a $stateChangeError (see above)
      //     return Auth.$requireSignIn();
      //   }]
      // }
    })

    .state('app.error', {
      url: '/error',
      templateUrl: 'templates/error.html'
    })

    .state('app.favorites', {
      url: '/favorites',
      views: {
        'menuContent': {
          templateUrl: 'templates/favorites.html',
          controller: 'FavoritesController'
        }
      },
      // resolve: {
      //   'currentAuth': ['Auth', function(Auth) {
      //     return Auth.$requireSignIn();
      //   }]
      // }
    })


    .state('app.upload', {
      url: '/upload',
      views: {
        'menuContent': {
          templateUrl: 'templates/upload.html',
          controller: 'UploadController'
        }
      },
      // resolve: {
      //   'currentAuth': ['Auth', function(Auth) {
      //     return Auth.$requireSignIn();
      //   }]
      // }
    })

    .state('app.settings', {
      url: '/settings',
      views: {
        'menuContent': {
          templateUrl: 'templates/settings.html',
          controller: 'SettingsController'
        }
      },
      // resolve: {
      //   'currentAuth': ['Auth', function(Auth) {
      //     return Auth.$requireSignIn();
      //   }]
      // }
    })

    ;

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/');
})

;
