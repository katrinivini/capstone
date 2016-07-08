var $ = require('jquery');
// brfs fs, not Node fs. Need to npm install brfs.
var fs = require('fs');
// Need path because brfs fs works at runtime, so it only understands statically analyzable paths (no variables or relative paths).
var path = require('path');  

var parser = new DOMParser();


// Gets html as string.
var html = fs.readFileSync(path.resolve(__dirname + '/../../../templates/assign-button.html'), 'utf8');

// Parses string into full html doc (with html & body tags).
html = parser.parseFromString(html, 'text/html');

// Gets only the html part (assign div) we need for the toolbar button modal InboxSDK makes because the modal won't render the full html doc.
var el = html.getElementsByClassName('assign')[0];

// Hooks up Angular with html. AssignCtrl is in app.js.
angular.element(document).ready(function() {
    angular.bootstrap(html, ['shazzam'])
});

// Makes Assign button that shows modal on click.
InboxSDK.load('1.0', 'sdk_CapstoneIDK_aa9966850e').then(function(sdk) {

    sdk.Toolbars.registerToolbarButtonForThreadView({
        title: 'Assign',
        iconUrl: 'https://cdn3.iconfinder.com/data/icons/box-and-shipping-supplies-icons/447/Clipboard_With_Pencil-512.png',
        section: 'METADATA_STATE',
        hasDropdown: false,
        onClick: function(event) {
            sdk.Widgets.showModalView({
                title: '',
                el: el
            })
            $('#assign-submit').on('click', function(event){
                console.log('close assign modal view');
                close();
            });
        }
    });

});

