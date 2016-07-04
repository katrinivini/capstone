// var $ = require('jquery');
// var Firebase = require('firebase');

// var assignedHistory = require('../js/myapp.js').assignedHistory;
// var members = require('../js/myapp.js').members;
// var messages = require('../js/myapp.js').messages;
var app = angular.module('thing', ['firebase', 'ui.router']);
// Eventually need to refactor so that there's only one angular.module.
var assignapp = angular.module('shazzam', ['firebase']);

module.exports = {
	app: app,
	assignapp: assignapp
}



require('./dashboard-controller.js');
require('./assign-controller.js');








// var insert = '';
// // var el = document.createElement("div");
// fetch(chrome.extension.getURL('/templates/dashboard-home.html'))
// .then(function(response){
// 	return response.text();
// })
// .then(function(html){
// 	console.log('here is the html', html)
// 	insert = html; 
// 	// el.innerHTML = html;
// 	// console.log('what is el now', el);

// })

