(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
        url: '/dashboard',
        templateUrl: chrome.extension.getURL('/templates/dashboard-home.html'),
        // template: fs.readFileSync("templates/dashboard-home.html").toString(),
        controller: 'DashboardCtrl'
    })

    $stateProvider.state('sharedlabels', {
        url: '/shared-labels',
        templateUrl: chrome.extension.getURL('/templates/shared-labels.html'),
        controller: 'LabelsCtrl'
    })

    $stateProvider.state('sharedlabels.create', {
        url: '/create',
        controller: 'LabelsCtrl'
    })

    $stateProvider.state('emailtemplates', {
        url: '/email-templates',
        templateUrl: chrome.extension.getURL('/templates/email-template.html'),
        controller: 'TemplatesCtrl'
    })

    $stateProvider.state('emailtemplates.create', {
        url: '/create',
        controller: 'TemplatesCtrl'
    })
    $stateProvider.state('emailtemplates.edit', {
        url: '/edit',
        controller: 'TemplatesCtrl'
    })

    $stateProvider.state('snoozed', {
        url: '/snoozed',
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


},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3Vzci9sb2NhbC9saWIvbm9kZV9tb2R1bGVzL3dhdGNoaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhbmd1bGFyL21vZHVsZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgY29uZmlnID0ge1xuICAgIGFwaUtleTogXCJBSXphU3lEUFJQMXZnbTZiUTdTWHVWQVF0Z0JTNWV3c2pKb0RMemdcIixcbiAgICBhdXRoRG9tYWluOiBcImNhcHN0b25lMTYwNGdoYS5maXJlYmFzZWFwcC5jb21cIixcbiAgICBkYXRhYmFzZVVSTDogXCJodHRwczovL2NhcHN0b25lMTYwNGdoYS5maXJlYmFzZWlvLmNvbVwiLFxuICAgIHN0b3JhZ2VCdWNrZXQ6IFwiaHR0cHM6Ly9jYXBzdG9uZTE2MDRnaGEuZmlyZWJhc2Vpby5jb21cIixcbn07XG5cbnZhciBGaXJlYmFzZSA9IGZpcmViYXNlLmluaXRpYWxpemVBcHAoY29uZmlnKTtcblxudmFyIGFwcCA9IGFuZ3VsYXIubW9kdWxlKCdhcHAnLCBbJ2ZpcmViYXNlJywgJ3VpLnJvdXRlciddKTtcblxuYXBwLmNvbmZpZyhmdW5jdGlvbigkc3RhdGVQcm92aWRlcikge1xuICAgIC8vIC8vIFx0Ly8gVGhpcyB0dXJucyBvZmYgaGFzaGJhbmcgdXJscyAoLyNhYm91dCkgYW5kIGNoYW5nZXMgaXQgdG8gc29tZXRoaW5nIG5vcm1hbCAoL2Fib3V0KVxuICAgIC8vIFx0Ly8gJGxvY2F0aW9uUHJvdmlkZXIuaHRtbDVNb2RlKHRydWUpO1xuICAgIC8vIC8vIFx0Ly8gSWYgd2UgZ28gdG8gYSBVUkwgdGhhdCB1aS1yb3V0ZXIgZG9lc24ndCBoYXZlIHJlZ2lzdGVyZWQsIGdvIHRvIHRoZSBcIi9cIiB1cmwuXG4gICAgLy8gXHQvLyAkdXJsUm91dGVyUHJvdmlkZXIub3RoZXJ3aXNlKCcvdXNlcnBhbmVsJyk7XG5cbiAgICAvLyBcdC8vdGhpcyBsaW5lIGRvZXNuJ3Qgd29yayBhbnltb3JlIGFmdGVyIG1lcmdpbmcgd2l0aCBtYXN0ZXI/XG4gICAgLy8gXHQvLyAkdXJsUm91dGVyUHJvdmlkZXIud2hlbignL3VzZXJwYW5lbCcsICcvZGFzaGJvYXJkJyk7XG5cbiAgICAvLyB2YXIgZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgIC8vIGZldGNoKGNocm9tZS5leHRlbnNpb24uZ2V0VVJMKCcvdGVtcGxhdGVzL2Rhc2hib2FyZC1ob21lLmh0bWwnKSlcbiAgICAvLyAudGhlbihmdW5jdGlvbihyZXNwb25zZSl7XG4gICAgLy8gXHRyZXR1cm4gcmVzcG9uc2UudGV4dCgpO1xuICAgIC8vIH0pXG4gICAgLy8gLnRoZW4oZnVuY3Rpb24oaHRtbCl7XG4gICAgLy8gXHRpbnNlcnQgPSBodG1sOyBcbiAgICAvLyBcdC8vIGVsLmlubmVySFRNTCA9IGh0bWw7XG4gICAgLy8gfSlcblxuICAgICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdkYXNoYm9hcmQnLCB7XG4gICAgICAgIHVybDogJy9kYXNoYm9hcmQnLFxuICAgICAgICB0ZW1wbGF0ZVVybDogY2hyb21lLmV4dGVuc2lvbi5nZXRVUkwoJy90ZW1wbGF0ZXMvZGFzaGJvYXJkLWhvbWUuaHRtbCcpLFxuICAgICAgICAvLyB0ZW1wbGF0ZTogZnMucmVhZEZpbGVTeW5jKFwidGVtcGxhdGVzL2Rhc2hib2FyZC1ob21lLmh0bWxcIikudG9TdHJpbmcoKSxcbiAgICAgICAgY29udHJvbGxlcjogJ0Rhc2hib2FyZEN0cmwnXG4gICAgfSlcblxuICAgICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdzaGFyZWRsYWJlbHMnLCB7XG4gICAgICAgIHVybDogJy9zaGFyZWQtbGFiZWxzJyxcbiAgICAgICAgdGVtcGxhdGVVcmw6IGNocm9tZS5leHRlbnNpb24uZ2V0VVJMKCcvdGVtcGxhdGVzL3NoYXJlZC1sYWJlbHMuaHRtbCcpLFxuICAgICAgICBjb250cm9sbGVyOiAnTGFiZWxzQ3RybCdcbiAgICB9KVxuXG4gICAgJHN0YXRlUHJvdmlkZXIuc3RhdGUoJ3NoYXJlZGxhYmVscy5jcmVhdGUnLCB7XG4gICAgICAgIHVybDogJy9jcmVhdGUnLFxuICAgICAgICBjb250cm9sbGVyOiAnTGFiZWxzQ3RybCdcbiAgICB9KVxuXG4gICAgJHN0YXRlUHJvdmlkZXIuc3RhdGUoJ2VtYWlsdGVtcGxhdGVzJywge1xuICAgICAgICB1cmw6ICcvZW1haWwtdGVtcGxhdGVzJyxcbiAgICAgICAgdGVtcGxhdGVVcmw6IGNocm9tZS5leHRlbnNpb24uZ2V0VVJMKCcvdGVtcGxhdGVzL2VtYWlsLXRlbXBsYXRlLmh0bWwnKSxcbiAgICAgICAgY29udHJvbGxlcjogJ1RlbXBsYXRlc0N0cmwnXG4gICAgfSlcblxuICAgICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdlbWFpbHRlbXBsYXRlcy5jcmVhdGUnLCB7XG4gICAgICAgIHVybDogJy9jcmVhdGUnLFxuICAgICAgICBjb250cm9sbGVyOiAnVGVtcGxhdGVzQ3RybCdcbiAgICB9KVxuICAgICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdlbWFpbHRlbXBsYXRlcy5lZGl0Jywge1xuICAgICAgICB1cmw6ICcvZWRpdCcsXG4gICAgICAgIGNvbnRyb2xsZXI6ICdUZW1wbGF0ZXNDdHJsJ1xuICAgIH0pXG5cbiAgICAkc3RhdGVQcm92aWRlci5zdGF0ZSgnc25vb3plZCcsIHtcbiAgICAgICAgdXJsOiAnL3Nub296ZWQnLFxuICAgICAgICB0ZW1wbGF0ZVVybDogY2hyb21lLmV4dGVuc2lvbi5nZXRVUkwoJy90ZW1wbGF0ZXMvc25vb3plZC1pdGVtcy5odG1sJyksXG4gICAgICAgIGNvbnRyb2xsZXI6ICdTbm9vemVDdHJsJ1xuICAgIH0pXG5cbn0pXG5cbi8vIG1vZHVsZS5leHBvcnRzID0ge1xuLy8gXHRhcHA6IGFwcFxuLy8gfVxuLy8gcmVxdWlyZSgnLi9hcHAuanMnKTtcbi8vIHJlcXVpcmUoJy4vZGFzaGJvYXJkL2Rhc2hib2FyZC5jb250cm9sbGVyLmpzJyk7XG4vLyByZXF1aXJlKCcuL2xhYmVscy9sYWJlbHMuY29udHJvbGxlci5qcycpO1xuLy8gcmVxdWlyZSgnLi9zbm9vemVkL3Nub296ZWQuY29udHJvbGxlci5qcycpO1xuLy8gcmVxdWlyZSgnLi90ZW1wbGF0ZXMvdGVtcGxhdGVzLmNvbnRyb2xsZXIuanMnKTtcblxuIl19
