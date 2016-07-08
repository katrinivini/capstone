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
		console.log('what is this template', template)
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
		// arr.$add({})
		// .then(function(ref) {
		// 	var id = ref.key();
		// 	console.log("added record with id " + id);
		// 	arr.$indexFor(id); // returns location in the array
		// });
		var id = $scope.template.id;
		var itemindex = arr.$indexFor(id);
		var item = $scope.templates[itemindex];
		item.title = template.title;
		item.body = updatedtemplate.body;
		console.log('before', $scope.templates)
		$scope.templates[itemindex] = item;
		// update database here
		console.log('after', $scope.templates)
	}

	$scope.goToEditState = function(){
		$scope.copyTemplate = {};
		$scope.copyTemplate["body"] = $scope.thetemplate.body;
		$scope.copyTemplate["title"] = $scope.thetemplate.title;
		$state.go('emailtemplates.edit');
		console.log("shalom", $scope.copyTemplate)
	}

	$scope.showTemplate = function(template){
		$scope.thetemplate = template;
		$scope.template = template;
		$state.go('emailtemplates.preview')
	}

	$scope.discardTemplate = function(){
		console.log("bonjour", $scope.copyTemplate)
		console.log("au revoir", $scope.template)
		$scope.template.body = $scope.copyTemplate.body;
		$scope.template.title = $scope.copyTemplate.title;
		$state.go('emailtemplates.preview');
	}
	
});