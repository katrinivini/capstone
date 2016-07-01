var $ = require('jquery');
var router = require('angular-ui-router');
var fb = require('../myapp.js');

InboxSDK.load('1.0', 'sdk_CapstoneIDK_aa9966850e').then(function(sdk) {
    var boo = true;
    sdk.Toolbars.addToolbarButtonForApp({
        title: 'Dashboard',
        iconUrl: 'http://www.lifein19x19.com/forum/images/smilies/icon_batman.gif',
        iconClass: 'dashboard-button',
        onClick: function(event) {
            // if (sdk.Router.getCurrentRouteView().getRouteID() === '/userpanel') {
            //     // sdk.Router.goto('/inbox');
            //     // $('.nh').hide();
            //     // $('.nh').show();
            //     // $( ".nH" ).find( ":hidden" ).show();
            //     // sdk.Router.exit();
            //     // console.log('router', sdk.Router)
            // } else {
                sdk.Router.goto('/userpanel');
            // }
        }
    });
    
    sdk.Router.handleCustomRoute("/userpanel", function(customRouteView) {
        var el = document.createElement("div");
        $(el).load(chrome.extension.getURL('/templates/user-panel.html'));
        angular.element(document).ready(function(){
            angular.bootstrap(el, ['thing'])
        })
        customRouteView.getElement().appendChild(el);
    });
    
    sdk.Router.handleCustomRoute("/dashboard", function(customRouteView) {
        var el = document.createElement("div");
        $(el).load(chrome.extension.getURL('/templates/dashboard-home.html'));
        angular.element(document).ready(function(){
            angular.bootstrap(el, ['thing'])
        })
        customRouteView.getElement().appendChild(el);
    });
    
    sdk.Router.handleCustomRoute("/shared-labels", function(customRouteView) {
        var el = document.createElement("div");
        $(el).load(chrome.extension.getURL('/templates/shared-labels.html'));
        angular.element(document).ready(function(){
            angular.bootstrap(el, ['thing'])
        })
        customRouteView.getElement().appendChild(el);
    });
    
    sdk.Router.handleCustomRoute("/shared-contacts", function(customRouteView) {
        var el = document.createElement("div");
        $(el).load(chrome.extension.getURL('/templates/shared-contacts.html'));
        angular.element(document).ready(function(){
            angular.bootstrap(el, ['thing'])
        })
        customRouteView.getElement().appendChild(el);
    });
    
    sdk.Router.handleCustomRoute("/email-templates", function(customRouteView) {
        var el = document.createElement("div");
        $(el).load(chrome.extension.getURL('/templates/email-templates.html'));
        angular.element(document).ready(function(){
            angular.bootstrap(el, ['thing'])
        })
        customRouteView.getElement().appendChild(el);
    });   

    sdk.Router.handleCustomRoute("/settings", function(customRouteView) {
        var el = document.createElement("div");
        $(el).load(chrome.extension.getURL('/templates/settings.html'));
        angular.element(document).ready(function(){
            angular.bootstrap(el, ['thing'])
        })
        customRouteView.getElement().appendChild(el);
    });

    sdk.Router.createLink('userpanel');
    sdk.Router.createLink('dashboard');
    sdk.Router.createLink('shared-labels');
    sdk.Router.createLink('shared-contacts');
    sdk.Router.createLink('email-templates');
    sdk.Router.createLink('email-templates/create');
    sdk.Router.createLink('settings');

});
