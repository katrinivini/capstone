'use strict';

var config = {
    apiKey: "AIzaSyDPRP1vgm6bQ7SXuVAQtgBS5ewsjJoDLzg",
    authDomain: "capstone1604gha.firebaseapp.com",
    databaseURL: "https://capstone1604gha.firebaseio.com",
    storageBucket: "https://capstone1604gha.firebaseio.com",
};

var Firebase = firebase.initializeApp(config);

var app = angular.module('app', ['firebase', 'ui.router']);

app.config(function($stateProvider) {
    // // 	// This turns off hashbang urls (/#about) and changes it to something normal (/about)
    // 	// $locationProvider.html5Mode(true);
    // // 	// If we go to a URL that ui-router doesn't have registered, go to the "/" url.
    // 	// $urlRouterProvider.otherwise('/userpanel');

    // 	//this line doesn't work anymore after merging with master?
    // 	// $urlRouterProvider.when('/userpanel', '/dashboard');

    // var el = document.createElement("div");
    // fetch(chrome.extension.getURL('/templates/dashboard-home.html'))
    // .then(function(response){
    // 	return response.text();
    // })
    // .then(function(html){
    // 	insert = html; 
    // 	// el.innerHTML = html;
    // })

    $stateProvider.state('dashboard', {
        // url: '/dashboard',
        // template: fs.readFileSync("templates/dashboard-home.html").toString(),
        templateUrl: chrome.extension.getURL('/templates/dashboard-home.html'),
        controller: 'DashboardCtrl'
    })

    $stateProvider.state('sharedlabels', {
        // url: '/shared-labels',
        templateUrl: chrome.extension.getURL('/templates/shared-labels.html'),
        controller: 'LabelsCtrl'
    })

    $stateProvider.state('sharedlabelscreate', {
        // url: '/create',
        templateUrl: chrome.extension.getURL('/templates/shared-labels-create.html'),
        controller: 'LabelsCtrl'
    })

    $stateProvider.state('emailtemplates', {
        // url: '/email-templates',
        templateUrl: chrome.extension.getURL('/templates/email-template.html'),
        controller: 'TemplatesCtrl'
    })

    $stateProvider.state('emailtemplatescreate', {
        // url: '/create',
        templateUrl: chrome.extension.getURL('/templates/email-template-create.html'),
        controller: 'TemplatesCtrl'
    })
    $stateProvider.state('emailtemplates.edit', {
        // url: '/edit',
        templateUrl: chrome.extension.getURL('/templates/email-template-edit.html'),
        controller: 'TemplatesCtrl'
    })
     $stateProvider.state('emailtemplates.preview', {
        // url: '/edit',
        templateUrl: chrome.extension.getURL('/templates/email-template-preview.html'),
        controller: 'TemplatesCtrl'
    })

    $stateProvider.state('snoozed', {
        // url: '/snoozed',
        templateUrl: chrome.extension.getURL('/templates/snoozed-items.html'),
        controller: 'SnoozeCtrl'
    })

})

// module.exports = {
// 	app: app
// }
// require('./app.js');
// require('./dashboard/dashboard.controller.js');
// require('./labels/labels.controller.js');
// require('./snoozed/snoozed.controller.js');
// require('./templates/templates.controller.js');

