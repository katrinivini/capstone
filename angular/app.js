// var $ = require('jquery');
var app = angular.module('thing', ['firebase', 'ui.router']);

var insert = '';
// var el = document.createElement("div");
fetch(chrome.extension.getURL('/templates/dashboard-home.html'))
.then(function(response){
	return response.text();
})
.then(function(html){
	console.log('here is the html', html)
	insert = html; 
	// el.innerHTML = html;
	// console.log('what is el now', el);

})

app.config(function($urlRouterProvider, $locationProvider, $stateProvider){
// 	// This turns off hashbang urls (/#about) and changes it to something normal (/about)
	// $locationProvider.html5Mode(true);
// 	// If we go to a URL that ui-router doesn't have registered, go to the "/" url.
	// $urlRouterProvider.otherwise('/userpanel');

	$urlRouterProvider.when('/thing', '/userpanel');

	$stateProvider.state('userpanel', {
		url: '/userpanel', 
		template: '<h1>NOWORKNOWORKNOWORK</h1>', 
		// template: 'insert', 
		controller: 'DashboardCtrl'
	})

	$stateProvider.state('dashboard', {
		url: '/dashboard',
		// templateUrl: 'chrome-extension://nnbcemhofefipmhikmmkofondhdbjlje/templates/dashboard-home.html'
		template: '<h1>WORK WORK WORK WORK WORK</h1>', 
		controller: 'TestCtrl'
	})

})

app.controller('DashboardCtrl', function($scope, $firebaseArray, $state) {
	$scope.current = $state.current; 
	console.log('current state in ctrl', $scope.current)
	var ref = firebase.database().ref('/templates');
	$scope.templates = $firebaseArray(ref);
	
});
app.controller('TestCtrl', function($scope, $firebaseArray, $state) {
	$scope.current = $state.current; 
	console.log('current state in ctrl', $scope.current)
	
});