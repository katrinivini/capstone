var $ = require('jquery');
var Firebase = require('firebase');


var app = angular.module('thing', ['firebase', 'ui.router']);

app.controller('DashboardCtrl', function($scope) {
	$scope.kathy = "kathy yay";
	console.log("hello from inside app.js DashboardCtrl");
});




// Eventually need to refactor so that there's only one angular.module.
var assignapp = angular.module('shazzam', ['firebase']);

assignapp.controller('AssignCtrl', function($scope, $firebaseArray) {
	console.log("inside assignapp.js AssignCtrl");

	var member;
	var messageID;
	var threadID;
	var readMessages;
	var messages = firebase.database().ref('/messages');
	var members = firebase.database().ref('/members');


	// This came from taskhistory.js.
	function eventObj(p, a) {
		return {
			person: p,
            action: a,
            date: Firebase.database.ServerValue.TIMESTAMP
        }
    }

    // Load InboxSDK.
	InboxSDK.load('1.0', 'sdk_CapstoneIDK_aa9966850e').then(function(sdk) {

		// Get name of user who's viewing thread.
		member = sdk.User.getAccountSwitcherContactList()[0].name;

		// Register ThreadViewHandler to get threadID.
		sdk.Conversations.registerThreadViewHandler(function(threadView) {

			threadID = threadView.getThreadID();

			// Use threadID to call gapi in background script to get messageID.
			// Because messageID can only come from gapi.
			chrome.runtime.sendMessage({
				type: 'read message',
				threadId: threadID    // Watch out. Case-sensitive.
	        }, function(hash) { 
	        	// Hash function in background gets rid of characters Firebase doesn't like.
	        	messageID = hash;

	        	// Get all messageIDs (messages get added to Firebase when they're read).
				messages.once('value', function(snapshot) {
					readMessages = snapshot.val();
		        });

	        })    // closes sendMessage
	    })    // closes registerThreadViewHandler
	})    // closes InboxSDK then



	// Add members from Firebase to Angular scope.
	// $loaded is a Firebase thing.
	$scope.members = [];
	var membersArray = $firebaseArray(members);
	membersArray.$loaded().then(function(data) {
		angular.forEach(membersArray, function(item) {
			$scope.members.push(item.$value);
		})
	});

	// Adds assignment activity to Firebase.
	// DOM updates via whatever's in taskhistory.js.
	$scope.submitAssignment = function() {

		// Gets radio input value. Used jquery because I gave up on Angular.
		// Although you need ng-value (not just value) in the template for this to work. Life's a mystery.
		var assignee = $('input[name=radioMember]:checked', '#assignForm').val();

		// Adds assignment to Firebase.
		readMessages[messageID].activity.push(eventObj(member, "assigned to " + assignee));
		readMessages[messageID].people.push({person: member, status: "assigned"});

		// Saves updates.
		messages.update(readMessages);

	}
});    // end of controller




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