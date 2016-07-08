var Firebase = require('firebase');
var sharedLabels = require('../myapp.js').sharedLabels;
// var Firebase = require('../myapp.js').Firebase;
var messages = require('../myapp.js').messages;

InboxSDK.load('1.0', 'sdk_CapstoneIDK_aa9966850e').then(function(sdk) {
    
    //ON INBOXSDK LOAD - ALWAYS LISTEN FOR THE FACT THAT A SHARED LABEL WITH YOUR NAME WAS ADDED

    var myOwnEmail; 

    sharedLabels.on('child_added', function(snapshot) { 
        var newLabelAdded = snapshot.val(); 
        var newLabelName = newLabelAdded.label; 
        console.log('something was added to shared labels', snapshot.val())
        // if your email is included in the 'members' array of the new label aka if someone included you on a new shared label, then you want to go and create that new label in gmail
        var newLabelPeople = [];
        newLabelAdded.members.forEach(function(member){
            newLabelPeople.push(member.email)
        })
        console.log('here is an array of ppl', newLabelPeople)

        //fetch your own email address
        chrome.runtime.sendMessage({
            type: 'get profile'
        }, function(gapiResponse) {
            console.log('here is my personal email', gapiResponse)
            myOwnEmail = gapiResponse;
        });

        if (newLabelPeople.indexOf(myOwnEmail) >= 0) {
            console.log('YES MY EMAIL IS IN HERE')
            chrome.runtime.sendMessage({
                type: 'create sharedLabel', 
                name: newLabelName
            }, function(gapiResponse) {
                console.log('here is the response after i created that shared label for you', gapiResponse);
            });
        }
    })

    var messageID;
    var threadId;
    var taskHistory;
    var person = sdk.User.getAccountSwitcherContactList()[0].name;
    
    //register that you're in thread view
    sdk.Conversations.registerThreadViewHandler(function(threadView) {
        threadId = threadView.getThreadID();
    })

    //create new button in threadview to apply shared labels
    sdk.Toolbars.registerToolbarButtonForThreadView({
        title: 'Shared Labels',
        iconUrl: 'https://qph.ec.quoracdn.net/main-qimg-a2ed001082fee51d1af874d5319ab5c1?convert_to_webp=true',
        section: 'METADATA_STATE',
        hasDropdown: true,
        onClick: function(event) {
            var e = event;

            var labels = []; 
            sharedLabels.once('value', function(snapshot){
                var data = snapshot.val(); 
                // console.log('obj of label objs here', data)
                var properties = Object.getOwnPropertyNames(data);
                properties.map(function(prop){
                    // console.log('firebase id of label', prop)
                    var obj = {labelName: data[prop].label, sharedWith: data[prop].members };
                    console.log('label is shared with these ppl', obj.sharedWith)
                    labels.push(obj);
                    return labels; 
                });
            })
            .then(function(){
                //create a dropdown of all the shared labels from firebase

                //make the div for the shared templates dropdown
                event.dropdown.el.className = "labels-dropdown";

                var dropdownTitle = document.createElement('div');
                dropdownTitle.innerHTML = "Apply a Shared Label";
                dropdownTitle.className = "labels-dropdown-title";
                event.dropdown.el.appendChild(dropdownTitle)

                labels.forEach(function(label){

                    //make each template item 
                    var item = document.createElement('div');
                    item.className = "labels-dropdown-item";

                    item.innerHTML = label.labelName;

                    event.dropdown.el.appendChild(item);

                    //attach a click event on each of these shared labels
                    item.addEventListener('click', function(event){
                        chrome.runtime.sendMessage({
                            type: 'apply sharedLabel', 
                            labelName: label.labelName,
                            applyTo: label.sharedWith
                        })
                    })
                })
            });
        }
    });
});
