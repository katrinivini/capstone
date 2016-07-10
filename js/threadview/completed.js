var messages = require('../myapp.js').messages;
var members = require('../myapp.js').members;
var Firebase = require('firebase');
InboxSDK.load('1.0', 'sdk_CapstoneIDK_aa9966850e').then(function(sdk) {
    var threadId;
    sdk.Conversations.registerThreadViewHandler(function(threadView) {
        threadId = threadView.getThreadID();
    })
    var name = sdk.User.getAccountSwitcherContactList()[0].name;
    members.once('value', function(snapshot) {
        var people = Array.prototype.slice.call(snapshot.val());
        people.forEach(function(p, i) {
            if (name === p.name) {
                index = i;
            }
        })
    })
    sdk.Toolbars.registerToolbarButtonForThreadView({
        title: 'Complete',
        iconUrl: 'https://cdn2.iconfinder.com/data/icons/web/512/Check_Sign-512.png',
        section: 'METADATA_STATE',
        onClick: function(event) {
            chrome.runtime.sendMessage({
                type: 'read message',
                threadId: threadId
            }, function(messageID) {
                members.child(index).child('activity').once('value', function(snapshot) {
                    var userHistory = snapshot.val();
                    console.log('userHistory: ', userHistory);
                    //checking if the member already snoozed this email
                    for (var databaseId in userHistory) {
                        if (userHistory.hasOwnProperty(databaseId) && userHistory[databaseId].action === 'completed' && userHistory[databaseId].threadId === threadId) return;
                    }
                    messages.child(messageID).child('activity').push(eventObj(name, 'completed this email'))
                    members.child(index).child('activity').push({ action: 'completed', threadId: threadId, messageId: messageID, date: Firebase.database.ServerValue.TIMESTAMP })
                })
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
