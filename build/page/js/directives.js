var directives = {};
app.directive(directives);
directives.topbar = function() {
	"ngInject";
	return {
		restrict: 'E',
		scope: {},
		controller: function($scope) {
		},
		templateUrl: '/html/topbar.html'
	};
};
directives.slideshow = function() {
	"ngInject";
	return {
		restrict: 'E',
		scope: {},
		controller: function($scope) {
		},
		templateUrl: '/page/slideshow.html'
	};
};
directives.footer = function() {
	"ngInject";
	return {
		restrict: 'E',
		scope: {},
		controller: function($scope) {
		},
		templateUrl: '/page/footer.html'
	};
};