var $ = require('../myapp.js').$;
// console.log('$', $);
var messages = require('../myapp.js').messages;

InboxSDK.load('1.0', 'sdk_CapstoneIDK_aa9966850e').then(function(sdk) {
    sdk.Conversations.registerThreadViewHandler(function(threadView) {
        var comments = document.createElement('div');
        var message;
        var person;
        var hash;
        $(comments).load(chrome.extension.getURL('/templates/comment.html'), function(page) {
            var submit = document.getElementById('submit');
            console.log(document.getElementById('addComment'));
            submit.addEventListener('click', function(event) {
                event.preventDefault();
                chrome.runtime.sendMessage({
                    type: 'add comment',
                    threadId: threadView.getThreadID()
                }, function(response) {
                    // var foo = {};
                    var data;
                    hash = response;
                    person = sdk.User.getAccountSwitcherContactList()[0].name;
                    Promise.resolve(messages.once('value', function(snapshot) {
                            data = snapshot.val();
                            // foo[hash] = data[hash];
                        }))
                        .then(function() {
                            message = $('#comment').val();
                            data[hash].comments.push({
                                person: person,
                                comment: message,
                                date: new Date()
                            });
                            return Promise.resolve(messages.update(data));


                        })
                        .then(function() {
                            $('#comment').val('');
                            messages.on('child_added', function(snapshot) {
                                console.log('child_added: ', snapshot.val());
                                var data = snapshot.val();
                                // console.log('data, please get here: ', data);
                                // if (data && data[messageID]) {
                                    var name = sdk.User.getAccountSwitcherContactList()[0].name;
                                    // console.log('get in here please');
                                    var last = data.comments[data.comments.length - 1];
                                    // var comments = data[messageID][name].comments;
                                    // comments.forEach(function(commemt) {
                                    var comm = document.createElement('div');
                                    var first = name.split(' ')[0];
                                    comm.innerHTML = first + ": " + last.comment + last.date;
                                    var addComment = document.getElementById('addComment');
                                    if (last.date) addComment.appendChild(comm);
                                    // })
                                // }
                            });
                        })
                })
            })
        })


        threadView.addSidebarContentPanel({
            el: comments,
            title: 'Comments',
            iconUrl: 'https://cdn2.iconfinder.com/data/icons/windows-8-metro-style/512/comments.png'
        })
    })
    var messageID;
    sdk.Conversations.registerThreadViewHandler(function(threadView) {
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
                    var comments = data[messageID].comments;
                    comments.forEach(function(comment) {
                        var comm = document.createElement('div');
                        var first = name.split(' ')[0];
                        comm.innerHTML = first + ": " + comment.comment + comment.date;
                        var addComment = document.getElementById('addComment');
                        if (comment.date) addComment.appendChild(comm);
                    })
                }
            });

        })
    });
});