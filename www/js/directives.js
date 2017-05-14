angular.module('app.directives', [])

.directive('fileInput', function () {
  return {
    restrict: 'A',
    link: function (scope, element, attributes) {
      element.bind('change', function () {
        scope.fileChanged(element[0].files);
      });
    }
  };
})

.directive('imageonerror', function() {
  return {
    restrict: 'A',
    link: function(scope, element, attrs) {
      element.bind('error', function(){
        element[0].parentNode.style = "display:none";
      });
    }
  };
})
