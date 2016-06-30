var messages = require('../myapp.js').messages;
var taskHistory;
InboxSDK.load('1.0', 'sdk_CapstoneIDK_aa9966850e').then(function(sdk) {
    sdk.Conversations.registerThreadViewHandler(function(threadView) {
        taskHistory = document.createElement('div');
        threadView.addSidebarContentPanel({
            el: taskHistory,
            title: 'Task History',
            iconUrl: 'https://cdn3.iconfinder.com/data/icons/website-panel-icons/128/test1-13-512.png'
        })
    })

    // thread > activity and comments
    // activity > [{person: person, action: action, date: date}]
    // comment > [{person:person , comment:comment , date:date}]

    sdk.Conversations.registerThreadViewHandler(function(threadView) {
        chrome.runtime.sendMessage({
            type: 'read message',
            threadId: threadView.getThreadID()
        }, function(response) {
            // foo is {path: content}
            var foo = {};
            var hash = response;
            var person = sdk.User.getAccountSwitcherContactList()[0].name;
            // console.log('person in task history', sdk.User.getAccountSwitcherContactList()[0])
            var k = hash + '/activity' // + person;
            console.log('now trying to get metadata: ', response);
            Promise.resolve(messages.once('value', function(snapshot) {
                    var data = snapshot.val();
                    if (data && data[hash]) {
                        if (data[hash].activity) {
                            // if there is an activity already there
                            // this for loop prevents duplicate action
                            for (var i = 0; i < data[hash].activity.length; i++) {
                                if (data[hash].activity[i].person === person && data[hash].activity[i].action === "read") {
                                    return;
                                }
                            }
                            // otherwise proceed...
                            var arr = data[hash].activity;
                            foo[k] = eventObj(person, "read");
                            var arr = data[hash].activity;
                            arr.push(foo[k]);
                            foo[k] = arr;
                            messages.update(foo);
                            // arr.push(foo[k])
                            // foo[k] = arr;
                        } else {
                            // if this is the first activity, initialize the array
                            foo[k] = [eventObj(person, "read")];
                            messages.update(foo);
                        }
                    }
                    else if (data) {
                        foo[k] = [eventObj(person, "read")];
                        messages.update(foo);
                    }
                    return;
            }))
            .then(function(){
                messages.once('value', function(snapshot){
                    var data = snapshot.val();
                    data[hash].activity.forEach(function(act){
                        createActivity(act.person, act.action, act.date);
                    });
                });
            })
        })
    });
    messages.on('child_changed', function(snapshot){
        console.log('someone please read my email: ', snapshot.val());
    })
});

function eventObj(p, a){
    return {
        person: p,
        action: a,
        date: new Date()
    }
}

function createActivity(person, action, date){
    var act = document.createElement('div');
    act.innerHTML = person + " " + action + " " + date;
    taskHistory.appendChild(act);
}