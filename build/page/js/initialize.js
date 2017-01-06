var app = angular.module('public',['ui.router','pascalprecht.translate']);
app.config(function($stateProvider, $urlRouterProvider, $locationProvider) {
	"ngInject";
	$urlRouterProvider.otherwise('/');
	$stateProvider.state('Landing', {
		url: '/',
		controller: "Landing",
		templateUrl: "/page/Landing.html"
	}).state('Collections', {
		url: "/Collections",
		controller: "Collections",
		templateUrl: "/page/Collections.html"
	}).state('Products', {
		url: "/Products",
		controller: "Products",
		templateUrl: "/page/Products.html"
	}).state('Product', {
		url: "/Product",
		controller: "Products",
		templateUrl: "/page/Product.html"
	}).state('AboutUs', {
		url: "/AboutUs",
		controller: "AboutUs",
		templateUrl: "/page/AboutUs.html"
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
