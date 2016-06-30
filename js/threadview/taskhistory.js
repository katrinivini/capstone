var messages = require('../myapp.js').messages;

InboxSDK.load('1.0', 'sdk_CapstoneIDK_aa9966850e').then(function(sdk) {
    sdk.Conversations.registerThreadViewHandler(function(threadView) {
        var taskHistory = document.createElement('div');
        taskHistory.style = "height: 200px; width: 200px";
        threadView.addSidebarContentPanel({
            el: taskHistory,
            title: 'Task History',
            iconUrl: 'https://cdn3.iconfinder.com/data/icons/website-panel-icons/128/test1-13-512.png'
        })
    })

    sdk.Conversations.registerThreadViewHandler(function(threadView) {
        // console.log("threadid", threadView.getThreadID())
        chrome.runtime.sendMessage({
            type: 'read message',
            threadId: threadView.getThreadID()
        }, function(response) {
            var foo = {};
            var hash = response;
            var person = sdk.User.getAccountSwitcherContactList()[0].name;
            var k = hash + '/' + person;
            // foo[person] = "read";
            console.log('now trying to get metadata: ', response);
            // if (messages.child(hash)){
            // console.log(" we in here and ", messages.child(hash))
            // var oldfoo = messages.child(hash);
            // foo = extend(foo, oldfoo);
            // messages.child(hash).update(person + '/');
            Promise.resolve(messages.once('value', function(snapshot) {
                    var data = snapshot.val();
                    if (data && data[hash]) { //thread exists
                        if (data[hash][person]) foo[k] = data[hash][person];
                        // console.log(data[hash][person]);
                        else { //thread exists but person doesn't
                            foo[k] = {
                                comments: [{ message: "", date: "" }],
                                activity: [{ action: "", date: "" }]
                            }
                        }
                    } else {
                        foo[k] = {
                            comments: [{ message: "", date: "" }],
                            activity: [{ action: "", date: "" }]
                        }
                    }
                    return;
                }))
                .then(function() {
                    messages.update(foo);
                })
                // this is the path to the node that i want to change

            // foo[k] = {comments: [''], activity: [''] };

            // } else {
            //     messages.child(hash).set(foo)
            // }
        })
    });
});

function extend(obj, src) {
    for (var key in src) {
        if (src.hasOwnProperty(key)) obj[key] = src[key];
    }
    return obj;
}
