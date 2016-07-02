var app = angular.module('thing', ['firebase', 'ui.router']);

var assignapp = angular.module('shazzam', ['firebase']);
console.log("hello from outside app.js AssignCtrl");

assignapp.controller('AssignCtrl', function($scope, $firebaseArray) {
	console.log("hello from inside assignapp.js AssignCtrl");
	var membersArray;
	$scope.members = [];

	var ref = firebase.database().ref('/members'); 
	// $scope.members = ['Belinda', 'Katrina', 'Rina', 'Kathy'];
	var arr = $firebaseArray(ref);
	arr.$loaded().then(function(data) {
		console.log("data from $loaded(): ", data);
		angular.forEach(arr, function(item) {
			$scope.members.push(item.$value);
		})
		console.log("$scope.members: ", $scope.members);
	});
	
	
	$scope.assignsubmit = function() {
		console.log("you assignsubmitted something but not really");
	}
});

// use to fetch html templates???? 
// // var el = document.createElement("div");
// fetch(chrome.extension.getURL('/templates/dashboard-home.html'))
// .then(function(response){
// 	return response.text();
// })
// .then(function(html){
// 	insert = html; 
// 	// el.innerHTML = html;
// })

app.config(function($urlRouterProvider, $locationProvider, $stateProvider){
// 	// This turns off hashbang urls (/#about) and changes it to something normal (/about)
	// $locationProvider.html5Mode(true);
// 	// If we go to a URL that ui-router doesn't have registered, go to the "/" url.
	// $urlRouterProvider.otherwise('/userpanel');
	$urlRouterProvider.when('/userpanel', '/dashboard');

	$stateProvider.state('userpanel', {
		url: '/userpanel', 
		controller: 'UserPanelCtrl'
	})

	$stateProvider.state('dashboard', {
		url: '/dashboard',
		controller: 'DashboardCtrl'
	})

	$stateProvider.state('sharedlabels', {
		url: '/shared-labels',
		controller: 'LabelsCtrl'
	})

	$stateProvider.state('sharedlabels.create', {
		url: '/create',
		controller: 'LabelsCtrl'
	})

	$stateProvider.state('emailtemplates', {
		url: '/email-templates',
		controller: 'TemplatesCtrl'
	})

	$stateProvider.state('emailtemplates.create', {
		url: '/create',
		controller: 'TemplatesCtrl'
	})
	$stateProvider.state('emailtemplates.edit', {
		url: '/edit',
		controller: 'TemplatesCtrl'
	})

	$stateProvider.state('snoozed', {
		url: '/snoozed',
		controller: 'SnoozeCtrl'
	})

})

app.controller('UserPanelCtrl', function($scope, $firebaseArray, $state) {
	
});

app.controller('DashboardCtrl', function($scope, $firebaseArray, $state) {
	
});

app.controller('LabelsCtrl', function($scope, $firebaseArray, $state) {
	
});

app.controller('TemplatesCtrl', function($scope, $firebaseArray, $state) {
	console.log('in the templates controller now', $state.current);
	$scope.templates = [];

	var ref = firebase.database().ref('/templates'); 
	var arr = $firebaseArray(ref);
	arr.$loaded().then(function(data) {
		angular.forEach(arr, function(item) {
			// console.log('what is this item', item)
			$scope.templates.push({id: item.$id, body: item.body, title: item.title, sharedWith: item.members});
		})
		console.log("$scope.templates: ", $scope.templates);
	});

	$scope.saveTemplate = function(){
		
	}






});