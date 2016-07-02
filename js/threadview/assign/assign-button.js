var $ = require('jquery');
var members = require('../../myapp.js').members;
// This is brfs fs, not Node's fs. Need to npm install brfs.
var fs = require('fs');
var path = require('path')


// // This is modeled after BL's dashboard. Works with data retrieval from Firebase sometimes.
// InboxSDK.load('1.0', 'sdk_CapstoneIDK_aa9966850e').then(function(sdk) {

//     var el = document.createElement("div");
//     $(el).load(chrome.extension.getURL('/templates/assign-button.html'));
//     angular.element(document).ready(function() {
//         angular.bootstrap(el, ['shazzam'])
//     });

//     sdk.Toolbars.registerToolbarButtonForThreadView({
//         title: 'Assign',
//         iconUrl: 'https://cdn3.iconfinder.com/data/icons/box-and-shipping-supplies-icons/447/Clipboard_With_Pencil-512.png',
//         section: 'METADATA_STATE',
//         hasDropdown: false,
//         onClick: function(event) {
//             sdk.Widgets.showModalView({
//                 title: 'Well hello there beautiful',
//                 el: el
//             })
//         }
//     });

// });



var html = fs.readFileSync(path.resolve(__dirname + '/../../../templates/assign-button.html'), 'utf8');

$('assign').html(html);

angular.element(document).ready(function() {
    angular.bootstrap(html, ['shazzam'])
});

// console.log("html: ", html);

InboxSDK.load('1.0', 'sdk_CapstoneIDK_aa9966850e').then(function(sdk) {

    sdk.Toolbars.registerToolbarButtonForThreadView({
        title: 'Assign',
        iconUrl: 'https://cdn3.iconfinder.com/data/icons/box-and-shipping-supplies-icons/447/Clipboard_With_Pencil-512.png',
        section: 'METADATA_STATE',
        hasDropdown: false,
        onClick: function(event) {
            sdk.Widgets.showModalView({
                title: 'Well hello there beautiful',
                el: html
            })
        }
    });

});
