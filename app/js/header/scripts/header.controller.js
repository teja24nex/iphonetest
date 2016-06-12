/*global angular */

(function () {
	'use strict';

	angular
		.module('govtID').controller('headerController', headerController);

	headerController.$inject = ['$scope', '$rootScope'];

	function headerController($scope, $rootScope) {
		
		// configuration for showing or hiding menu items is in the app.config.js

		$rootScope.showCountriesFlag = false;
		$rootScope.showLanguagesFlag = false;
		$rootScope.cvvModal = false;

		$scope.headerSelection = {
			countries: [
				{
					id: '1',
					name: 'United States',
					abbr_name: 'USA',
					defaultName: 'United States'
				},
				{
					id: '2',
					name: 'Canada',
					abbr_name: 'CA',
					defaultName: 'Canada'
				}
			],
			selectedCountry: {
				id: '1',
				name: 'United States',
				abbr_name: 'USA',
				defaultName: 'United States'
			}, //This sets the default value of the select in the ui
			languagesForUSA: [
				{
					id: '1',
					name: 'English',
					abbr_name: 'en',
					defaultName: 'English'
				},
				{
					id: '2',
					name: 'Español',
					abbr_name: 'es',
					defaultName: 'Español'
				}
			],
			selectedLanguageForUSA: {
				id: '1',
				name: 'English',
				abbr_name: 'en',
				defaultName: 'English'
			},
			languagesForCA: [
				{
					id: '1',
					name: 'English',
					abbr_name: 'en',
					defaultName: 'English'
				},
				{
					id: '2',
					name: 'Français',
					abbr_name: 'fr',
					defaultName: 'Français'
				}
			],
			selectedLanguageForCA: {
				id: '1',
				name: 'English',
				abbr_name: 'en',
				defaultName: 'English'
			}
		};


		$scope.changeCountry = function (country) {

			$scope.headerSelection.selectedCountry = country;

			if (country.abbr_name === 'USA') {
				$scope.updateLanguages('USA', 'English', 'en', '1');
			} else if (country.abbr_name === 'CA') {
				$scope.updateLanguages('CA', 'English', 'en', '1');
			}
			$scope.changeLanguage('en');
		};

		$scope.updateLanguages = function (country_name, lang_name, lang_abbr_name, lang_id, lang_default_name) {
			if (country_name === 'USA') {
				$scope.headerSelection.selectedLanguageForUSA.name = lang_name;
				$scope.headerSelection.selectedLanguageForUSA.abbr_name = lang_abbr_name;
				$scope.headerSelection.selectedLanguageForUSA.id = lang_id;
				$scope.headerSelection.selectedLanguageForUSA.defaultName = lang_default_name;
			} else if (country_name === 'CA') {
				$scope.headerSelection.selectedLanguageForCA.name = lang_name;
				$scope.headerSelection.selectedLanguageForCA.abbr_name = lang_abbr_name;
				$scope.headerSelection.selectedLanguageForCA.id = lang_id;
				$scope.headerSelection.selectedLanguageForCA.defaultName = lang_default_name;
			}
		};

		$scope.changeLanguage = function (lang, prop) {
			$scope.lang = lang;
			$scope.prop = prop;

			if ($scope.lang.name === "Español") {
				$rootScope.cvvModal = true;
			} else {
				$scope.continueLanguageChange();
			}
			
		};


		$scope.continueLanguageChange = function () {
			$rootScope.cvvModal = false;
			var prop = $scope.prop,
				lang = $scope.lang,
				country = null,
				locale = lang + '_' + country;


			if (prop === 'update') {
				$scope.updateLanguages($scope.headerSelection.selectedCountry.abbr_name, lang.name, lang.abbr_name, lang.id, lang.defaultName);
				lang = lang.abbr_name;
			}

			if ($scope.headerSelection.selectedCountry.abbr_name === 'USA') {
				country = 'US';
			} else {
				country = 'CA';
			}

			$rootScope.langSelected = locale;
		};

		$(document).click(function (e) {
			var t = e.target.className;
			if ("hidden-xs" !== t && "dropdown" !== t && t.indexOf("hidden-xs") < 0 && t.indexOf("dropdown") < 0 && t.indexOf("oui-icon-map-pin") < 0 && t.indexOf("oui-icon-globe") < 0) {
				$rootScope.showCountriesFlag = false;
				$rootScope.showLanguagesFlag = false;
				$rootScope.$apply();
			}
		});

		$rootScope.displayCountries = function () {
			$rootScope.showCountriesFlag = !$rootScope.showCountriesFlag;
			$rootScope.showLanguagesFlag = false;
		};

		$rootScope.displayLanguages = function () {
			$rootScope.showLanguagesFlag = !$rootScope.showLanguagesFlag;
			$rootScope.showCountriesFlag = false;
		};

	}
})();