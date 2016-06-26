var $ = require('jquery');
var config = {
    apiKey: "AIzaSyDPRP1vgm6bQ7SXuVAQtgBS5ewsjJoDLzg",
    authDomain: "capstone1604gha.firebaseapp.com",
    databaseURL: "https://capstone1604gha.firebaseio.com",
    storageBucket: "",
};
firebase.initializeApp(config);
var root = firebase.database().ref('/messages');
root.set({isChanging: false, sender: ""});
// root.on('child_added', function(data) {
//     console.log(data.val());
// })

InboxSDK.load('1.0', 'sdk_CapstoneIDK_aa9966850e').then(function(sdk) {
    // the SDK has been loaded, now do something with it!
    sdk.Compose.registerComposeViewHandler(function(composeView) {

        /* link with info about intervals in inactive windows
         http://stackoverflow.com/questions/5927284/how-can-i-make-setinterval-also-work-when-a-tab-is-inactive-in-chrome */
         console.log('in compose view now whee')
        //see if user has changed their text input
        var interval = 1000; //30fps
        var oldtext = '';
        setInterval(applyChanges, interval);
        var statusbar = composeView.addStatusBar();    

        function applyChanges() {
            try {
                // this will always fire on page load if there is a draft with text in it
                if (oldtext !== composeView.getTextContent()) {
                    // console.log('text is now', composeView.getTextContent());
                    oldtext = composeView.getTextContent();
                    root.update({isChanging: true});
                    root.update({sender: composeView.getFromContact().name})

                    //should not be using 'value' to update this - but child_changed doesn't work? 
                    root.on('value', function(data){
                        // if (data.val() === composeView.getFromContact().name) {
                            // console.log('who is typing: ', composeView.getFromContact().name)
                            statusbar.el.innerHTML = data.val().sender + "<b> is typing right now.</b>"
                            // statusbar.el.innerHTML = composeView.getFromContact().name + "<b> is typing right now.</b>"
                        // }
                    })

                }  else {
                    root.update({isChanging:false});
                    root.update({sender:""})
                    // statusbar.el.innerHTML = composeView.getFromContact().name +  "<b> is not typing right now.</b>";
                }
            } catch (err) {}
        }

        // a compose view has come into existence, do something with it!
        composeView.addButton({
            title: "Itsa me, Mario!",
            iconUrl: 'http://icons.iconarchive.com/icons/ph03nyx/super-mario/128/Paper-Mario-icon.png',
            onClick: function(event) {
                event.composeView.insertTextIntoBodyAtCursor('Hello World!');
            }
        });
    });

    // sdk.Conversations.registerThreadViewHandler(function(threadView) {

    //     console.log('threadView: ', threadView);
    //     sdk.Lists.registerThreadRowViewHandler(function(threadRowView) {
    //         console.log('getThreadViewID', threadView.getThreadID());
    //         //   console.log('did i end up in here');
    //         if (threadView.getThreadID() === threadRowView.getThreadID()) {
    //             console.log()
    //             threadRowView.addLabel({
    //                 title: 'Kathy...',
    //                 foregroundColor: 'white',
    //                 backgroundColor: 'blue'
    //             });
    //         }

    //     });
    // });

});