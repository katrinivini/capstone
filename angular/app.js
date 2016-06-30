var app = angular.module('thing', ['firebase', 'ui.router']);

app.config(function($urlRouterProvider, $locationProvider, $stateProvider){

	// This turns off hashbang urls (/#about) and changes it to something normal (/about)
	$locationProvider.html5Mode(true);
	// If we go to a URL that ui-router doesn't have registered, go to the "/" url.
	$urlRouterProvider.otherwise('/');

	$urlRouterProvider.when('/', '/products');

	$stateProvider.state('sharedLabels', {
		url: '/sharedLabels', 
		templateUrl: '/templates/shared-labels.html', 
		controller: 'DashboardCtrl'
	})

	$stateProvider.state('sharedContacts', {
		url: '/sharedContacts', 
		templateUrl: '/templates/shared-contacts.html', 
		controller: 'DashboardCtrl'
	})

	$stateProvider.state('emailTemplates', {
		url: '/emailTemplates', 
		templateUrl: '/templates/email-templates.html', 
		controller: 'DashboardCtrl'
	})

	$stateProvider.state('settings', {
		url: '/settings', 
		templateUrl: '', 
		controller: 'DashboardCtrl'
	})
})

app.controller('DashboardCtrl', function($scope, $firebaseArray) {

	var ref = firebase.database().ref('/templates');
	$scope.templates = $firebaseArray(ref);
	
});