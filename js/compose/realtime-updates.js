var messages = require('../myapp.js').messages;

InboxSDK.load('1.0', 'sdk_CapstoneIDK_aa9966850e').then(function(sdk) {
    // the SDK has been loaded, now do something with it!
    sdk.Compose.registerComposeViewHandler(function(composeView) {

        /* link with info about intervals in inactive windows
         http://stackoverflow.com/questions/5927284/how-can-i-make-setinterval-also-work-when-a-tab-is-inactive-in-chrome */
        console.log('in compose view now whee');
        //see if user has changed their text input
        var interval = 1000; //30fps
        var oldtext = '';
        setInterval(applyChanges, interval);
        var statusbar = composeView.addStatusBar();

        function applyChanges() {
            try {
                // this will always fire on page load if there is a draft with text in it
                if (oldtext !== composeView.getTextContent()) {
                    oldtext = composeView.getTextContent();
                    messages.update({ isChanging: true });
                    messages.update({ sender: composeView.getFromContact().name })

                    //should not be using 'value' to update this - but child_changed doesn't work? 
                    messages.on('value', function(data) {
                        statusbar.el.innerHTML = data.val().sender + "<b> is typing right now.</b>"

                    })

                } else {
                    messages.update({ isChanging: false });
                    messages.update({ sender: "" })
                }
            } catch (err) {}
        }

    });    
});