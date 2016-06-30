var $ = require('../myapp.js').$;
// console.log('$', $);
var messages = require('../myapp.js').messages;
var comments = document.createElement('div');
var message;
var person;
var hash;
InboxSDK.load('1.0', 'sdk_CapstoneIDK_aa9966850e').then(function(sdk) {
    sdk.Conversations.registerThreadViewHandler(function(threadView) {
        //make the comments sidebar content panel
        threadView.addSidebarContentPanel({
            el: comments,
            title: 'Comments',
            iconUrl: 'https://cdn2.iconfinder.com/data/icons/windows-8-metro-style/512/comments.png'
        })
        var messageID;
        chrome.runtime.sendMessage({
            type: 'read message',
            threadId: threadView.getThreadID()
        }, function(response) {
            messageID = response;
            messages.once('value', function(snapshot) {

                var data = snapshot.val();
                console.log('data, please get here: ', data);
                console.log(messageID);
                if (data && data[messageID]) {
                    var name = sdk.User.getAccountSwitcherContactList()[0].name;
                    console.log('get in here please');
                    // var last = data[messageID][name].comments[data[messageID][name].comments.length - 1];
                    var comments = data[messageID][name].comments;
                    comments.forEach(function(comment) {
                        var comm = document.createElement('div');
                        var first = name.split(' ')[0];
                        comm.innerHTML = first + ": " + comment.message + comment.date;
                        var addComment = document.getElementById('addComment');
                        if (comment.date) addComment.appendChild(comm);
                    })
                }
            });

        })

        $(comments).load(chrome.extension.getURL('/templates/comment.html'), function(page) {
            var submit = document.getElementById('submit');
            console.log(document.getElementById('addComment'));
            console.log('comments page: ', page);
            submit.addEventListener('click', function(event) {
                event.preventDefault();
                // chrome.runtime.sendMessage({
                //     type: 'add comment',
                //     threadId: threadView.getThreadID()
                // }, function(response) {
                var foo = {};
                // hash = response;
                person = sdk.User.getAccountSwitcherContactList()[0].name;
                Promise.resolve(messages.on('value', function(snapshot) {
                        var data = snapshot.val();
                        foo[messageID] = data[messageID];
                    }))
                    .then(function() {
                        message = $('#comment').val();
                        foo[messageID][person].comments.push({
                            message: message,
                            date: new Date()
                        });
                        return Promise.resolve(messages.update(foo));


                    })
                    .then(function() {
                        $('#comment').val('');
                    })
                    // })
            })
        })
        messages.on('child_changed', function(snapshot) {
            console.log('value ', snapshot.val());
            var data = snapshot.val();
            console.log('snapshot: ', snapshot.val());
            // console.log('data, please get here: ', data);
            // if (data && data[messageID]) {
            var name = sdk.User.getAccountSwitcherContactList()[0].name;
            // console.log('get in here please');
            var last = data[name].comments[data[name].comments.length - 1];
            // var comments = data[messageID][name].comments;
            // comments.forEach(function(commemt) {
            var comm = document.createElement('div');
            var first = name.split(' ')[0];
            comm.innerHTML = first + ": " + last.message + last.date;
            var addComment = document.getElementById('addComment');
            if (last.date) addComment.appendChild(comm);
            // })
            // }
        });
    })
})
