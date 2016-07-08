'use strict';

app.controller('LabelsCtrl', function($scope, $firebase, $firebaseArray, $state) {

	$scope.labels = [];

	//fetch shared labels from firebase
	var ref = firebase.database().ref('/sharedLabels'); 
	var arr = $firebaseArray(ref);
	arr.$loaded().then(function(data) {
		angular.forEach(arr, function(item) {
			var temp = []; 
				// console.log(item.members)
				for (var i = 0; i < item.members.length; i++) {
					temp.push(item.members[i].email);
				}
				var members = temp.join(', ')
			$scope.labels.push({id: item.$id, name: item.label, sharedWith: members});
		})
	});

	$scope.users = [];

	//fetch members from firebase
	var foo = firebase.database().ref('/members'); 
	var mem = $firebaseArray(foo);
	mem.$loaded().then(function(data) {
		angular.forEach(mem, function(thing) {
			$scope.users.push({id: thing.$id, name: thing.name, email: thing.email});
			// console.log('here are the users', $scope.users);
		})
	});

	//set up the newLabel object because for some reason if you don't provide an empty array for members, it will break 
	$scope.newLabel = {label: "", members: []};

	$scope.addLabel = function(label){
		console.log('label here', label.members)
		var name = label.label;
		var members = label.members;
		arr.$add({
			label: name,
			members: members, 
		})
		.then(function(ref) {
			// console.log('here is ref', ref);
			var id = ref.key;
			console.log("added record with id " + id);
			// console.log("location in array", arr.$indexFor(id)); // returns location in the array
			addLabel(name);
			$state.go('sharedlabels')
		});
	}

    // Make gapi call to create new label in Gmail.
    function addLabel(name){
	    chrome.runtime.sendMessage({
	        type: 'create sharedLabel', 
	        name: name
	    }, function(gapiResponse) {
			console.log('here is the gapiResponse', gapiResponse);
	    });
    }

	$scope.removeLabel = function(id){
		console.log('label id', id);
		var item = arr.$indexFor(id)
		arr.$remove(item)
		.then(function(ref) {
			console.log('successfully deleted', ref);
			ref.key === item.$id; // true
			$scope.labels.splice(item, 1);
		});
	}
	//updateLabel func is not hooked up to anything
	$scope.updateLabel = function(id){
		arr.$add({})
		.then(function(ref) {
			var id = ref.key();
			console.log("added record with id " + id);
			arr.$indexFor(id); // returns location in the array
		});
	}
	
	getLabels();
	$scope.gapiLabels = [];

    // Make gapi call to get list of user's labels.
    function getLabels(){
	    chrome.runtime.sendMessage({
	        type: 'list labels'
	    }, function(gapiResponse) {
	        for(var key in gapiResponse) {
	            // if (gapiResponse[key].indexOf("Label_") === 0) {
	            if (/Label\_/.test(gapiResponse[key])) {
	            	$scope.gapiLabels.push(key);
	            };
	        }
	    });	
    }

});