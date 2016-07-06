var person;
var messageID;
var Firebase = require('firebase');
$ = require('jquery');
var thread;
var threadId;
var messages = require('../myapp.js').messages;
var taskHistory;


function eventObj(p, a) {
    return {
        person: p,
        action: a,
        date: Firebase.database.ServerValue.TIMESTAMP
    }
}

InboxSDK.load('1.0', 'sdk_CapstoneIDK_aa9966850e').then(function(sdk) {
    sdk.Conversations.registerThreadViewHandler(function(threadView) {
        threadId = threadView.getThreadID();
        taskHistory = document.createElement('div');
        taskHistory.classList.add('taskHistory');




        // thread > activity and comments
        // activity > [{person: person, action: action, date: date}]
        // comment > [{person:person , comment:comment , date:date}]
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
            person = sdk.User.getAccountSwitcherContactList()[0].name;
            messages.once('value', function(snapshot) { //this is a promise
                console.log('hello messages once');
                thread = snapshot.val()
                    // console.log('we are in messages.once', snapshot.val());
                thread = snapshot.val();
                if (thread && thread[hash]) { //we have thread and the thread

                    var people = Array.prototype.slice.call(thread[hash].people)
                    var returnee = people.filter(function(personobj) {
                        return personobj.person === person;
                    });
                    if (returnee && returnee.length > 0 && returnee[0].status === 'read') {
                        messages.child(messageID).child('activity').on('child_added', function(snapshot) {
                            console.log('on snapshot of child_added in taskhistory', snapshot.val());
                            var task = snapshot.val();
                            var date = new Date(task.date);
                            createActivity(task.person, task.action, date);
                        })
                        return;
                    }

                    thread[hash].activity.push(eventObj(person, "read"));
                    thread[hash].people.push({
                        person: person,
                        status: 'read'
                    })

                } else { //we either don't have the thread or dont have the thread
                    if (!thread) thread = {};
                    thread[hash] = {
                        activity: [eventObj(person, "read")],
                        people: [{
                            person: person,
                            status: 'read'
                        }]
                    };
                }
                messages.update(thread)
                    .then(function() {
                        addToTaskHistory();
                    })
            })
        })

    })

});

function addToTaskHistory() {
    messages.child(messageID).child('activity').on('child_added', function(snapshot) {
        console.log('on snapshot of child_added in taskhistory', snapshot.val());
        var task = snapshot.val();
        var date = new Date(task.date);
        createActivity(task.person, task.action, date);
    })
}

function createActivity(person, action, date) {
    console.log('create the activity');
    var act = document.createElement('div');
    act.className = 'activity';
    if (action === 'read') act.classList.add('read_activity');
    if (action === 'started draft') act.classList.add('draft_activity');
    if (action === 'sent a response') act.classList.add('sent_activity');
    act.innerHTML = person + " " + action + " on " + date;
    $('.taskHistory').prepend(act);
}
