var $ = require('jquery');
// var router = require('angular-ui-router');
// var fb = require('../myapp.js');

InboxSDK.load('1.0', 'sdk_CapstoneIDK_aa9966850e').then(function(sdk) {
    var boo = true;
    sdk.Toolbars.addToolbarButtonForApp({
        title: 'Dashboard',
        iconUrl: 'http://www.lifein19x19.com/forum/images/smilies/icon_batman.gif',
        iconClass: 'dashboard-button',
        onClick: function(event) {
            $(dashboard).toggle();
            // if (sdk.Router.getCurrentRouteView().getRouteID() === '/dashboard') {
            //     sdk.Router.goto('/inbox');
            //     $('.nh').hide();
            //     var thingy = $('.nH > .no > .nH > .nH');
            //     console.log('thingy here', thingy);
            //     thingy.show();
            //     thingy.removeAttr("style");
            //     $( ".nH" ).find( ":hidden" ).show();
            //     sdk.Router.exit();
            //     console.log('router', sdk.Router)
            // } else {
            //     sdk.Router.goto('/dashboard');
            // }
        }
    });

    function initDashboard(){
        var el = document.createElement("iframe");
        el.src = chrome.extension.getURL('/templates/index.html');
        el.style.zIndex = 10000;
        el.style.position = "fixed";
        el.style.top = "60px";
        el.style.left = 0;
        el.style.width = "100%";
        el.style.height = "100%";
        $(el).hide();
        document.body.appendChild(el);
        return el; 
    }
    
    var dashboard = initDashboard();

    // sdk.Router.handleCustomRoute("/dashboard", function(customRouteView) {
    //     customRouteView.getElement().appendChild(el);
    // });
    
    // sdk.Router.handleCustomRoute("/shared-labels", function(customRouteView) {
    //     var el = document.createElement("div");
    //     $(el).load(chrome.extension.getURL('/templates/shared-labels.html'));
    //     angular.element(document).ready(function(){
    //         angular.bootstrap(el, ['thing'])
    //     })
    //     customRouteView.getElement().appendChild(el);
    // });
        
    // sdk.Router.handleCustomRoute("/shared-labels/create", function(customRouteView) {
    //     var el = document.createElement("div");
    //     $(el).load(chrome.extension.getURL('/templates/shared-labels-create.html'));
    //     angular.element(document).ready(function(){
    //         angular.bootstrap(el, ['thing'])
    //     })
    //     customRouteView.getElement().appendChild(el);
    // });        

    // sdk.Router.handleCustomRoute("/shared-labels/edit", function(customRouteView) {
    //     var el = document.createElement("div");
    //     $(el).load(chrome.extension.getURL('/templates/shared-labels-edit.html'));
    //     angular.element(document).ready(function(){
    //         angular.bootstrap(el, ['thing'])
    //     })
    //     customRouteView.getElement().appendChild(el);
    // });
    
    // sdk.Router.handleCustomRoute("/email-templates", function(customRouteView) {
    //     var el = document.createElement("div");
    //     $(el).load(chrome.extension.getURL('/templates/email-template.html'));
    //     angular.element(document).ready(function(){
    //         angular.bootstrap(el, ['thing'])
    //     })
    //     customRouteView.getElement().appendChild(el);
    // });   
    
    // sdk.Router.handleCustomRoute("/email-templates/create", function(customRouteView) {
    //     var el = document.createElement("div");
    //     $(el).load(chrome.extension.getURL('/templates/email-template-create.html'));
    //     angular.element(document).ready(function(){
    //         angular.bootstrap(el, ['thing'])
    //     })
    //     customRouteView.getElement().appendChild(el);
    // });   
    
    // sdk.Router.handleCustomRoute("/email-templates/edit", function(customRouteView) {
    //     var el = document.createElement("div");
    //     $(el).load(chrome.extension.getURL('/templates/email-template-edit.html'));
    //     angular.element(document).ready(function(){
    //         angular.bootstrap(el, ['thing'])
    //     })
    //     customRouteView.getElement().appendChild(el);
    // });   
    
    // sdk.Router.handleCustomRoute("/snoozed", function(customRouteView) {
    //     var el = document.createElement("div");
    //     $(el).load(chrome.extension.getURL('/templates/snoozed-items.html'));
    //     angular.element(document).ready(function(){
    //         angular.bootstrap(el, ['thing'])
    //     })
    //     customRouteView.getElement().appendChild(el);
    // });   

    // sdk.Router.createLink('userpanel');
    // sdk.Router.createLink('dashboard');
    // sdk.Router.createLink('shared-labels');
    // sdk.Router.createLink('shared-labels/create');
    // sdk.Router.createLink('shared-labels/edit');
    // sdk.Router.createLink('email-templates');
    // sdk.Router.createLink('email-templates/create');
    // sdk.Router.createLink('email-templates/edit');
    // sdk.Router.createLink('snoozed');

});
