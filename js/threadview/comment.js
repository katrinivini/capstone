var $ = require('../myapp.js').$;
// console.log('$', $);
var messages = require('../myapp.js').messages;
// var rinaTestBranch = require('../myapp.js').rinaTestBranch;
InboxSDK.load('1.0', 'sdk_CapstoneIDK_aa9966850e').then(function(sdk) {
    var comments = document.createElement('div');
    var message;
    var person;
    var hash;
    sdk.Conversations.registerThreadViewHandler(function(threadView) {
        //make the comments sidebar content panel
        threadView.addSidebarContentPanel({
            el: comments,
            title: 'Comments',
            iconUrl: 'https://cdn2.iconfinder.com/data/icons/windows-8-metro-style/512/comments.png'
        });
        var messageID;
        chrome.runtime.sendMessage({
            type: 'read message',
            threadId: threadView.getThreadID()
        }, function(response) {
            messageID = response;
            console.log('messageID is', messageID)
            //messages.once('value', function(snapshot){});
        });

        console.log("hermione granger")

        //loads the comment box 
        $(comments).load(chrome.extension.getURL('/templates/comment.html'), function(page){
            console.log("harry potter")
            console.log("document", document)
            console.log("page", page)
            console.log("form", $('#awesomeform'))
            // var submit = document.getElementById('submit');
            var commentsubmit = document.getElementById('commentsubmit');
            console.log("hey",$('#commentsubmit'))
            $('#awesomeform').submit(function(event) {
                event.preventDefault();
                alert("you clicked");
                
                // chrome.runtime.sendMessage({
                //     type: 'add comment',
                //     threadId: threadView.getThreadID() //<-- is this correct?
                // }, function(response) {
                //     console.log("we got a response")
                //     // var foo = {};
                //     // person = sdk.User.getAccountSwitcherContactList()[0].name;
                //     // console.log("the person is", person)
                //     // Promise.resolve(messages.once('value', function(snapshot) {
                //     //         var data = snapshot.val();
                //     //         var k = messageID + '/comment';
                //     // }))
                //     // .then(function() {
                //     //     if (data && data[messageID]) {
                //     //         // this is not the first comment on the page
                //     //         if (data[messageID].comment) {
                //     //             // if this is a repeat comment, ignore
                //     //             for (var i = 0; i < data[messageID].comment.length; i++) {
                //     //                 if (data[messageID].comment[i].person === person && data[messageID].comment[i].comment === $('#comment').val()) {
                //     //                     return;
                //     //                 }
                //     //             }
                //     //             // otherwise, proceed....
                //     //             var arr = data[messageID].comment;
                //     //             foo[k] = commentObj(person, $('#comment').val());
                //     //             arr.push(foo[k]);
                //     //             foo[k] = arr;
                //     //             messages.update(foo);
                //     //         } // end if
                //     //     } // end if
                //     // })
                //     // .then(function(){
                //     //     $('#comment').val(''); // reset the comment box to empty
                //     // }) // end Promise chain
                // }) // end chrome runtime
            }); // end submit event listener
        }); // end comments.load
    }); // end sdk
}); // end inbox sdk

function commentObj(p, c) {
    return {
        person: p,
        comment: c,
        date: new Date()
    }
}