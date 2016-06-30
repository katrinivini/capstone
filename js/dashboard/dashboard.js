var $ = require('jquery');
var fb = require('../myapp.js');

InboxSDK.load('1.0', 'sdk_CapstoneIDK_aa9966850e').then(function(sdk) {

    var routeID = '/user-panel';
    
    sdk.Router.handleCustomRoute(routeID, function(customRouteView) {
        var el = document.createElement("div");
        $(el).load(chrome.extension.getURL('/templates/user-panel.html'));
        angular.element(document).ready(function(){
            angular.bootstrap(el, ['thing'])  
        })
        customRouteView.getElement().appendChild(el);
    });

    sdk.Router.createLink('dashboard');

    sdk.Toolbars.registerToolbarButtonForThreadView({
        title: 'Go to Dashboard',
        iconUrl: 'http://www.lifein19x19.com/forum/images/smilies/icon_batman.gif',
        section: 'METADATA_STATE',
        hasDropdown: false,
        onClick: function(event) {
            sdk.Router.goto('/user-panel')
        }
    });

});
