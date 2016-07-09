'use strict';

var members = firebase.database().ref('/members');
var messages = firebase.database().ref('/messages');
var email;
var name;
var index;

chrome.runtime.sendMessage({
    type: 'get profile'
}, function(emailAddress) {
    members.once('value', function(snapshot) {
        var people = Array.prototype.slice.call(snapshot.val());
        people.forEach(function(person, i) {
            if (person.email === emailAddress) {
                name = person.name;
                index = i;
            }
        })
    })

})







app.controller('SnoozeCtrl', function($scope, $firebase, $firebaseArray, $state) {
    var snoozedemails = [];
    $scope.snoozedemails = [];
    members.child(index).child('activity').once('value', function(snapshot) {
        var userHistory = snapshot.val();
        for (var id in userHistory) {
            if (userHistory.hasOwnProperty(id) && userHistory[id].action === 'snoozed') {
                snoozedemails.push({databaseId: id , data: userHistory[id]});
            }
        }
        snoozedemails.forEach(function(snoozedemail) {
            chrome.runtime.sendMessage({
                type: 'fetch email',
                threadId: snoozedemail.data.threadId
            }, function(emailBody) {
                $scope.snoozedemails.push({ databaseId: snoozedemail.databaseId, threadId: snoozedemail.data.threadId, messageId: snoozedemail.data.messageId, body: truncated(emailBody), date: new Date(snoozedemail.data.date) });
                $scope.$digest();
            })
        })

    })

    $scope.removeSnooze = function(messageID, databaseID){
    	//have to delete thing from database, then call $scope.$digest
    	members.child(index).child('activity').child(databaseID).remove()
    	.then(function(){
            messages.child(messageID).child('activity').push(eventObj(name, 'unsnoozed this email'));
    		$scope.$digest();
    	})
    }

});

function eventObj(p, a, threadID, messageID) {
    return {
        person: p,
        action: a,
        date: firebase.database.ServerValue.TIMESTAMP
    }
}

function truncated (emailBody){
    if (emailBody.snippet.length < 40) return emailBody.snippet;
    else return emailBody.snippet.substring(0,40) + "...";
}