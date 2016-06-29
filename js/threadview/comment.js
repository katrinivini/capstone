var $ = require('../myapp.js').$;
// console.log('$', $);
InboxSDK.load('1.0', 'sdk_CapstoneIDK_aa9966850e').then(function(sdk) {
    sdk.Conversations.registerThreadViewHandler(function(threadView) {
        var comments = document.createElement('div');

        $(comments).load(chrome.extension.getURL('/templates/comments.html'), function(page){
            console.log(page);
        })

        
        threadView.addSidebarContentPanel({
            el: comments,
            title: 'Comments',
            iconUrl: 'https://cdn2.iconfinder.com/data/icons/windows-8-metro-style/512/comments.png'
        })
    })

    sdk.Conversations.registerThreadViewHandler(function(threadView) {
        chrome.runtime.sendMessage({
            type: 'read message',
            threadId: threadView.getThreadID()
        }, function(response) {

            console.log('now trying to get metadata: ', response);

        })
    });
});
