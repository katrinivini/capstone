var app = angular.module('app', ['firebase']);

console.log("hello from outside app.js controller");

app.controller('DashboardCtrl', function($scope) {
	console.log("hello from inside app.js");
});