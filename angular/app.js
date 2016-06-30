var app = angular.module('thing', []);
console.log("hello from outside app.js controller");

app.controller('DashboardCtrl', function($scope) {
	$scope.kathy = "kathy yay";
	console.log("hello from inside app.js");
});