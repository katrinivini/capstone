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

function login () {
	var provider = new firebase.auth.GoogleAuthProvider();
	console.log('what is provider', provider)
	// firebase.auth().signInWithPopup(provider)
	firebase.auth().signInWithRedirect(provider)
	.then(function(result) {
    // This gives you a Google Access Token. You can use it to access the Google API.
    	alert('hello are you there');
	    console.log('here is result', result)
	    // var token = result.credential.accessToken;
	    // var user = result.user;
	})
	.catch(function(error) {
		console.log('X_X :', error.code + error.message)
	    // var errorCode = error.code;
	    // var errorMessage = error.message;
	    // var email = error.email;
	    // var credential = error.credential;
	});
}


/*also require all the files here. browserify will compile them and put them into the bundle file*/
module.exports = {
    // team: team,
    messages: messages,
    members: members,
    login: login
}

require('./compose/realtime-updates.js');
require('./left-navmenu/myconversations.js');
require('./login/login.js');
require('./threadview/assign/assign-button.js');