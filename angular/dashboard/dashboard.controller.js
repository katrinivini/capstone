'use strict';
// var app = require('../module.js').app;

app.controller('DashboardCtrl', function($scope, $firebase, $firebaseArray, $state) {

	$scope.labels = [];
	// $scope.currstate = $state.current;
	// console.log("the current state is", $state.current)

	var ref = firebase.database().ref('/sharedLabels'); 
	var arr = $firebaseArray(ref);
	arr.$loaded().then(function(data) {
		angular.forEach(arr, function(item) {
			var members = item.members.join();
			$scope.labels.push({id: item.$id, name: item.label, sharedWith: members});
		})
	});

	$scope.templates = [];

	var ref = firebase.database().ref('/templates'); 
	var arr = $firebaseArray(ref);
	arr.$loaded().then(function(data) {
		angular.forEach(arr, function(item) {
			console.log('what is this item', item)
			$scope.templates.push({id: item.$id, title: item.title, body: item.body, members: item.members });
		})
	});


});