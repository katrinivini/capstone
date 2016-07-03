// var $ = require('../myapp.js').$;
// var messages = require('../myapp.js').messages;
// var comments = document.createElement('div');
// var messageID;
// var addComment;
// InboxSDK.load('1.0', 'sdk_CapstoneIDK_aa9966850e').then(function(sdk) {
//     var parser = new DOMParser();
//     var submit;
//     var form;
//     var template;
//     var data;
//     $(comments).load(chrome.extension.getURL('/templates/comment.html'), function(page) {
//         return Promise.resolve(parser.parseFromString(page, "text/html"))
//             .then(function(dom) {
//                 form = dom.getElementById('commentForm');
//                 addComment = dom.getElementById('submitComment');

//                 function createComment(person, comment, date) {
//                     console.log("create the comment");
//                     var comm = document.createElement('div');
//                     comm.innerHTML = person + " " + comment + " " + date;
//                     addComment.appendChild(comm);
//                 }

//                 submit = dom.getElementById('submitComment');
//                 submit.addEventListener('click', function(event) {
//                     event.preventDefault();
//                     //update the database, then update the dom with a listener
//                     var person = sdk.User.getAccountSwitcherContactList()[0].name;
//                     var newComment = { person: person, comment: $('#comment').val(), date: new Date() };
//                     if (!data[messageID].comments) data[messageID].comments = [newComment];
//                     else data[messageID].comments.push(newComment);
//                     messages.update(data);
//                 })

//                 sdk.Conversations.registerThreadViewHandler(function(threadView) {
//                     //make the comments sidebar content panel
//                     threadView.addSidebarContentPanel({
//                         el: form,
//                         title: 'Comments',
//                         iconUrl: 'https://cdn2.iconfinder.com/data/icons/windows-8-metro-style/512/comments.png'
//                     })
//                     chrome.runtime.sendMessage({
//                         type: 'read message',
//                         threadId: threadView.getThreadID(),
//                     }, function(response) {
//                         messageID = response;
//                         messages.once('value', function(snapshot) {
//                             // $('#addComment').children().remove();
//                             data = snapshot.val();
//                             // console.log('snapshot of once the page loads: ', data);
//                             if (data[messageID].comments) {
//                                 comments.forEach(function(comment) {
//                                     createComment(comment.person, comment.comment, comment.date);
//                                 })
//                             }
//                             // $('#comment').val('');
//                         });
//                     })
//                 });
//             })
//     })
// });
// //new task, update dom in real time

// // messages.child(messageID).on('child_added', function(snapshot) {
// //     console.log('did you get here?', snapshot.val());
// //     // var thread = snapshot.val();
// //     // var last = thread.comments[thread.comments.length - 1];
// //     // createComment(last.person, last.comment, last.date);
// // });
