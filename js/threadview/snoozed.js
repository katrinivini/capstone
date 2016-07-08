var messages = require('../myapp.js').messages;
var members = require('../myapp.js').members;
var Firebase = require('firebase');
var index;
InboxSDK.load('1.0', 'sdk_CapstoneIDK_aa9966850e').then(function(sdk) {
    var threadId;
    sdk.Conversations.registerThreadViewHandler(function(threadView) {
        threadId = threadView.getThreadID();
    })
    var name = sdk.User.getAccountSwitcherContactList()[0].name;
    members.once('value', function(snapshot) {
        var people = Array.prototype.slice.call(snapshot.val());
        people.forEach(function(p, i){
            if (name === p.name) {
                index = i;
            }
        })
    })
    sdk.Toolbars.registerToolbarButtonForThreadView({
        title: 'Snooze',
        iconUrl: 'http://www.freeiconspng.com/uploads/clock-icon--pretty-office-8-iconset--custom-icon-design-4.ico',
        section: 'METADATA_STATE',
        onClick: function(event) {
            chrome.runtime.sendMessage({
                type: 'read message',
                threadId: threadId
            }, function(messageID) {
                messages.child(messageID).child('activity').push(eventObj(name, 'snoozed this email'))
                messages.child(index).child('activity').once('value', function(){
                    var userHistory = snapshot.val();
                    console.log('userHistory: ', userHistory);
                })
                members.child(index).child('activity').push({ action: 'snoozed', threadId: threadId, date: Firebase.database.ServerValue.TIMESTAMP })
            })
        }
    })
});

function eventObj(p, a, threadID, messageID) {
    return {
        person: p,
        action: a,
        date: Firebase.database.ServerValue.TIMESTAMP
    }
}
