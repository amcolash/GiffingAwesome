angular.module('app.factories', [])

.factory('Credentials', ['keys', '$cordovaOauth', '$q', function(keys, $cordovaOauth, $q) {
  return function(authMethod) {
    var deferred = $q.defer();
    // Redirect login method
    if(ionic.Platform.isAndroid()) {
      if(authMethod === "google") {
        window.plugins.googleplus.login({
          'webClientId': keys.googleId,
    	    'offline': true
        },
        function (oauth) {
          deferred.resolve(firebase.auth.GoogleAuthProvider.credential(oauth.idToken));
        },
        function (error) {
          console.error('Error: ' + JSON.stringify(error));
          deferred.error(error);
        });
      } else if (authMethod === "twitter") {
        $cordovaOauth.twitter(keys.twitterId, keys.twitterSecret).then(function(oauth) {
          deferred.resolve(firebase.auth.TwitterAuthProvider.credential(oauth.oauth_token, oauth.oauth_token_secret));
        }, function(error) {
          console.error("Error: " + JSON.stringify(error));
          deferred.error(error);
        });
      }
    } else {
      if (authMethod === "google") {
        deferred.resolve(new firebase.auth.GoogleAuthProvider());
      } else if (authMethod === "twitter") {
        deferred.resolve(new firebase.auth.TwitterAuthProvider());
      }

      // $scope.auth.$signInWithCredential(credential).then(function(authData) {
      //   console.log("Signed in as: " + authData.uid);
      // }).catch(function(error) {
      //   console.error("Authentication failed: " + JSON.stringify(error));
      // });
      // Default popup on desktop
      // console.log("attempting to log in with popup")
      // $scope.auth.$signInWithPopup(authMethod).then(function(authData) {
      //   console.log("Signed in as:", authData.uid);
      // }).catch(function(error) {
      //   console.log(JSON.stringify(error));
      // });
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
