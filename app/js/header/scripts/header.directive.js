'use strict';

angular.module('govtID')
	.directive('capitaloneheader', function () {
		var directive = {};

        directive.restrict = 'E';
        directive.templateUrl = "html/header-full.html";
		directive.controller = "headerController";

		return directive;
    });