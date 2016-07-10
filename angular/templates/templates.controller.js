'use strict';
// var app = require('../module.js').app;

app.controller('TemplatesCtrl', function($scope, $firebaseArray, $state) {

	$scope.templates = [];
	$scope.copyTemplate = {};

	var ref = firebase.database().ref('/templates'); 
	var arr = $firebaseArray(ref);
	arr.$loaded().then(function(data) {
		angular.forEach(arr, function(item) {
			// console.log('what is this item', item)
			$scope.templates.push({id: item.$id, title: item.title, body: item.body, members: item.members });
		})
	});

	$scope.addTemplate = function(template){
		// console.log('what is this template', template)
		var title = template.title;
		var body = template.body;
		var temp = template.members.split(", ");
		var members = []; 

		temp.forEach(function(item){
			members.push(item.trim());
		})
		arr.$add({
			title: title,
			body: body,
			members: members, 
		})
		.then(function(ref) {
			var id = ref.key;
			console.log("added record with id " + id);
			console.log("location in array", arr.$indexFor(id)); // returns location in the array
			$state.go('emailtemplates.preview')
		});
	}

	$scope.removeTemplate = function(){
		var id = $scope.template.id;
		console.log('label id', id);
		var item = arr.$indexFor(id);
		arr.$remove(item)
		.then(function(ref) {
			console.log('successfully deleted', ref);
			ref.key === item.$id; // true
			$scope.templates.splice(item, 1);
			$state.go($state.current, {}, {reload: true});
		});
	}

	$scope.updateTemplate = function(){
		var id = $scope.template.id;
		var itemindex = arr.$indexFor(id);
		arr[itemindex].body = $scope.template.body;
		arr[itemindex].title = $scope.template.body;
		arr.$save(itemindex)
		.then(function(){
			$state.go('emailtemplates.preview')
		})
	}

	$scope.showTemplate = function(template){
		$scope.thetemplate = template;
		$scope.template = template;
		$state.go('emailtemplates.preview')
	}

	$scope.discardTemplate = function(){
		var id = $scope.template.id;
		var itemindex = arr.$indexFor(id);
		$scope.template.body = arr[itemindex].body;
		$scope.template.title = arr[itemindex].title;
		$state.go('emailtemplates.preview');
	}
	
});