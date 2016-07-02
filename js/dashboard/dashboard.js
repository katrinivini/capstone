var $ = require('jquery');
var router = require('angular-ui-router');
var fb = require('../myapp.js');

InboxSDK.load('1.0', 'sdk_CapstoneIDK_aa9966850e').then(function(sdk) {

    sdk.Toolbars.addToolbarButtonForApp({
        title: 'Dashboard',
        iconUrl: 'http://www.lifein19x19.com/forum/images/smilies/icon_batman.gif',
        iconClass: 'dashboard-button',
        onClick: function(event) {
            sdk.Router.goto('/userpanel');
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
    
    sdk.Router.handleCustomRoute("/email-templates", function(customRouteView) {
        var el = document.createElement("div");
        $(el).load(chrome.extension.getURL('/templates/email-template.html'));
        angular.element(document).ready(function(){
            angular.bootstrap(el, ['thing'])
        })
        customRouteView.getElement().appendChild(el);
    });   
    
    sdk.Router.handleCustomRoute("/email-templates/create", function(customRouteView) {
        var el = document.createElement("div");
        $(el).load(chrome.extension.getURL('/templates/email-template-create.html'));
        angular.element(document).ready(function(){
            angular.bootstrap(el, ['thing'])
        })
        customRouteView.getElement().appendChild(el);
    });   
    
    sdk.Router.handleCustomRoute("/email-templates/edit", function(customRouteView) {
        var el = document.createElement("div");
        $(el).load(chrome.extension.getURL('/templates/email-template-edit.html'));
        angular.element(document).ready(function(){
            angular.bootstrap(el, ['thing'])
        })
        customRouteView.getElement().appendChild(el);
    });   

    sdk.Router.createLink('userpanel');
    sdk.Router.createLink('dashboard');
    sdk.Router.createLink('shared-labels');
    sdk.Router.createLink('email-templates');
    sdk.Router.createLink('email-templates/create');
    sdk.Router.createLink('email-templates/edit');

});
