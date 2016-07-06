// var $ = require('jquery');
window.$ = window.jQuery = require('jquery');
var bootstrap = require('bootstrap');
var css = require('./myapp.css');
require('angular');
var firebase = require('firebase');
var angular = require('angular');
var angularfire = require('angularfire');
var uiRouter = require('angular-ui-router');
// var bootstrap = require('bootstrap');

var config = {
    apiKey: "AIzaSyDPRP1vgm6bQ7SXuVAQtgBS5ewsjJoDLzg",
    authDomain: "capstone1604gha.firebaseapp.com",
    databaseURL: "https://capstone1604gha.firebaseio.com",
    storageBucket: "https://capstone1604gha.firebaseio.com",
};

var Firebase = firebase.initializeApp(config);

/*myapp.js is the file where we should create the 'tables' in our database, the rest go in the js folder*/
var rootRef = firebase.database().ref();
var messages = firebase.database().ref('/messages');
// messages.set({ isChanging: false, sender: "" });
var members = firebase.database().ref('/members');
var sharedLabels = firebase.database().ref('/sharedLabels');
var templates = firebase.database().ref('/templates');
// sharedLabels.on('child_added', function(data){
//  data.ref('/members');
// })

/*also require all the files here. browserify will compile them and put them into the bundle file*/
module.exports = {
    $: $,
    sharedLabels: sharedLabels,
    messages: messages,
    members: members,
    templates: templates,
    Firebase: Firebase,
}

/* -------- JS FILES ----------- */
require('./compose/realtime-updates.js');
require('./dashboard/dashboard.js');
require('./left-navmenu/myconversations.js');
require('./left-navmenu/shared-labels.js');
// require('./login/login.js');
require('./threadview/assign/assign-button.js');
require('./threadview/shared-labels-button.js');
require('./threadview/taskhistory.js');
require('./threadview/comment.js');
require('../angular/app.js');
require('../angular/module.js');
// require('../templates/index.html');

// require('../gapi/background.js');

/* -------- CSS FILES ----------- */
// require('../css/styles.css');
// require('./myapp.css');
