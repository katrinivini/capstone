'use strict';

var members = firebase.database().ref('/members');
var messages = firebase.database().ref('/messages');
var email;
var name;
var index;



app.controller('IndexCtrl', function($scope, $firebaseObject) {
    $scope.member;
    chrome.runtime.sendMessage({
        type: 'get profile'
    }, function(emailAddress) {
        email = emailAddress;
        members.once('value', function(snapshot) {
                var people = Array.prototype.slice.call(snapshot.val());
                people.forEach(function(person, i) {
                    if (person.email === emailAddress) {
                        name = person.name;
                        index = i;
                    }
                })
            })
            .then(function() {
                var member = members.child(index);
                $scope.member = $firebaseObject(member);
                // console.log('member: ', $scope.member);
                $scope.$digest();
            })

    })
})
