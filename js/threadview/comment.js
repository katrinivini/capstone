var $ = require('../myapp.js').$;
var messages = require('../myapp.js').messages;
var comments = document.createElement('div');

var messageID;
var addComment;
InboxSDK.load('1.0', 'sdk_CapstoneIDK_aa9966850e').then(function(sdk) {
    $(comments).load(chrome.extension.getURL('/templates/comment.html'), function(page) {
        // var threadId;
        var parser = new DOMParser();
        var doc = parser.parseFromString(page, "text/html");
        addComment = doc.getElementById('addComment');
        var data;

        var submit = doc.getElementById('submitComment');
        submit.addEventListener('click', function(event) {
            event.preventDefault();
            console.log("i submitted a comment");
            //update the database, then update the dom with a listener
            var person = sdk.User.getAccountSwitcherContactList()[0].name;
            var newComment = { person: person, comment: $('#comment').val(), date: new Date() };
            console.log('what does data[messageID look like?: ', data[messageID]);
            if (!data[messageID].comments) data[messageID].comments = [newComment];
            else data[messageID].comments.push(newComment);
            messages.update(data)
        })



        sdk.Conversations.registerThreadViewHandler(function(threadView) {
            //make the comments sidebar content panel
            // threadId = threadView.getThreadID();
            console.log('get in the threadView handler for comment.js');
            var form = doc.getElementById('commentForm');
            threadView.addSidebarContentPanel({
                el: form,
                title: 'Comments',
                iconUrl: 'https://cdn2.iconfinder.com/data/icons/windows-8-metro-style/512/comments.png'
            })
            console.log(doc.getElementById('commentForm'));
            chrome.runtime.sendMessage({
                type: 'read message',
                threadId: threadView.getThreadID(),
            }, function(response) {
                messageID = response;
                console.log('messageID from comment.js: ', messageID);
                messages.once('value', function(snapshot) {
                    $('#addComment').children().remove();
                    data = snapshot.val();
                    console.log('snapshot of once the page loads: ', data);
                    if (data[messageID].comments) {
                        console.log('data: messageID', snapshot.val());
                        comments.forEach(function(comment) {
                            createComment(comment.person, comment.comment, comment.date);
                        })
                    }

                });
            })

        });

    });

    messages.on('child_changed', function(snapshot) {
        console.log('did you get here?');
        var thread = snapshot.val();
        var last = thread.comments[thread.comments.length - 1];
        createComment(last.person, last.comment, last.date);
    })
});

function createComment(person, comment, date) {
    console.log("create the comment");
    var comm = document.createElement('div');
    comm.innerHTML = person + " " + comment + " " + date;
    addComment.appendChild(comm);
}
