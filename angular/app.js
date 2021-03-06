// This content script is sending messages to the background script sync.js.


var app = angular.module('thing', ['firebase', 'ui.router']);
// Eventually need to refactor so that there's only one angular.module.
var assignapp = angular.module('shazzam', ['firebase']);
var modalAssignView;
// brfs fs, not Node fs. Need to npm install brfs.
var fs = require('fs');
// Need path because brfs fs works at runtime, so it only understands statically analyzable paths (no variables or relative paths).
var path = require('path');

var parser = new DOMParser();


// Gets html as string.
var html = fs.readFileSync(path.resolve(__dirname + '/../templates/assign-button.html'), 'utf8');

// Parses string into full html doc (with html & body tags).
html = parser.parseFromString(html, 'text/html');

// Gets only the html part (assign div) we need for the toolbar button modal InboxSDK makes because the modal won't render the full html doc.
var el = html.getElementsByClassName('assign')[0];

// Hooks up Angular with html. AssignCtrl is in app.js.
angular.element(document).ready(function() {
    angular.bootstrap(html, ['shazzam'])
});

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
var $ = require('jquery');



assignapp.controller('AssignCtrl', function($scope, $firebaseArray) {

    // Call gapi in background script to sync common messageIDs with their respective Gmail threadIDs, which are different for each user.
    // Receives [{messageID: threadID}, ...].
    chrome.runtime.sendMessage({
        type: 'sync'
        },
        function(gapiResponse) {

            console.log("gapiResponse to sync sendMessage: ", gapiResponse);

    }); // closes sendMessage


    // Load InboxSDK.
    InboxSDK.load('1.0', 'sdk_CapstoneIDK_aa9966850e').then(function(sdk) {

        // Get name of user who's viewing thread.
        member = sdk.User.getAccountSwitcherContactList()[0].name;

        // Refreshes Inbox whenever navigating to Inbox view.
        // So that assignment labels show up right after returning to Inbox.
        // Otherwise you have to wait a while or press the refresh button.
        var route = sdk.Router.NativeListRouteIDs.INBOX;
        sdk.Router.handleListRoute(route, function(inboxView) {
            inboxView.refresh();
        });

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

            }); // closes sendMessage
        }); // closes registerThreadViewHandler

        sdk.Toolbars.registerToolbarButtonForThreadView({
            title: 'Assign',
            iconUrl: 'https://cdn3.iconfinder.com/data/icons/box-and-shipping-supplies-icons/447/Clipboard_With_Pencil-512.png',
            section: 'METADATA_STATE',
            hasDropdown: false,
            onClick: function(event) {
                modalAssignView = sdk.Widgets.showModalView({
                    title: '',
                    el: el
                });
            }
        });  // closes registerToolbarButtonForThreadView
    }) // closes InboxSDK then

    // Add members from Firebase to Angular scope.
    // $loaded is a Firebase thing.
    $scope.members = [];
    var membersArray = $firebaseArray(members);
    membersArray.$loaded().then(function(data) {
        angular.forEach(membersArray, function(item) {
            $scope.members.push(item.name);
        });
    });

    // Adds assignment activity to Firebase.
    // DOM updates via whatever's in taskhistory.js.
    $scope.submitAssignment = function() {

        var labelID;

        // Gets radio input value. Used jquery because I gave up on Angular.
        // Although you need ng-value (not just value) in the template for this to work. Life's a mystery.
        var assignee = $('input[name=radioMember]:checked', '#assignForm').val();

        // This is modified from taskhistory.js.
        function assignment(assigner, assignee) {
            return {
                person: assigner,
                action: "assigned to " + assignee,
                assignee: assignee,
                date: firebase.database.ServerValue.TIMESTAMP
            }
        }

        // Adds assignment to Firebase.
        console.log('assignee: ', assignee);
        console.log('member: ', member);
        messages.child(messageID).child('activity').push(assignment(member, assignee));

        // Closes modal. Unclear where modalAssignView comes from.
        modalAssignView.close();

        // Makes gapi call to add label upon assignment.
        chrome.runtime.sendMessage({
            type: 'add assign label',
            threadId: threadID,
            assignee: assignee,
            labelsToRemove: []
        }, function(gapiResponse) {

            console.log("gapiResponse to add assign label: ", gapiResponse);

            // Unclear if this is necessary.
            // Trying to ask background sync.js to listen for assignments and trigger add label gapi calls.
            chrome.runtime.sendMessage({
                type: 'sync assignment label'
            }, function(response) {
                console.log("response from sync assignment label sendMessage: ", response);
            });

        });

    }  // closes $scope.submitAssignment
}); // closes assignapp.controller