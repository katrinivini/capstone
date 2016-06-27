var $ = require('jquery');
// var team = require('../myapp.js').team;
var members = require('../myapp.js').members;

InboxSDK.load('1.0', 'sdk_CapstoneIDK_aa9966850e').then(function(sdk) {
    sdk.Toolbars.addToolbarButtonForApp({
        title: 'USE IDK',
        titleClass: 'authentication',
        arrowColor: 'green',
        onClick: function(event) {
            sdk.Widgets.showModalView({
                el: loginForm(),
                title: 'USE IDK'
            })
        }
    });

    function loginForm() {
        var form = document.createElement('form');
        var personalEmail = document.createElement('input');
        var teamEmail = document.createElement('input');
        teamEmail.type = 'text';
        teamEmail.placeholder = 'team email address';
        var submit = document.createElement('input');
        submit.type = 'submit';
        submit.value = 'Confirm';
        submit.addEventListener('click', function(event) {
        	// console.log($(teamEmail).val());
         //    team.set($(teamEmail).val());
            members.push(sdk.User.getEmailAddress());
            // var provider = new firebase.auth.GoogleAuthProvider();
            // firebase.auth().signInWithPopup(provider).then(function(result) {
            //     // This gives you a Google Access Token. You can use it to access the Google API.
            //     var token = result.credential.accessToken;
            //     // The signed-in user info.
            //     var user = result.user;
            //     // ...
            // }).catch(function(error) {
            //     // Handle Errors here.
            //     var errorCode = error.code;
            //     var errorMessage = error.message;
            //     // The email of the user's account used.
            //     var email = error.email;
            //     // The firebase.auth.AuthCredential type that was used.
            //     var credential = error.credential;
            //     // ...
            // });
        });
        form.appendChild(teamEmail);
        form.appendChild(submit);
        return form;
    }
});
