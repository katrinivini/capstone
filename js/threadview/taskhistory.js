var messages = require('../myapp.js').messages;
var taskHistory = document.createElement('div');
var messageID;
var Firebase = require('firebase');
$ = require('jquery');
// console.log('Firebase: ', Firebase);
InboxSDK.load('1.0', 'sdk_CapstoneIDK_aa9966850e').then(function(sdk) {
    sdk.Conversations.registerThreadViewHandler(function(threadView) {
        threadView.addSidebarContentPanel({
            el: taskHistory,
            title: 'Task History',
            iconUrl: 'https://cdn3.iconfinder.com/data/icons/website-panel-icons/128/test1-13-512.png'
        })
        chrome.runtime.sendMessage({
                type: 'read message',
                threadId: threadView.getThreadID()
            }, function(hash) {
                messageID = hash;
                var person = sdk.User.getAccountSwitcherContactList()[0].name;
                messages.once('value', function(snapshot) { //this is a promise
                        console.log('this is when you read the message: ', snapshot.val());
                        var readMessages = snapshot.val();
                        if (readMessages && readMessages[hash]) { //we have readMessages and the thread
                            var people = Array.prototype.slice.call(readMessages[hash].people)
                            var index = people.indexOf(person);
                            console.log('index: ', index); //{
                            if (index !== -1 && people[index].status == 'read') return;
                            // }
                            console.log('do i get in here???');

                            readMessages[hash].activity.push(eventObj(person, "read"));
                            readMessages[hash].people.push({
                                person: person,
                                status: 'read'
                            })
                            if ($(taskHistory).children()) $(taskHistory).children().remove();
                            readMessages[hash].activity.forEach(function(task) {
                                    var date = new Date(task.date).getTime();
                                    createActivity(task.person, task.action, date)
                            })
                        } else { //we either don't have the readMessages or dont have the thread
                            if (!readMessages) readMessages = {};
                            // messages.ref('/' + hash);
                            readMessages[hash] = {
                                activity: [eventObj(person, "read")],
                                people: [{
                                    person: person,
                                    status: 'read'
                                }]
                            };
                        }
                        return messages.update(readMessages);
                    })
                    .then(function() {
                        messages.child(messageID).child('activity').on('child_added', function(snapshot) {
                            var task = snapshot.val();
                            console.log('new task from task history: ', task);
                            // data[hash].activity.forEach(function(act) {
                            var date = new Date(task.date).getTime();
                            createActivity(task.person, task.action, date);
                            // });
                        });
                    })

            })
            // messages.child(messageID).on('child_added', function(snapshot) {
            //     console.log('this is when you want to listen for an addition to the task history: ', snapshot.val());
            //     var data = snapshot.val();
            //     // var last = data.activity[data.activity.length - 1];
            //     // if (last.date) createActivity(last.person, last.action, last.date);
            // })
    });
});

// thread > activity and comments
// activity > [{person: person, action: action, date: date}]
// comment > [{person:person , comment:comment , date:date}]
function eventObj(p, a) {
    return {
        person: p,
        action: a,
        date: Firebase.database.ServerValue.TIMESTAMP
    }
}

function createActivity(person, action, date) {
    var act = document.createElement('div');
    act.innerHTML = person + " " + action + " " + date;
    taskHistory.appendChild(act);
}










































// // OLD VERSION

// var messages = require('../myapp.js').messages;
// var taskHistory;
// InboxSDK.load('1.0', 'sdk_CapstoneIDK_aa9966850e').then(function(sdk) {
//     sdk.Conversations.registerThreadViewHandler(function(threadView) {
//         taskHistory = document.createElement('div');
//         threadView.addSidebarContentPanel({
//             el: taskHistory,
//             title: 'Task History',
//             iconUrl: 'https://cdn3.iconfinder.com/data/icons/website-panel-icons/128/test1-13-512.png'
//         })
//         chrome.runtime.sendMessage({
//             type: 'read message',
//             threadId: threadView.getThreadID()
//         }, function(hash) {
//             var person = sdk.User.getAccountSwitcherContactList()[0].name;
//             console.log('now trying to get metadata: ', hash);
//             Promise.resolve(messages.once('value', function(snapshot) {
//                     var data = snapshot.val();
//                     if (data && data[hash]) { //we have data and the thread
//                         for (var i = 0; i < data[hash].activity.length; i++) {
//                             if (data[hash].activity[i].person === person && data[hash].activity[i].action === "read") {
//                                 return;
//                             }
//                         }
//                         data[hash].activity.push(eventObj(person, "read"));
//                         messages.update(data);
//                     } else { //we either don't have the data or dont have the thread
//                         if (!data) data = {};
//                         // messages.ref('/' + hash);
//                         data[hash] = {};
//                         data[hash].activity = [eventObj(person, "read")];
//                         messages.update(data);
//                     }
//                 }))
//                 .then(function() {
//                     messages.once('value', function(snapshot) {
//                         var data = snapshot.val();
//                         data[hash].activity.forEach(function(act) {
//                             createActivity(act.person, act.action, act.date);
//                         });
//                     });
//                 })

//         })
//         messages.on('child_changed', function(snapshot) {
//             var data = snapshot.val();
//             var last = data.activity[data.activity.length - 1];
//             if (last.date) createActivity(last.person, last.action, last.date);
//             console.log('someone please read my email: ', snapshot.val());
//         })
//     });
// });

// // thread > activity and comments
// // activity > [{person: person, action: action, date: date}]
// // comment > [{person:person , comment:comment , date:date}]
// function eventObj(p, a) {
//     return {
//         person: p,
//         action: a,
//         date: new Date()
//     }
// }

// function createActivity(person, action, date) {
//     var act = document.createElement('div');
//     act.innerHTML = person + " " + action + " " + date;
//     taskHistory.appendChild(act);
// }