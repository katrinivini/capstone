var $ = require('jquery');
var config = {
    apiKey: "AIzaSyA5CO5_leePTtdsTONfC6VDgvCDX57AEpI",
    authDomain: "capstone-gmail-real-time.firebaseapp.com",
    databaseURL: "https://capstone-gmail-real-time.firebaseio.com",
    storageBucket: "capstone-gmail-real-time.appspot.com",
};
firebase.initializeApp(config);
var root = firebase.database().ref('/hellos');
root.on('child_added', function(data){
    console.log(data.val());
})
root.push({message: 'hi', ts: window.performance.now()});
// console.log(database);
// database.push('hi:)');
$(loaded => alert('hi'));
InboxSDK.load('1.0', 'sdk_CapstoneIDK_aa9966850e').then(function(sdk) {
    // the SDK has been loaded, now do something with it!
    sdk.Compose.registerComposeViewHandler(function(composeView) {

        // a compose view has come into existence, do something with it!
        composeView.addButton({
            title: "Itsa me, Mario!",
            iconUrl: 'http://icons.iconarchive.com/icons/ph03nyx/super-mario/128/Paper-Mario-icon.png',
            onClick: function(event) {
                event.composeView.insertTextIntoBodyAtCursor('Hello World!');
            }
        });
    });
    sdk.Conversations.registerThreadViewHandler(function(threadView) {

        console.log('threadView: ', threadView);
        sdk.Lists.registerThreadRowViewHandler(function(threadRowView) {
            console.log('getThreadViewID', threadView.getThreadID());
            //   console.log('did i end up in here');
            if (threadView.getThreadID() === threadRowView.getThreadID()) {
                console.log()
                threadRowView.addLabel({
                    title: 'Kathy...',
                    foregroundColor: 'white',
                    backgroundColor: 'blue'
                });
            }

        });
    });

});
