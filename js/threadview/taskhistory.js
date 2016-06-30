var messages = require('../myapp.js').messages;

InboxSDK.load('1.0', 'sdk_CapstoneIDK_aa9966850e').then(function(sdk) {
    sdk.Conversations.registerThreadViewHandler(function(threadView) {
        var taskHistory = document.createElement('div');
        taskHistory.style = "height: 200px; width: 200px";
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
                            var arr = data[hash].activity;
                            foo[k] = {
                                person: person,
                                action: "read again",
                                date: new Date()
                            };
                            arr.push(foo[k])
                            foo[k] = arr;
                        } else {
                            foo[k] = [{
                                person: person,
                                action: "read",
                                date: new Date()
                            }];
                        }
                    }
                    return;
            }))
            .then(function() {
                messages.update(foo);

            })

            // Promise.resolve(messages.on('value', function(snapshot) {
            //     console.log('wooooot')
            //     console.log(snapshot.val()[hash], "<<--SNAPSHOT")
            //         var data = snapshot.val();
            //         if (data && data[hash]) { //thread exists
            //             if (data[hash]) {
            //                 foo[k].push({person: person, action: "read", date: new Date()})
            //             }
            //             else {
            //                 foo[k] = [{person: person, action: "read", date: new Date()}]
            //             }
            //             //foo[k] is messages>hash>activity
            //             //we want it to be an array of objects

            //             // if (data[hash][person]) foo[k] = data[hash][person];
            //             // // console.log(data[hash][person]);
            //             // else { //thread exists but person doesn't
            //             //     foo[k] = {
            //             //         status: 'read',
            //             //         comments: [{message: "", date: ""}],
            //             //         activity: [{action: "", date: ""}]
            //             //     }
            //             // }
            //         } else {
            //             // foo[k] = {
            //             //     status: 'read',
            //             //     comments: [{message: "", date: ""}],
            //             //     activity: [{action: "", date: ""}]
            //             // }
            //         }
            //         return;
            // }))
            // .then(function() {
            //     messages.update(foo);
            // }); // end Promise
        })
    });
});

// function extend(obj, src) {
//     for (var key in src) {
//         if (src.hasOwnProperty(key)) obj[key] = src[key];
//     }
//     return obj;
// }