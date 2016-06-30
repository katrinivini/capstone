// var $ = require('jquery');
var app = angular.module('thing', ['firebase', 'ui.router']);

app.controller('DashboardCtrl', function($scope) {
	$scope.kathy = "kathy yay";
	console.log("hello from inside app.js DashboardCtrl");
});

var assignapp = angular.module('shazzam', ['firebase']);
console.log("hello from outside app.js AssignCtrl");

assignapp.controller('AssignCtrl', function($scope, $firebaseArray) {
	console.log("hello from inside assignapp.js AssignCtrl");

	var ref = firebase.database().ref('/members'); 
	// $scope.members = ['Belinda', 'Katrina', 'Rina', 'Kathy'];
	$scope.members = $firebaseArray(ref);
	console.log("$scope.members: ", $scope.members);
	console.log("$scope.members length: ", $scope.members.length);
	$scope.assignsubmit = function() {
		console.log("you assignsubmitted something but not really");
	}
});

// var insert = '';
// // var el = document.createElement("div");
// fetch(chrome.extension.getURL('/templates/dashboard-home.html'))
// .then(function(response){
// 	return response.text();
// })
// .then(function(html){
// 	console.log('here is the html', html)
// 	insert = html; 
// 	// el.innerHTML = html;
// 	// console.log('what is el now', el);

// })

app.config(function($urlRouterProvider, $locationProvider, $stateProvider){
// 	// This turns off hashbang urls (/#about) and changes it to something normal (/about)
	// $locationProvider.html5Mode(true);
// 	// If we go to a URL that ui-router doesn't have registered, go to the "/" url.
	// $urlRouterProvider.otherwise('/userpanel');

	// $urlRouterProvider.when('/thing', '/userpanel');

	$stateProvider.state('userpanel', {
		url: '/userpanel', 
		controller: 'UserPanelCtrl'
	})

	$stateProvider.state('dashboard', {
		url: '/dashboard',
		controller: 'DashboardCtrl'
	})

	$stateProvider.state('shared-labels', {
		url: '/shared-labels',
		controller: 'LabelsCtrl'
	})

	$stateProvider.state('shared-contacts', {
		url: '/shared-contacts',
		controller: 'ContactsCtrl'
	})

	$stateProvider.state('email-templates', {
		url: '/email-templates',
		controller: 'TemplatesCtrl'
	})

	$stateProvider.state('email-templates.create', {
		url: '/create',
		controller: 'TemplatesCtrl'
	})

	$stateProvider.state('settings', {
		url: '/settings',
		controller: 'SettingsCtrl'
	})

})

app.controller('UserPanelCtrl', function($scope, $firebaseArray, $state) {
	
});

app.controller('DashboardCtrl', function($scope, $firebaseArray, $state) {
	
});

app.controller('LabelsCtrl', function($scope, $firebaseArray, $state) {
	
});

app.controller('ContactsCtrl', function($scope, $firebaseArray, $state) {
	
});

app.controller('TemplatesCtrl', function($scope, $firebaseArray, $state) {
	
});

app.controller('SettingsCtrl', function($scope, $firebaseArray, $state) {
	
});