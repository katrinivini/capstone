// var fs = require('fs');

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
            // date: Firebase.database.ServerValue.TIMESTAMP
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




// app.controller('LabelsCtrl', function($scope, $firebaseArray, $state) {
// 	console.log('in the labels controller now', $state.current);

// 	$scope.labels = [];

// 	var ref = firebase.database().ref('/sharedLabels'); 
// 	var arr = $firebaseArray(ref);
// 	arr.$loaded().then(function(data) {
// 		angular.forEach(arr, function(item) {
// 			console.log('what is this item', item)
// 			$scope.labels.push({id: item.$id, name: item.label, sharedWith: item.members});
// 		})
// 		console.log("$scope.labels: ", $scope.labels);
// 	});


// 	$scope.addLabel = function(){
// 		arr.$add({})
// 		.then(function(ref) {
// 		  var id = ref.key();
// 		  console.log("added record with id " + id);
// 		  list.$indexFor(id); // returns location in the array
// 		});
// 	}

// 	$scope.updateLabel = function(id){
// 		arr.$add({})
// 		.then(function(ref) {
// 			var id = ref.key();
// 			console.log("added record with id " + id);
// 			arr.$indexFor(id); // returns location in the array
// 		});
// 	}

// 	$scope.removeLabel = function(id){
// 		// find the item first in the firebase array
// 		var item = "CHANGE THIS PLEASE";
// 		arr.$remove(item)
// 		.then(function(ref) {
// 			console.log('successfully deleted');
// 			ref.key() === item.$id; // true
// 		});
// 	}
// });

// app.controller('TemplatesCtrl', function($scope, $firebaseArray, $state) {
// 	console.log('in the templates controller now', $state.current);
// 	$scope.templates = [];

// 	var ref = firebase.database().ref('/templates'); 

// 	var arr = $firebaseArray(ref);


// 	arr.$loaded().then(function(data) {
// 		angular.forEach(arr, function(item) {
// 			console.log('what is this item', item)
// 			$scope.templates.push({id: item.$id, body: item.body, title: item.title, sharedWith: item.members});
// 		})
// 		console.log("$scope.templates: ", $scope.templates);
// 	});

// 	$scope.addTemplate = function(newtemplate){
// 		arr.$add({ body: newtemplate.body, title: newtemplate.title , sharedWith: ["somebody@gmail.com", "nobody@yahoo.com"] })
// 		.then(function(ref) {
// 		  var id = ref.key();
// 		  console.log("added record with id " + id);
// 		  list.$indexFor(id); // returns location in the array
// 		});
// 	}

// 	$scope.updateTemplate = function(id){
// 		arr.$add({ body: body, title: title, sharedWith: members })
// 		.then(function(ref) {
// 			var id = ref.key();
// 			console.log("added record with id " + id);
// 			arr.$indexFor(id); // returns location in the array
// 		});
// 	}

// 	$scope.removeTemplate = function(id){
// 		// find the item first in the firebase array
// 		var item = "CHANGE THIS PLEASE";
// 		arr.$remove(item)
// 		.then(function(ref) {
// 			console.log('successfully deleted');
// 			ref.key() === item.$id; // true
// 		});
// 	}

// 	$scope.discardTemplate = function(){
// 		// only redirect? and dump the information? 
// 		console.log('discard this template');
// 	}

// });