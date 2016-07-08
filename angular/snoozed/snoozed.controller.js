'use strict';

var members = firebase.database().ref('/members');

var email;
var name;
var index;

chrome.runtime.sendMessage({
    type: 'get profile'
}, function(emailAddress) {
    // email = emailAddress;
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
    // $scope.snoozedEmails = [];
    // $scope.hello = 'kathy';
    console.log('index: ', index);
    members.child(index).child('activity').once('value', function(snapshot) {
        var userHistory = snapshot.val();
        for (var id in userHistory) {
            if (userHistory[id].action === 'snoozed') {
                snoozedemails.push(userHistory[id]);
            }
        }
        $scope.snoozedemails = [];
        snoozedemails.forEach(function(snoozedemail) {
            chrome.runtime.sendMessage({
                type: 'fetch email',
                threadId: snoozedemail.threadId
            }, function(emailBody) {
                $scope.snoozedemails.push({ threadId: snoozedEmail.threadId, body: emailBody.snippet, date: new Date(snoozedemail.date) });
                console.log('this is a snoozed email: ', emailBody);
                console.log('$scope.snoozedEmails: ', $scope.snoozedemails);
                $scope.$digest();
            })
        })

    })

    $scope.removeSnooze = function(threadId){
    	//have to delete thing from database, then call scope.digest
    }

});
