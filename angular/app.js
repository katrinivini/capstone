var $ = require('jquery');
var Firebase = require('firebase');


var app = angular.module('thing', ['firebase', 'ui.router']);

app.controller('DashboardCtrl', function($scope) {
	$scope.kathy = "kathy yay";
	console.log("hello from inside app.js DashboardCtrl");
});




var assignapp = angular.module('shazzam', ['firebase']);

assignapp.controller('AssignCtrl', function($scope, $firebaseArray) {
	console.log("inside assignapp.js AssignCtrl");

	var member;
	var messageID;
	var threadID;
	var readMessages;
	var taskHistory = document.getElementsByClassName('taskHistory')[0];
	var messages = firebase.database().ref('/messages');
	var ref = firebase.database().ref('/members');

	function eventObj(p, a) {
		return {
			person: p,
            action: a,
            date: Firebase.database.ServerValue.TIMESTAMP
        }
    }

    function createActivity(person, action, date) {
        var act = document.createElement('div');
        act.innerHTML = person + " " + action + " " + date;
        taskHistory.appendChild(act);
    }

    console.log("taskHistory: ", taskHistory);


	InboxSDK.load('1.0', 'sdk_CapstoneIDK_aa9966850e').then(function(sdk) {
		member = sdk.User.getAccountSwitcherContactList()[0].name;

		sdk.Conversations.registerThreadViewHandler(function(threadView) {
			threadID = threadView.getThreadID();

			chrome.runtime.sendMessage({
				type: 'read message',
				threadId: threadID
	        }, function(hash) { 
	        	messageID = hash;
	        	console.log("AssignCtrl member name: ", member);
				console.log("AssignCtrl threadID: ", threadID);
				console.log("AssignCtrl messageID: ", messageID);

				messages.once('value', function(snapshot) {
					readMessages = snapshot.val();
		        })
				.then(function() {
			console.log("messageID: ", messageID);
			messages.child(messageID).child('activity').on('child_added', function(snapshot) {
				var task = snapshot.val();
				var date = new Date(task.date);
				createActivity(task.person, task.action, date);
		    });
		})
	        


	        })
	        })

	})






	
	$scope.members = [];
	var arr = $firebaseArray(ref);
	arr.$loaded().then(function(data) {
		angular.forEach(arr, function(item) {
			$scope.members.push(item.$value);
		})
	});



	$scope.member = 'Elmo';

	$scope.assignsubmit = function() {

		console.log("assignee: ", $scope.member);


		readMessages[messageID].activity.push(eventObj(member, "assigned to " + $scope.member));
		readMessages[messageID].people.push({person: member, status: "assigned"});

		messages.update(readMessages);

		console.log("you maybe assignsubmitted something");
	}
});    // end of controller




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