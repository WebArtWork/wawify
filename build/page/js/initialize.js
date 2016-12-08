var app = angular.module('public',['ui.router','pascalprecht.translate']);
app.config(function($stateProvider, $urlRouterProvider, $locationProvider) {
	"ngInject";
	$urlRouterProvider.otherwise('/');
	$stateProvider.state('Landing', {
		url: '/',
		controller: "Landing",
		templateUrl: "/public/page/Landing.html"
	}).state('Collections', {
		url: "/Collections",
		controller: "Collections",
		templateUrl: "/public/page/Collections.html"
	}).state('Products', {
		url: "/Products",
		controller: "Products",
		templateUrl: "/public/page/Products.html"
	}).state('AboutUs', {
		url: "/AboutUs",
		controller: "AboutUs",
		templateUrl: "/public/page/AboutUs.html"
	});
	$locationProvider.html5Mode(true);
}).config(function ($translateProvider) {
	"ngInject";
	$translateProvider.translations('en', englishPack);
	$translateProvider.translations('ua', ukrainianPack);
	$translateProvider.translations('rus', russianPack);
	$translateProvider.preferredLanguage('en');
	$translateProvider.useSanitizeValueStrategy('sanitizeParameters');
});
