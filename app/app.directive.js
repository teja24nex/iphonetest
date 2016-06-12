
angular
	.module('govtID').directive("usaFooter", [function(){	
	 return {	
		  templateUrl: 'html/usa-footer.html',
		  controller:"footerController"
	  };
}]).directive('capitaloneheader', function () {
	return {
		templateUrl: 'html/header-full.html',
		  controller:"headerController"
	};
		
    });


angular
	.module('govtID').directive('fileModel', ['$parse', function ($parse) {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            var model = $parse(attrs.fileModel);
            var modelSetter = model.assign;
            
            element.bind('change', function(){
                scope.$apply(function(){
                    modelSetter(scope, element[0].files[0]);
                });
            });
        }
    };
}]);