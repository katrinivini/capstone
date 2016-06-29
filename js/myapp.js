var $ = require('jquery');
var css = require('./myapp.css');
console.log('here is css', css);

var config = {
    apiKey: "AIzaSyDPRP1vgm6bQ7SXuVAQtgBS5ewsjJoDLzg",
    authDomain: "capstone1604gha.firebaseapp.com",
    databaseURL: "https://capstone1604gha.firebaseio.com",
    storageBucket: "https://capstone1604gha.firebaseio.com",
};

firebase.initializeApp(config);

/*myapp.js is the file where we should create the 'tables' in our database, the rest go in the js folder*/
var rootRef = firebase.database().ref();
var messages = firebase.database().ref('/messages');
// messages.set({ isChanging: false, sender: "" });
var members = firebase.database().ref('/members');
var sharedLabels = firebase.database().ref('/sharedLabels');
// sharedLabels.on('child_added', function(data){
// 	data.ref('/members');
// })

/*also require all the files here. browserify will compile them and put them into the bundle file*/
module.exports = {
    $: $,
    sharedLabels: sharedLabels,
    messages: messages,
    members: members
}

/* -------- JS FILES ----------- */
require('../gapi/taskhistory.js');
require('./compose/realtime-updates.js');
require('./dashboard/dashboard.js');
require('./left-navmenu/myconversations.js');
require('./left-navmenu/shared-labels.js');
require('./login/login.js');
require('./threadview/assign/assign-button.js');
require('./threadview/shared-labels-button.js');
require('./threadview/taskhistory.js');
require('./threadview/comment.js');
// require('../gapi/background.js');

/* -------- CSS FILES ----------- */
// require('../css/styles.css');
// require('./myapp.css');