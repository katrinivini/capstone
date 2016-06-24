var $ = require('jquery');
var config = {
    apiKey: "AIzaSyA5CO5_leePTtdsTONfC6VDgvCDX57AEpI",
    authDomain: "capstone-gmail-real-time.firebaseapp.com",
    databaseURL: "https://capstone-gmail-real-time.firebaseio.com",
    storageBucket: "capstone-gmail-real-time.appspot.com",
};
firebase.initializeApp(config);
// var root = firebase.database().ref('/hellos');
// root.on('child_added', function(data){
//     console.log(data.val());
// })
// root.push({message: 'hi', ts: window.performance.now()});
// // console.log(database);
// // database.push('hi:)');
// $(loaded => alert('hi'));
// var provider = new firebase.auth.GoogleAuthProvider();
// provider.addScope('https://mail.google.com/');
// firebase.auth().signInWithPopup(provider).then(function(result) {
//   // This gives you a Google Access Token. You can use it to access the Google API.
//   var token = result.credential.accessToken;
//   // The signed-in user info.
//   var user = result.user;
//   // ...
// }).catch(function(error) {
//   // Handle Errors here.
//   var errorCode = error.code;
//   var errorMessage = error.message;
//   // The email of the user's account used.
//   var email = error.email;
//   // The firebase.auth.AuthCredential type that was used.
//   var credential = error.credential;
//   // ...
// });
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
    sdk.Toolbars.addToolbarButtonForApp({
        title: 'USE IDK',
        onClick: function(event) {
            console.log(event);
            var provider = new firebase.auth.GoogleAuthProvider();
            // // provider.addScope('https://mail.google.com');
            firebase.auth().signInWithPopup(provider).then(function(result) {
                // This gives you a Google Access Token. You can use it to access the Google API.
                // var token = result.credential.accessToken;
                // The signed-in user info.
                // var user = result.user;
                // ...
            }).catch(function(error) {
                // Handle Errors here.
                var errorCode = error.code;
                var errorMessage = error.message;
                // The email of the user's account used.
                var email = error.email;
                // The firebase.auth.AuthCredential type that was used.
                var credential = error.credential;
                // ...
            });
            firebase.auth().signOut().then(function() {
                // Sign-out successful.
            }, function(error) {
                // An error happened.
            });
        }
    });
    sdk.Conversations.registerThreadViewHandler(function(threadView) {

        console.log('threadView: ', threadView);
        sdk.Lists.registerThreadRowViewHandler(function(threadRowView) {
            // console.log('getThreadViewID', threadView.getThreadID());
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
