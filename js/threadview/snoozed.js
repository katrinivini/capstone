var messages = require('../myapp.js').messages;
var Firebase = require('firebase');
InboxSDK.load('1.0', 'sdk_CapstoneIDK_aa9966850e').then(function(sdk) {
    var threadId;
    sdk.Conversations.registerThreadViewHandler(function(threadView) {
        threadId = threadView.getThreadID();
    })
    var person = sdk.User.getAccountSwitcherContactList()[0].name;
    sdk.Toolbars.registerToolbarButtonForThreadView({
        title: 'Snooze',
        iconUrl: 'http://www.freeiconspng.com/uploads/clock-icon--pretty-office-8-iconset--custom-icon-design-4.ico',
        section: 'METADATA_STATE',
        onClick: function(event) {
            chrome.runtime.sendMessage({
                type: 'read message',
                threadId: threadId
            }, function(messageID) {
                messages.child(messageID).child('activity').push(eventObj(person, 'snoozed this email'))
            })
        }
    })
});

function eventObj(p, a) {
    return {
        person: p,
        action: a,
        date: Firebase.database.ServerValue.TIMESTAMP
    }
}
