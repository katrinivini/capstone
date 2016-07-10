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

app.controller('CompleteCtrl', function($scope, $firebase, $firebaseArray, $state) {
    var completedemails = [];
    $scope.completedemails = [];
    members.child(index).child('activity').once('value', function(snapshot) {
        var userHistory = snapshot.val();
        for (var id in userHistory) {
            if (userHistory.hasOwnProperty(id) && userHistory[id].action === 'completed') {
                completedemails.push({databaseId: id , data: userHistory[id]});
            }
        }
        completedemails.forEach(function(completedemail) {
            chrome.runtime.sendMessage({
                type: 'fetch email',
                threadId: completedemail.data.threadId
            }, function(emailBody) {
                $scope.completedemails.push({ databaseId: completedemail.databaseId, threadId: completedemail.data.threadId, messageId: completedemail.data.messageId, body: truncated(emailBody), date: new Date(completedemail.data.date) });
                $scope.$digest();
            })
        })

    })

    $scope.undo = function(completedemail){
    	//have to delete thing from database, then call $scope.$digest
        var i = $scope.completedemails.indexOf(completedemail);
    	members.child(index).child('activity').child(completedemail.databaseId).remove()
    	.then(function(){
            messages.child(completedemail.messageId).child('activity').push(eventObj(name, 'unmarked this email as complete'));
    		$scope.completedemails = $scope.completedemails.slice(0, i).concat($scope.completedemails.slice(i+1));
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