var $ = require('jquery');
var router = require('angular-ui-router');
var fb = require('../myapp.js');

InboxSDK.load('1.0', 'sdk_CapstoneIDK_aa9966850e').then(function(sdk) {

    var routeID = '/thing';
    
    sdk.Router.handleCustomRoute(routeID, function(customRouteView) {
        var el = document.createElement("div");
        $(el).load(chrome.extension.getURL('/templates/test.html'));
        angular.element(document).ready(function(){
            angular.bootstrap(el, ['thing'])
        })
        customRouteView.getElement().appendChild(el);
    });

    sdk.Router.createLink('thing');

    sdk.Toolbars.registerToolbarButtonForThreadView({
        title: 'Go to Dashboard',
        iconUrl: 'http://www.lifein19x19.com/forum/images/smilies/icon_batman.gif',
        section: 'METADATA_STATE',
        hasDropdown: false,
        onClick: function(event) {
            router.$state.go('userpanel');  
            // sdk.Router.goto('/thing')
        }
    });

});
