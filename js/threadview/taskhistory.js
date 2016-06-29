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

    // sdk.Conversations.registerThreadViewHandler(function(threadView) {
    //     chrome.runtime.sendMessage({
    //         type: 'read message',
    //         threadId: threadView.getThreadID()
    //     }, function(response) {

    //         console.log('now trying to get metadata: ', response);

    //     })
    // });
    sdk.Conversations.registerThreadViewHandler(function(threadView) {
        // console.log("threadid", threadView.getThreadID())
        chrome.runtime.sendMessage({
            type: 'read message',
            threadId: threadView.getThreadID()
        }, function(response) {
            var foo = {};
            var hash = response;
            var person = sdk.User.getAccountSwitcherContactList()[0].name;
            // foo[person] = "read";
            console.log('now trying to get metadata: ', response);
            // if (messages.child(hash)){
            // console.log(" we in here and ", messages.child(hash))
            // var oldfoo = messages.child(hash);
            // foo = extend(foo, oldfoo);
            // messages.child(hash).update(person + '/');
<<<<<<< HEAD
=======

            // this is the path to the node that i want to change
>>>>>>> 19768ce1834e8b3c67bf8b6feec463fa62e4c8e7
            var k = hash + '/' + person;
            foo[k] = "read";
            messages.update(foo);
            // } else {
            //     messages.child(hash).set(foo)
            // }
        })
    });
<<<<<<< HEAD
});
=======
});

function extend(obj, src) {
    for (var key in src) {
        if (src.hasOwnProperty(key)) obj[key] = src[key];
    }
    return obj;
}
>>>>>>> 19768ce1834e8b3c67bf8b6feec463fa62e4c8e7
