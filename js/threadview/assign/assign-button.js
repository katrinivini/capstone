var members = require('../../myapp.js').members;

InboxSDK.load('1.0', 'sdk_CapstoneIDK_aa9966850e').then(function(sdk) {
    sdk.Toolbars.registerToolbarButtonForThreadView({
        title: 'Assign',
        section: 'INBOX_STATE',
        iconUrl: 'https://cdn0.iconfinder.com/data/icons/pixel-perfect-at-24px-volume-6/24/2140-512.png',
        hasDropdown: true,
        onClick: function(event) {
            var emails = [];
            var list = document.createElement('div');
            Promise.resolve(members.once('value', function(snapshot) {
                    var data = snapshot.val();
                    var properties = Object.getOwnPropertyNames(data); //returns array of enumerable property names
                    properties.forEach(function(prop) {
                        emails.push(data[prop]);
                    })
                }))
                .then(function() {
                    emails.forEach(function(email) {
                        var em = document.createElement('div');
                        em.innerHTML = email;
                        list.appendChild(em);
                    });
                    event.dropdown.el.appendChild(list);
                });
        }
    });
});
