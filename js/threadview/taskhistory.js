var messages = require('../myapp.js').messages;
var fs = require('fs');
var path = require('path')

var commentTemplate = fs.readFileSync(path.resolve(__dirname + '/../../templates/comment.html'), 'utf8');

var person;
var messageID;
var Firebase = require('firebase');
$ = require('jquery');
var thread;
var form;
var addComment;


InboxSDK.load('1.0', 'sdk_CapstoneIDK_aa9966850e').then(function(sdk) {
    var parser = new DOMParser();

    function createActivity(person, action, date) {
        var act = document.createElement('div');
        act.className = 'activity';
        if (action === 'read') act.classList.add('read_activity');
        if (action === 'started draft') act.classList.add('draft_activity')
        act.innerHTML = person + " " + action + " on " + date;
        $('.taskHistory').prepend(act);
    }

    function eventObj(p, a) {
        return {
            person: p,
            action: a,
            date: Firebase.database.ServerValue.TIMESTAMP
        }
    }

    sdk.Conversations.registerThreadViewHandler(function(threadView) {
        var taskHistory = document.createElement('div');
        taskHistory.classList.add('taskHistory');
        // thread > activity and comments
        // activity > [{person: person, action: action, date: date}]
        // comment > [{person:person , comment:comment , date:date}]
        threadView.addSidebarContentPanel({
            el: taskHistory,
            title: 'Task History',
            iconUrl: 'https://cdn3.iconfinder.com/data/icons/website-panel-icons/128/test1-13-512.png'
        })


        
        Promise.resolve(parser.parseFromString(commentTemplate, 'text/html'))
            .then(function(dom) {
                form = dom.getElementById('commentForm');
                addComment = dom.getElementById('addComment');
                var submit = dom.getElementById('submitComment');
                submit.addEventListener('click', function(event) {
                    event.preventDefault();
                    //update the database, then update the dom with a listener
                    person = sdk.User.getAccountSwitcherContactList()[0].name;
                    var newComment = { person: person, comment: $('#comment').val(), date: new Date() };
                    if (!thread[messageID].comments) {
                        thread[messageID].comments = [newComment];
                        messages.child(messageID).update(thread[messageID]);
                    } else {
                        thread[messageID].comments.push(newComment);
                        messages.child(messageID).child('comments').update(thread[messageID].comments);
                    }

                })
                threadView.addSidebarContentPanel({
                        el: form,
                        title: 'Comments',
                        iconUrl: 'https://cdn2.iconfinder.com/data/icons/windows-8-metro-style/512/comments.png'
                    })
            })

        chrome.runtime.sendMessage({
            type: 'read message',
            threadId: threadView.getThreadID()
        }, function(hash) {
            messageID = hash;
            person = sdk.User.getAccountSwitcherContactList()[0].name;
            messages.once('value', function(snapshot) { //this is a promise
                thread = snapshot.val()
                // console.log('we are in messages.once', snapshot.val());
                thread = snapshot.val();
                if (thread && thread[hash]) { //we have thread and the thread

                    var people = Array.prototype.slice.call(thread[hash].people)
                    var returnee = people.filter(function(personobj) {
                        return personobj.person === person;
                    });
                    if (returnee && returnee.length > 0 && returnee[0].status === 'read') return;

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
                readPromise = Promise.resolve(messages.update(thread));
            })

            messages.child(messageID).child('activity').on('child_added', function(snapshot) {
                    // console.log('on snapshot of child_added in taskhistory', snapshot.val());
                    var task = snapshot.val();
                    var date = new Date(task.date);
                    createActivity(task.person, task.action, date);

                })
            messages.child(messageID).child('comments').on('value', function(snapshot) {
                $('#addComment').children().remove();
                // console.log('console logging on, child_added, comments', snapshot.val());
                var comments = snapshot.val();
                comments.forEach(function(c) {
                    createComment(c.person, c.comment, c.date);
                })

            })

        })

        function createComment(person, comment, date) {
            console.log("create the comment");
            var comm = document.createElement('div');
            comm.className = 'comment';
            var d = new Date(date);
            var time = document.createElement('p');
            time.className = 'date';
            time.innerHTML = d;
            comm.appendChild(time);
            var person_comment = document.createElement('p');
            person_comment.innerHTML = '<b>' + person + '</b>' + ": " + comment;
            comm.appendChild(person_comment);
            // comm.innerHTML = person + " " + comment + " " + time;
            addComment.appendChild(comm);
            $('#comment').val('');
        }
    });

    sdk.Compose.registerComposeViewHandler(function(composeView) {
        // once compose view opens, we will get inside here

        // i think we can assume that there is messageid and person already
        // so im not fetching it again

        if (messageID && person && thread) {
            // need to check status of person
            messages.once('value', function(snap){
                var people = Array.prototype.slice.call(thread[messageID].activity);
                var returnee = people.filter(function(personobj) {
                    return personobj.person === person;
                }); 
                if (returnee && returnee.length > 0) {
                    for (var i = 0; i < returnee.length; i++) {
                        console.log('returnee i', returnee[i])
                        if (returnee[i].action === 'started draft') return;
                    };
                }
                thread[messageID].activity.push(eventObj(person, "started draft"));
                draftPromise = Promise.resolve(messages.update(thread));
            })


            messages.child(messageID).child('activity').on('child_added', function(snapshot) {
                // console.log('on snapshot of child_added in taskhistory', snapshot.val());
                var task = snapshot.val();
                var date = new Date(task.date);
                console.log("task", task)
                // createActivity(task.person, task.action, date);
            });
        }
    });

});