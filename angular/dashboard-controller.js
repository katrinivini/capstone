var app = require('./app.js').app;
var $ = require('jquery');
var Firebase = require('firebase');

var assignedHistory = require('../js/myapp.js').assignedHistory;
var members = require('../js/myapp.js').members;
var messages = require('../js/myapp.js').messages;
app.controller('DashboardCtrl', function($scope) {
    $scope.kathy = "kathy yay";
    console.log("hello from inside app.js DashboardCtrl");
});

app.config(function($urlRouterProvider, $locationProvider, $stateProvider) {
    // 	// This turns off hashbang urls (/#about) and changes it to something normal (/about)
    // $locationProvider.html5Mode(true);
    // 	// If we go to a URL that ui-router doesn't have registered, go to the "/" url.
    // $urlRouterProvider.otherwise('/userpanel');

    // $urlRouterProvider.when('/thing', '/userpanel');

    $stateProvider.state('userpanel', {
        url: '/userpanel',
        controller: 'UserPanelCtrl'
    })

    $stateProvider.state('dashboard', {
        url: '/dashboard',
        controller: 'DashboardCtrl'
    })

    $stateProvider.state('shared-labels', {
        url: '/shared-labels',
        controller: 'LabelsCtrl'
    })

    $stateProvider.state('shared-contacts', {
        url: '/shared-contacts',
        controller: 'ContactsCtrl'
    })

    $stateProvider.state('email-templates', {
        url: '/email-templates',
        controller: 'TemplatesCtrl'
    })

    $stateProvider.state('email-templates.create', {
        url: '/create',
        controller: 'TemplatesCtrl'
    })

    $stateProvider.state('settings', {
        url: '/settings',
        controller: 'SettingsCtrl'
    })

})

app.controller('UserPanelCtrl', function($scope, $firebaseArray, $state) {

});

app.controller('DashboardCtrl', function($scope, $firebaseArray, $state) {

});

app.controller('LabelsCtrl', function($scope, $firebaseArray, $state) {

});

app.controller('ContactsCtrl', function($scope, $firebaseArray, $state) {

});

app.controller('TemplatesCtrl', function($scope, $firebaseArray, $state) {

});

app.controller('SettingsCtrl', function($scope, $firebaseArray, $state) {

});
