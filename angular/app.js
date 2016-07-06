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
    var assignedThreads;
    var assignments = firebase.database().ref('/assignments');
    var messages = firebase.database().ref('/messages');
    var members = firebase.database().ref('/members');


    // This came from taskhistory.js.
    function assignment(assigner, assignee) {
        return {
            person: assigner,
            action: "assigned to " + assignee,
            assignee: assignee,
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
                            threadId: threadID // Watch out. Case-sensitive.
                        }, function(hash) {
                            // Hash function in background gets rid of characters Firebase doesn't like.
                            messageID = hash;

                            // Get all messageIDs (messages get added to Firebase when they're read).
                            messages.once('value', function(snapshot) {
                                readMessages = snapshot.val();
                            });



                        }) // closes sendMessage
                }) // closes registerThreadViewHandler
        }) // closes InboxSDK then


	


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

        var labelID;

        // Gets radio input value. Used jquery because I gave up on Angular.
        // Although you need ng-value (not just value) in the template for this to work. Life's a mystery.
        var assignee = $('input[name=radioMember]:checked', '#assignForm').val();

        switch (assignee) {
            case "b.emma.lai@gmail.com":
                labelID = "Label_16";
                break;
            case "emailkathy@gmail.com":
                labelID = "Label_17";
                break;
            case "rina.krevat@gmail.com":
                labelID = "Label_18";
                break;
            case "katrinamvelez@gmail.com":
                labelID = "Label_19";
                break;
        }

        // Adds assignment to Firebase.
        readMessages[messageID].activity.push(assignment(member, assignee));
        readMessages[messageID].people.push({ person: member, status: "assigned" });


        // Make gapi call to add label.
        chrome.runtime.sendMessage({
            type: 'add label',
            threadId: threadID,
            labelsToAdd: [labelID],
            labelsToRemove: []
        }, function(gapiResponse) {

        	
            
            console.log("background response to add label: ", gapiResponse);
        });

        // Make gapi call to get list of user's labels.
        chrome.runtime.sendMessage({
            type: 'list labels'
        }, function(gapiResponse) {
            console.log("background response to list labels (labelDictionary): ", gapiResponse);
        });


        if (!readMessages[messageID].gmailThreadIDs) readMessages[messageID].gmailThreadIDs = {};
        readMessages[messageID]["gmailThreadIDs"][member] = threadID;



        // Saves updates.
        messages.update(readMessages);






    }
}); // end of controller




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

app.config(function($urlRouterProvider, $locationProvider, $stateProvider) {
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
