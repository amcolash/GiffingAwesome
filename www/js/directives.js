angular.module('app.directives', [])

.directive('fileInput', function () {
  return {
    restrict: 'A',
    link: function (scope, element, attributes) {
      element.on('change', function () {
        scope.fileChanged(element[0].files);
      });
    }
  };
})

.directive('imageonerror', function() {
  return {
    restrict: 'A',
    link: function(scope, element, attrs) {
      element.on('error', function(){
        element[0].parentNode.style = "display:none";
      });
    }
  };
})

.directive('returnclose', function(){
  return {
    restrict: 'A',
    link: function(scope, element, attr){
      element.on('keydown', function(e){
        if(e.which == 13) { // Enter key
          element[0].blur();
        }
      });
    }
  }
})
