var messages = require('../myapp.js').messages;


var messageID;
var Firebase = require('firebase');
$ = require('jquery');
// console.log('Firebase: ', Firebase);
InboxSDK.load('1.0', 'sdk_CapstoneIDK_aa9966850e').then(function(sdk) {
    sdk.Conversations.registerThreadViewHandler(function(threadView) {
        var taskHistory = document.createElement('div');
        taskHistory.classList.add('taskHistory');
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
                    // console.log('this is when you read the message: ', snapshot.val());
                    var readMessages = snapshot.val();
                    if (readMessages && readMessages[hash]) { //we have readMessages and the thread
                        readMessages[hash].activity.forEach(function(task) {
                            var date = new Date(task.date);
                            createActivity(task.person, task.action, date)
                        })
                        var people = Array.prototype.slice.call(readMessages[hash].people)
                            // var index = people.indexOf(person);
                        var returnee = people.filter(function(personobj) {
                            return personobj.person === person;
                        });
                        if (returnee && returnee.length > 0 && returnee[0].status === 'read') return;
                        readMessages[hash].activity.push(eventObj(person, "read"));
                        readMessages[hash].people.push({
                            person: person,
                            status: 'read'
                        })
                        // if ($(taskHistory).children()) $(taskHistory).children().remove();
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
                    messages.child(messageID).child('activity').on('child_changed', function(snapshot) {
                        var task = snapshot.val();
                        // console.log('new task from task history: ', task);
                        // console.log('activities:  ', task.activity);
                        // data[hash].activity.forEach(function(act) {
                        var date = new Date(task.date);
                        createActivity(task.person, task.action, date);
                    });
                })

        })
    });
});
