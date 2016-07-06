var $ = require('jquery');
// var router = require('angular-ui-router');
// var fb = require('../myapp.js');

InboxSDK.load('1.0', 'sdk_CapstoneIDK_aa9966850e').then(function(sdk) {
    var boo = true;
    sdk.Toolbars.addToolbarButtonForApp({
        title: 'Dashboard',
        iconUrl: chrome.extension.getURL('/templates/elephant-toolbar.png'),
        iconClass: 'dashboard-button',
        onClick: function(event) {
            $(dashboard).toggle();

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

});
