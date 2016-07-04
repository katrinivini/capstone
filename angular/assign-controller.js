var assignapp = require('./app.js').assignapp;
var $ = require('jquery');
var Firebase = require('firebase');

var assignedHistory = require('../js/myapp.js').assignedHistory;
var members = require('../js/myapp.js').members;
var messages = require('../js/myapp.js').messages;
assignapp.controller('AssignCtrl', function($scope, $firebaseArray) {
    console.log("inside assignapp.js AssignCtrl");

    var member;
    var messageID;
    var threadID;
    var readMessages;
    var assignedHist;
    // var messages = firebase.database().ref('/messages');
    // var members = firebase.database().ref('/members');
    // var assignedHistory = firebase.database().ref('/assigned');
    // This came from taskhistory.js.
    function eventObj(p, a) {
        return {
            person: p,
            action: a,
            date: Firebase.database.ServerValue.TIMESTAMP,
            threadId: threadID
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
                            // messages.once('value', function(snapshot) {
                            //     readMessages = snapshot.val();
                            // });
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
    var assignee;
    // Adds assignment activity to Firebase.
    // DOM updates via whatever's in taskhistory.js.
    $scope.submitAssignment = function() {
        messages.once('value', function(snapshot) {
                readMessages = snapshot.val();
            })
            .then(function() {
                // Gets radio input value. Used jquery because I gave up on Angular.
                // Although you need ng-value (not just value) in the template for this to work. Life's a mystery.
                assignee = $('input[name=radioMember]:checked', '#assignForm').val();

                // Adds assignment to Firebase.
                readMessages[messageID].activity.push(eventObj(member, "assigned to " + assignee));
                readMessages[messageID].people.push({ person: member, status: "assigned" });

                // Saves updates.
                return messages.child(messageID).child('activity').update(readMessages[messageID].activity);
            })
            .then(function() {
                //this is getting the assigned history so that they can appear as labels on the thread row
                assignedHistory.once('value', function(snapshot) {
                        assignedHist = snapshot.val();
                    })
                    .then(function() {
                        if (!assignedHist) assignedHist = [];
                        var newassign = { signer: member, assignee: assignee, threadId: threadID };
                        if (assignedHist.includes(newassign)) return;
                        var thread = assignedHist.filter(function(a) {
                            return a.threadId === threadID;
                        })
                        if (!thread.length) assignedHist.push(newassign);
                        else assignedHist[assignedHist.indexOf(thread[0])] = newassign;
                        assignedHistory.update(assignedHist);
                    })
            })
    }
}); // end of controller
