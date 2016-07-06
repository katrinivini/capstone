var messageID;
var messages = require('../myapp.js').messages;
var person;
var threadId;
var thread;

InboxSDK.load('1.0', 'sdk_CapstoneIDK_aa9966850e').then(function(sdk) {
    sdk.Conversations.registerThreadViewHandler(function(threadView) {
            threadId = threadView.getThreadId();
        })
        // .then(function() {
    messages.once('value', function(snapshot) {
            thread = snapshot.val();
        })
        // })
        .then(function() {
            chrome.runtime.sendMessage({
                type: 'read message',
                threadId: threadId
            }, function(hash) {
                messageID = hash;
                person = sdk.User.getAccountSwitcherContactList()[0].name;
            });
        })

    sdk.Compose.registerComposeViewHandler(function(composeView) {
        // once compose view opens, we will get inside here

        // i think we can assume that there is messageid and person already
        // so im not fetching it again

        if (messageID && person && thread) {

            // fires after 'sent' button is pressed
            composeView.on('presending', function() {
                thread[messageID].activity.push(eventObj(person, "sent a response"));
                messages.update(thread);
            });

            var statusbar = composeView.addStatusBar();

            // need to check status of person
            messages.once('value', function(snap) {
                var people = Array.prototype.slice.call(thread[messageID].activity);
                var returnee = people.filter(function(personobj) {
                    return personobj.person === person;
                });
                if (returnee && returnee.length > 0) {
                    for (var i = 0; i < returnee.length; i++) {
                        // console.log('returnee i', returnee[i])
                        if (returnee[i].action === 'started draft') return;
                    };
                }
                thread[messageID].activity.push(eventObj(person, "started draft"));
                messages.update(thread);
            });


            // messages.child(messageID).child('activity').on('child_added', function(snapshot) {
            //     // console.log('on snapshot of child_added in taskhistory', snapshot.val());
            //     var task = snapshot.val();
            //     var date = new Date(task.date);
            //     console.log("task", task)
            //         // createActivity(task.person, task.action, date);
            // });

            messages.child(messageID).child('realtime').on('value', function(snapshot) {
                var persontyping = snapshot.val();
                if (persontyping && (persontyping !== person)) {
                    statusbar.el.innerHTML = '<p class="realtimetyping">' + persontyping + " is typing...</p>";
                } else {
                    statusbar.el.innerHTML = "";
                }
            })


        } // end if

        var typingTimer;
        var doneTypingInterval = 500;
        var oldtext = '' + composeView.getTextContent();

        function keyDown(e) {
            // ignore R, T, Q, W and command keys
            var keycode = e.keyCode;
            var valid =
                (keycode > 47 && keycode < 58) || // number keys
                keycode == 32 || keycode == 13 || // spacebar & return key(s) (if you want to allow carriage returns)
                (keycode > 64 && keycode < 91) || // letter keys
                (keycode > 95 && keycode < 112) || // numpad keys
                (keycode > 185 && keycode < 193) || // ;=,-./` (in order)
                (keycode > 218 && keycode < 223); // [\]' (in order)
            if (valid && e.which !== 82 && e.which !== 84 && e.which !== 81 && e.which !== 87) {
                try {
                    // console.log('typing')
                    clearTimeout(typingTimer);
                    if (!thread[messageID].realtime) {
                        thread[messageID].realtime = person;
                        messages.update(thread);
                    }
                } catch (err) {}
            }
        }

        function keyUp(e) {
            clearTimeout(typingTimer);
            typingTimer = setTimeout(doneTyping, doneTypingInterval);

        }

        function doneTyping() {
            if (messageID && person && thread) {
                if (thread[messageID].realtime) {
                    thread[messageID].realtime = null;
                    messages.update(thread);
                }
            }
        }

        function eventObj(p, a) {
            return {
                person: p,
                action: a,
                date: Firebase.database.ServerValue.TIMESTAMP
            }
        }
        (function checkForNewIframe(doc) {
            if (!doc) return; // document does not exist.
            doc.addEventListener('keydown', keyDown, true);
            doc.addEventListener('keyup', keyUp, true);
            doc.hasSeenDocument = true;
            for (var i = 0, contentDocument; i < frames.length; i++) {
                try {
                    contentDocument = iframes[i].document;
                } catch (e) {
                    continue;
                }
                if (contentDocument && !contentDocument.hasSeenDocument) {
                    checkForNewIframe(iframes[i].contentDocument);
                }
            }
            setTimeout(checkForNewIframe, 250, doc); // <-- delay of 1/4 second
        })(document);

    }); // end composeview
});
