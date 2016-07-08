// var $ = require('jquery');
// var Firebase = require('firebase');

// var assignedHistory = require('../js/myapp.js').assignedHistory;
// var members = require('../js/myapp.js').members;
// var messages = require('../js/myapp.js').messages;
var app = angular.module('thing', ['firebase', 'ui.router']);
// Eventually need to refactor so that there's only one angular.module.
var assignapp = angular.module('shazzam', ['firebase']);


var member;
var messageID;
var threadID;
var readMessages;
// var messages = firebase.database().ref('/messages');
var messages = require('../js/myapp.js').messages;
// var members = firebase.database().ref('/members');
var members = require('../js/myapp.js').members;
var assignments = require('../js/myapp.js').assignments;
// var Firebase = require('../js/myapp.js').Firebase;


assignapp.controller('AssignCtrl', function($scope, $firebaseArray) {
    console.log("inside assignapp.js AssignCtrl");

    var assignedThreads;

    // This came from taskhistory.js.
    function assignment(assigner, assignee) {
        return {
            person: assigner,
            action: "assigned to " + assignee,
            assignee: assignee,
            date: firebase.database.ServerValue.TIMESTAMP
        }
    }




    console.log("before runtime sendMessage");
    // Call gapi in background script to sync common messageIDs with their respective Gmail threadIDs, which are different for each user.
    // Receives [{messageID: threadID}, ...].
            
    chrome.runtime.sendMessage({
        type: 'sync'
    },
        function(gapiResponse) {

            console.log("app.js sync gapiResponse: ", gapiResponse);

        // Get all messageIDs (messages get added to Firebase when they're read).
        messages.once('value', function(snapshot) {
            readMessages = snapshot.val();
        });

    }) // closes sendMessage





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

            $scope.members.push(item.name);
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
        messages.child(messageID).child('activity').push(assignment(member, assignee));
        members.child(assignee).push({ action: 'was assigned by' + member, threadId: threadID, date: firebase.database.ServerValue.TIMESTAMP });

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
            console.log("background response: ", gapiResponse);
        });

        // if (!readMessages[messageID].gmailThreadIDs) readMessages[messageID].gmailThreadIDs = {};
        // readMessages[messageID]["gmailThreadIDs"][member] = threadID;

        // // Saves updates.
        // messages.update(readMessages);

        // replaces above

        messages.child(messageID).child('gmailThreadIDs').push({ member: member, threadId: threadID });



    }
}); // end of controller
