var $ = require('../myapp.js').$;

InboxSDK.load('1.0', 'sdk_CapstoneIDK_aa9966850e').then(function(sdk) {
    var routeID = 'dashboard';

    sdk.Router.createLink('dashboard');

    sdk.Toolbars.registerToolbarButtonForThreadView({
        title: 'Go to Dashboard',
        iconUrl: 'http://www.lifein19x19.com/forum/images/smilies/icon_batman.gif',
        section: 'METADATA_STATE',
        hasDropdown: false,
        onClick: function(event) {
            sdk.Router.goto('dashboard')
        }
    });

    sdk.Router.handleCustomRoute(routeID, function(customRouteView) {
        // This div version works with the div.innerHTML array above.
        var html = document.createElement('div');
        $(html).load(chrome.extension.getURL('/templates/dashboard.html'), function(data){
            console.log('data here', data)
        });
        console.log('here is html', html)
        customRouteView.getElement().appendChild(html);
    });

});
