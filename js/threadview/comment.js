// var messages = require('../myapp.js').messages;
// var fs = require('fs');
// var path = require('path');
// var commentTemplate = fs.readFileSync(path.resolve(__dirname + '/../../templates/comment.html'), 'utf8');
// var parser = new DOMParser();
// var form;
// var addComment;
// var submit;
// var person;
// var messageID;
// var thread;
// var threadId;
// var dom;
// InboxSDK.load('1.0', 'sdk_CapstoneIDK_aa9966850e').then(function(sdk) {
//     sdk.Conversations.registerThreadViewHandler(function(threadView) {
//         threadId = threadView.getThreadID();
//         Promise.resolve(parser.parseFromString(commentTemplate, 'text/html'))
//             .then(function(DOM) {
//                 dom = DOM;
//                 return Promise.resolve(chrome.runtime.sendMessage({
//                         type: 'read message',
//                         threadId: threadId
//                     }, function(hash) {
//                         console.log('return the messageID', messageID);
//                         messageID = hash;
//                         person = sdk.User.getAccountSwitcherContactList()[0].name;
//                     }))
//                     .then(function() {
//                         return messages.once('value', function(snapshot) {
//                             thread = snapshot.val();
//                             console.log('thread: ', thread);
//                         })
//                     })
//                     .then(function() {
//                         console.log('particular message: ', thread[messageID]);
//                         form = dom.getElementById('commentForm');
//                         addComment = dom.getElementById('addComment');
//                         submit = dom.getElementById('submitComment');
//                         submit.addEventListener('click', function(event) {
//                             event.preventDefault();
//                             //update the database, then update the dom with a listener
//                             person = sdk.User.getAccountSwitcherContactList()[0].name;
//                             var newComment = { person: person, comment: $('#comment').val(), date: new Date() };
//                             if (!thread[messageID].comments) {
//                                 thread[messageID].comments = [newComment];
//                                 messages.child(messageID).update(thread[messageID]);
//                             } else {
//                                 thread[messageID].comments.push(newComment);
//                                 messages.child(messageID).child('comments').update(thread[messageID].comments);
//                             }
//                             // addToComment();

//                         })
//                         threadView.addSidebarContentPanel({
//                             el: form,
//                             title: 'Comments',
//                             iconUrl: 'https://cdn2.iconfinder.com/data/icons/windows-8-metro-style/512/comments.png'
//                         })
//                     })
//             })
//     });
// })

// function addToComment() {
//     messages.child(messageID).child('comments').on('child_added', function(snapshot) {
//         // $('#addComment').children().remove();
//         // console.log('console logging on, child_added, comments', snapshot.val());
//         // var comments = snapshot.val();
//         // comments.forEach(function(c) {
//             var c = snapshot.val();
//             createComment(c.person, c.comment, c.date);
//         // })
//     })
// }

// function createComment(person, comment, date) {
//     // console.log("create the comment");
//     var comm = document.createElement('div');
//     comm.className = 'comment';
//     var d = new Date(date);
//     var time = document.createElement('p');
//     time.className = 'date';
//     time.innerHTML = d;
//     comm.appendChild(time);
//     var person_comment = document.createElement('p');
//     person_comment.innerHTML = '<b>' + person + '</b>' + ": " + comment;
//     comm.appendChild(person_comment);
//     // comm.innerHTML = person + " " + comment + " " + time;
//     addComment.appendChild(comm);
//     $('#comment').val('');
// }
