var $ = require('../myapp.js').$;
// console.log('$', $);
var messages = require('../myapp.js').messages;

InboxSDK.load('1.0', 'sdk_CapstoneIDK_aa9966850e').then(function(sdk) {
    var dateString;
    sdk.Conversations.registerMessageViewHandler(function(messageView) {
        dateString = messageView.getDateString();
    });

    sdk.Conversations.registerThreadViewHandler(function(threadView) {
        var comments = document.createElement('div');
        var message;
        var person;
        $(comments).load(chrome.extension.getURL('/templates/comment.html'), function(page) {
            var submit = document.getElementById('submit');
            console.log(document.getElementById('addComment'));
            submit.addEventListener('click', function(event) {
                event.preventDefault();
                // console.log($('#comment').val());
                chrome.runtime.sendMessage({
                    type: 'add comment',
                    // user: sdk.User.getAccountSwitcherContactList()[0].name,
                    threadId: threadView.getThreadID()
                        // message: $('#comment').val()
                }, function(response) {
                    console.log('what is the response? ', response);
                    var foo = {};
                    var hash = response;
                    person = sdk.User.getAccountSwitcherContactList()[0].name;
                    // var k = hash + '/' + person;
                    Promise.resolve(messages.once('value', function(snapshot) {
                            var data = snapshot.val();
                            console.log(data);
                            foo[hash] = data[hash];
                            // console.log('foo[k]: ', foo[hash]);
                        }))
                        .then(function() {
                            message = $('#comment').val();
                            foo[hash][person].comments.push({
                                message: message,
                                date: dateString
                            });
                            return Promise.resolve(messages.update(foo));
                        })
                        .then(function() {
                            $('#comment').val('');
                            messages.on('child_added', function(data){
                                var comment = document.createElement('div');
                                var name = person.split(' ')[0];
                                comment.innerHTML = name + ": " + message + dateString;
                                var addComment = document.getElementById('addComment');
                                addComment.appendChild(comment);
                                // var div = $('div').text(person + ': ' + message + dateString);
                                // $('#addComment').append(div);
                            })
                        })
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
