var app = angular.module('thing', ['firebase', 'ui.router']);

app.config(function($urlRouterProvider, $locationProvider, $stateProvider){
// 	// This turns off hashbang urls (/#about) and changes it to something normal (/about)
	// $locationProvider.html5Mode(true);
// 	// If we go to a URL that ui-router doesn't have registered, go to the "/" url.
	// $urlRouterProvider.otherwise('/user-panel');

	$urlRouterProvider.when('/', '/user-panel');

	$stateProvider.state('user-panel', {
		url: '/user-panel', 
		// templateUrl: '/templates/user-panel.html', 
		controller: 'DashboardCtrl'
	})

	$stateProvider.state('user-panel.dashboard', {
		url: '/dashboard', 
		templateUrl: '/templates/dashboard-home.html', 
		controller: 'DashboardCtrl'
	})

	$stateProvider.state('user-panel.sharedLabels', {
		url: '/sharedLabels', 
		// templateUrl: '/templates/shared-labels.html', 
		controller: 'DashboardCtrl'
	})

	$stateProvider.state('user-panel.sharedContacts', {
		url: '/sharedContacts', 
		// templateUrl: '/templates/shared-contacts.html', 
		controller: 'DashboardCtrl'
	})

	$stateProvider.state('user-panel.emailTemplates', {
		url: '/emailTemplates', 
		// templateUrl: '/templates/email-templates.html', 
		controller: 'DashboardCtrl'
	})

	$stateProvider.state('user-panel.settings', {
		url: '/settings', 
		// templateUrl: '/templates/settings.html', 
		controller: 'DashboardCtrl'
	})
})

app.controller('DashboardCtrl', function($scope, $firebaseArray, $state) {
	$scope.current = $state.current; 
	console.log('current state in ctrl', $scope.current)
	var ref = firebase.database().ref('/templates');
	$scope.templates = $firebaseArray(ref);
	
});