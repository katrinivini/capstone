var config = {
    apiKey: "AIzaSyDPRP1vgm6bQ7SXuVAQtgBS5ewsjJoDLzg",
    authDomain: "capstone1604gha.firebaseapp.com",
    databaseURL: "https://capstone1604gha.firebaseio.com",
    storageBucket: "https://capstone1604gha.firebaseio.com",
};

var $ = require('jquery');

firebase.initializeApp(config);
/*myapp.js is the file where we should create the 'tables' in our database, the rest go in the js folder*/
var messages = firebase.database().ref('/messages');
messages.set({ isChanging: false, sender: "" });
// var team = firebase.database().ref('/teamEmail');
var members = firebase.database().ref('/members');

/*also require all the files here. browserify will compile them and put them into the bundle file*/
module.exports = {
    // team: team,
    $: $,
    messages: messages,
    members: members
}

require('./compose/realtime-updates.js');
require('./left-navmenu/myconversations.js');
require('./login/login.js');
require('./threadview/assign/assign-button.js');