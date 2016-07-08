// // content script: asking background to make gapi calls

// console.log("***** inside content script: mysync.js *****");

// var member;
// var messageID;
// var threadID;
// var readMessages;
// var assignedThreads;
// var messages = firebase.database().ref('/messages');
// var members = firebase.database().ref('/members');


// // This came from taskhistory.js.
// function assignment(assigner, assignee) {
//     return {
//         person: assigner,
//         action: "assigned to " + assignee,
//         assignee: assignee,
//         date: firebase.database.ServerValue.TIMESTAMP
//     }
// }


// // Makes Assign button that shows modal on click.
// InboxSDK.load('1.0', 'sdk_CapstoneIDK_aa9966850e').then(function(sdk) {

//     // Call gapi in background script to sync common messageIDs with their respective Gmail threadIDs, which are different for each user.
//     // Receives [{messageID: threadID}, ...].
//     chrome.runtime.sendMessage({
//             type: 'sync',
//         }, function(gapiResponse) {

//             // Get all messageIDs (messages get added to Firebase when they're read).
//             messages.once('value', function(snapshot) {
//                 readMessages = snapshot.val();
//             });



//         }) // closes sendMessage





// });




// // Add members from Firebase to Angular scope.
// // $loaded is a Firebase thing.
// $scope.members = [];
// var membersArray = $firebaseArray(members);
// membersArray.$loaded().then(function(data) {
//     angular.forEach(membersArray, function(item) {
//         $scope.members.push(item.$value);
//     })
// });

// // Adds assignment activity to Firebase.
// messages.child(messageID).child('activity').push(assignment(member, assignee));
// messages.child(messageID).child('people').push({ person: member, status: "assigned" });

// if (!readMessages[messageID].gmailThreadIDs) readMessages[messageID].gmailThreadIDs = {};
// readMessages[messageID]["gmailThreadIDs"][member] = threadID;

// // Saves updates.
// messages.update(readMessages);
