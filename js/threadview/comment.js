var $ = require('../myapp.js').$;
// console.log('$', $);
InboxSDK.load('1.0', 'sdk_CapstoneIDK_aa9966850e').then(function(sdk) {
    sdk.Conversations.registerThreadViewHandler(function(threadView) {
        var comments = document.createElement('div');

        $(comments).load(chrome.extension.getURL('/templates/comment.html'), function(page){
            var submit = document.getElementById('submit');
            submit.addEventListener('click', function(event){
                event.preventDefault();
                console.log($('#comment').val());
                chrome.runtime.sendMessage({
                    type: 'add comment',
                    user: sdk.User.getAccountSwitcherContactList(),
                    threadId: threadView.getThreadID(),
                    message: $('#comment').val()
                })
            });
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