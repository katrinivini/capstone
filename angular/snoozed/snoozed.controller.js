'use strict';


var email;
var name;
var index;

chrome.runtime.sendMessage({
	type: 'get profile'
}, function(emailAddress){
	email = emailAddress;
})

var members = firebase.database().ref('/members');

members.once('value', function(snapshot){
	var people = Array.prototype.slice.call(snapshot.val());
	people.forEach(function(person, i){
		if (person.email === email) {
			name = person.name;
			index = i;
		}
	})
})



app.controller('SnoozeCtrl', function($scope, $firebase, $firebaseArray, $state) {
	// console.log("hello from inside SnoozeCtrl");
	var userHistory = $firebaseArray(members.child(index));
	userHistory.$loaded().then(function(data){
		angular.forEach(userHistory, function(user) {
			chrome.runtime.sendMessage({
				type: 'fetch email',
				threadId: user.threadId
			}, function(emailBody){
				console.log(emailBody);
				//gives the body of the email, when clicked on takes you to the email in your gmail
			})
		});
	})
	// console.log('user: ', user);

});