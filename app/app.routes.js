/** 
 * router
 */
(function() {
  'use strict';
  angular.module('govtID').config(configDef);

  configDef.$inject = ['$stateProvider','$urlRouterProvider'];
  function configDef($stateProvider, $urlRouterProvider) {
  	$urlRouterProvider.otherwise('/main');
	$stateProvider.state('main', {
			url : "/main",
			templateUrl : "html/main.html",
			controller : "mainController",
			controllerAs : 'mainCtrl',
			title: "Main Page"
	  }).state('imageUpload', {
			url : "/imageUpload",
			templateUrl : "html/imageUpload.html",
			controller : "mainController",
			controllerAs : 'mainCtrl',
			title: "Image Upload"
	 }).state('imageProperties', {
			url : "/imageProperties",
			templateUrl : "html/imageProperties.html",
			controller : "mainController",
			controllerAs : 'mainCtrl',
			title: "Image Properties"
	 }).state('secureSubmission', {
			url : "/secureSubmission",
			templateUrl : "html/secureSubmission.html",
			controller : "mainController",
			controllerAs : 'mainCtrl',
			title: "Secure Submission"
	 }).state('scanningSubmission', {
			url : "/scanningSubmission",
			templateUrl : "html/scanningSubmission.html",
			controller : "mainController",
			controllerAs : 'mainCtrl',
			title: "Scanning Submission"
	 }).state('finishingSubmission', {
			url : "/finishingSubmission",
			templateUrl : "html/finishingSubmission.html",
			controller : "mainController",
			controllerAs : 'mainCtrl',
			title: "Finishing Submission"
	 }).state('successSubmission', {
			url : "/successSubmission",
			templateUrl : "html/success.html",
			controller : "mainController",
			controllerAs : 'mainCtrl',
			title: "Success Submission"
	 }).state('failureSubmission', {
			url : "/failureSubmission",
			templateUrl : "html/fail.html",
			controller : "mainController",
			controllerAs : 'mainCtrl',
			title: "Failure Submission"
	 });
	}
	    
})();

