'use strict';

app.controller('LabelsCtrl', function($scope, $firebase, $firebaseArray) {

	$scope.labels = [];

	var ref = firebase.database().ref('/sharedLabels'); 
	var arr = $firebaseArray(ref);
	arr.$loaded().then(function(data) {
		angular.forEach(arr, function(item) {
			var members = item.members.join();
			$scope.labels.push({id: item.$id, name: item.label, sharedWith: members});
		})
	});

	$scope.addLabel = function(label){
		var name = label.label;
		var temp = label.members.split(", ");
		var members = []; 
		temp.forEach(function(item){
			members.push(item.trim());
		})
		arr.$add({
			label: name,
			members: members, 
		})
		.then(function(ref) {
			var id = ref.key;
			console.log("added record with id " + id);
			console.log("location in array", arr.$indexFor(id)); // returns location in the array
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