var sharedLabels = require('../myapp.js').sharedLabels;
var Firebase = require('../myapp.js').Firebase;
var messages = require('../myapp.js').messages;
InboxSDK.load('1.0', 'sdk_CapstoneIDK_aa9966850e').then(function(sdk) {
    // var $ = require('jquery');
    var messageID;
    var threadId;
    // var taskHistory;
    var person = sdk.User.getAccountSwitcherContactList()[0].name;
    sdk.Conversations.registerThreadViewHandler(function(threadView) {
        threadId = threadView.getThreadID();
    })

    sdk.Toolbars.registerToolbarButtonForThreadView({
        title: 'Shared Labels',
        iconUrl: 'https://qph.ec.quoracdn.net/main-qimg-a2ed001082fee51d1af874d5319ab5c1?convert_to_webp=true',
        section: 'METADATA_STATE',
        hasDropdown: true,
        onClick: function(event) {
            var labels;
            Promise.resolve(chrome.runtime.sendMessage({
                    type: 'read message',
                    threadId: threadId
                }, function(hash) {
                    messageID = hash;
                }))
                .then(function() {
                    Promise.resolve(sharedLabels.once('value', function(snapshot) {
                        var data = snapshot.val();
                        var properties = Object.getOwnPropertyNames(data);
                        labels = properties.map(function(prop) {
                            return data[prop].label;
                        });
                        var list = document.createElement('div');
                        labels.forEach(function(label) {
                            var p = document.createElement('div');
                            p.innerHTML = label;
                            p.classList.add('shared-labels')
                            p.addEventListener('click', function(event) {
                                messages.child(messageID).child('activity').push({
                                    person: person,
                                    action: 'assigned the shared label ' + p.innerHTML,
                                    date: Firebase.database.ServerValue.TIMESTAMP
                                });
                            })
                            list.appendChild(p);
                        })
                        event.dropdown.el.appendChild(list);
                    }))
                })
        }
    });
});
