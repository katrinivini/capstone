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
            foo[hash] = {};
            foo[hash][person] = "read";
            console.log('now trying to get metadata: ', response);
            messages.update(foo);
        })
    });
});