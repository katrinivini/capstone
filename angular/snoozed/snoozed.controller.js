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
    $scope.snoozedemails = [];
    // $scope.hello = 'kathy';
    console.log('index: ', index);
    members.child(index).child('activity').once('value', function(snapshot) {
        var userHistory = snapshot.val();
        console.log('members once for activity history', userHistory);
        for (var id in userHistory) {
            if (userHistory.hasOwnProperty(id) && userHistory[id].action === 'snoozed') {
            	console.log('get into this if statement for user history');
                snoozedemails.push({databaseId: id , userHistory: userHistory[id]});
            }
        }
        console.log('snoozedemails: ', snoozedemails);
        snoozedemails.forEach(function(snoozedemail) {
            chrome.runtime.sendMessage({
                type: 'fetch email',
                threadId: snoozedemail.userHistory.threadId
            }, function(emailBody) {
            	console.log('hmmmm, does the email body get here', emailBody);
                $scope.snoozedemails.push({ databaseId: snoozedemail.databaseId, threadId: snoozedemail.threadId, body: emailBody.snippet, date: new Date(snoozedemail.userHistory.date) });
                console.log('this is a snoozed email: ', emailBody);
                console.log('$scope.snoozedEmails: ', $scope.snoozedemails);
                $scope.$digest();
            })
        })

    })

    $scope.removeSnooze = function(databaseId){
    	//have to delete thing from database, then call scope.digest
    	console.log('removing snooze');
    	members.child(index).child('activity').child(databaseId).remove();
    	console.log(members.child(index).child('activity').child(databaseId).remove())
    	.then(function(){
    		$scope.digest();
    	})
    	// $scope.$digest();
    	// members.child(index).child('activity').once('child_removed', function(){
    	// 	console.log('members child activity once child removed');
    	// 	$scope.$digest();
    	// })
    }

});
