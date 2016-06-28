var $ = require('jquery');
var fb = require('../myapp.js');
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
            fb.login(); 
        	// console.log($(teamEmail).val());
            // team.set($(teamEmail).val());
            // members.push(sdk.User.getEmailAddress());
        });
        form.appendChild(teamEmail);
        form.appendChild(submit);
        return form;
    }
});
