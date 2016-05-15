angular.module('starter.directives', [])

.directive('previewonload', function() {
  return {
    restrict: 'A',
    link: function(scope, element, attrs) {
      element.bind('load', function() {
        scope.preview.isLoaded = true;
        scope.$apply();
      });
      element.bind('error', function() {
        console.log('image could not be loaded');
        scope.preview.isLoaded = true;
        scope.$apply();
      });
    }
  };
})

.directive('gridonload', function() {
  return {
    restrict: 'A',
    link: function(scope, element, attrs) {
      // element.bind('load', function() {
      //   scope.image.isLoaded = true;
      //   scope.$apply();
      // });
      element.bind('error', function() {
        console.log('image could not be loaded');
        scope.image.failed = true;
        scope.$apply();
      });
    }
  };
})
