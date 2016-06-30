var app = angular.module('thing', []);
console.log("hello from outside app.js controller");

app.controller('DashboardCtrl', function($scope) {
	$scope.kathy = "kathy yay";
	console.log("hello from inside app.js");
});

var assignapp = angular.module('shazzam', ['firebase']);
console.log("hello from outside assignapp controller");

assignapp.controller('AssignCtrl', function($scope, $firebaseArray) {
	var ref = firebase.database().ref('/members'); 
	console.log("hello from inside assignapp.js AssignCtrl");
	// $scope.members = ['Belinda', 'Katrina', 'Rina', 'Kathy'];
	$scope.members = $firebaseArray(ref);
	console.log("$scope.members: ", $scope.members);
	$scope.assignsubmit = function() {
		console.log("you assignsubmitted something but not really");
	}
	
});