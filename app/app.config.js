(function() {

    'use strict';
    angular.module('govtID').config(['$translateProvider', '$translateUrlLoaderProvider', '$httpProvider',
        function($translateProvider, $translateUrlLoaderProvider, $httpProvider) {

        }
    ])
        .run(sandboxRun);


    sandboxRun.$inject = ['$rootScope', '$state'];

    function sandboxRun($rootScope, $state) {
        $rootScope.$state = $state;
        $rootScope.showCountries = true;
        $rootScope.showLanguages = true;
        $rootScope.showSearch = false;
        $rootScope.showSignin = true;
    };
})();