// Background script: Listens for requests from content script app.js.
// Making gapi calls a like a rock star!
// Also works with Firebase...because why should content scripts have all the fun?

// Sets up Firebase.
var firebase = require('firebase');
var config = {
    apiKey: "AIzaSyDPRP1vgm6bQ7SXuVAQtgBS5ewsjJoDLzg",
    authDomain: "capstone1604gha.firebaseapp.com",
    databaseURL: "https://capstone1604gha.firebaseio.com",
    storageBucket: "https://capstone1604gha.firebaseio.com",
};
firebase.initializeApp(config);

// Gets messages branch of database.
var messagesDatabase;
var messages = firebase.database().ref('/messages');
var sharedLabels = firebase.database().ref('/sharedLabels');

messages.once('value', function(snapshot) { 
    messagesDatabase = snapshot.val(); 
})



// Listens for requests from content script angular/app.js.
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {

    // console.log("inside sync.js addListener");
    var forwardedTo; 

    var newAssignee;
    var labelID;
    var messageID;
    var messageHash;
    var gmailMessageID;
    var gmailThreadID;
    var threadID;
    var assignee;
    var memberEmailAddress;
    var labelsToAdd;
    var labelsToRemove;
    // var request = request; // why is this line necessary?
    var arrayOfSyncedIDs;
    var query = "newer_than:4d in:inbox to:teamidkgha@gmail.com";
    // var query = "newer_than:1d from:emailkathy@gmail.com OR to:teamidkgha@googlegroups.com OR from:teamidkgha@googlegroups.com to:teamidkgha@gmail.com OR from:teamidkgha@gmail.com OR from:b.emma.lai@gmail.com OR from:rina.krevat@gmail.com OR to:katrinavelez@gmail.com OR from:katrinamvelez@gmail.com";
    // var query = "is:unread newer_than:7d to:teamidkgha@googlegroups.com OR from:teamidkgha@googlegroups.com OR from:b.emma.lai@gmail.com OR from:emailkathy@gmail.com OR from:rina.krevat@gmail.com OR from:katrinamvelez@gmail.com";


    // BELINDAS WORK BELOW FOR SHARED LABELS

    if (request.type === 'get messageId') {

        var messageId;
        var firebaseIdOfMatchingLabel;
        // console.log('threadId in listener', request.threadId);

        gapi.client.gmail.users.messages.get({
            'id': request.threadId,
            'userId': 'me',
            'format': 'metadata'
        })
        .then(function(message) {
            // console.log('here is the message', message);
            var arrayWithMessageIdInside = message.result.payload.headers;

            for (var i = 0; i < arrayWithMessageIdInside.length; i++) {
                if (arrayWithMessageIdInside[i].name === "Message-ID") {
                    //fetch the unique messageId
                    messageId = arrayWithMessageIdInside[i].value
                        // console.log('here is the unique messageId', messageId);
                }
            }
            // get the firebaseId of the label that we want to apply
            sharedLabels.once("value", function(snapshot) {
                // console.log('snapshot of labels', snapshot.val());
                var objOfLabels = snapshot.val();
                return objOfLabels;
            })
            .then(function(thing){
                // console.log('is this a thing', thing);
                // console.log('is this a thing', thing.val());
                var obj = thing.val();
                for (var key in obj) {
                    var singleLabel = obj[key];
                    for (var prop in singleLabel) {
                        if (singleLabel[prop] === request.labelName) {
                            // console.log('thing to match', request.labelName)
                            // console.log('here is the matching one', singleLabel[prop])
                            firebaseIdOfMatchingLabel = key;
                        }
                    }
                } 
                return firebaseIdOfMatchingLabel;
            })
            .then(function(firebaseId){
                // console.log('firebaseId here', firebaseId);
                // console.log('making sure messageid is still right', messageId)
                sharedLabels.child(firebaseId).update({ messageId: messageId });
                sendResponse(firebaseIdOfMatchingLabel)
            })
        })
    } // closes request.type === 'get messageId'

    if (request.type === 'apply sharedLabel') {

        var messagesInFireBase;
        var labelId = []; 
        var threadIdToBeLabelled;

        // console.log('in the listener apply sharedLabel', request)
        
        messages.once('value', function(snapshot) { 

            var hashedMessageId = hashCode(request.messageId) 
            // console.log('here is the hashed version', hashedMessageId);

            gapi.client.gmail.users.labels.list({
                    'userId': 'me'
            })
            .then(function(labels){
                labels.result.labels.forEach(function(labelObj){
                    if (labelObj.name === request.name) {
                        // console.log('here is the gmail label id', labelObj.id)
                        labelId.push(labelObj.id)
                    }
                })
                return labelId; 
            })
            .then(function(){
                messagesInFireBase = snapshot.val(); 
                // console.log("PLEASE WORK", messagesInFireBase[hashedMessageId]["gmailThreadIDs"])
                var threadIdObj = messagesInFireBase[hashedMessageId]["gmailThreadIDs"];
                for (var key in threadIdObj) {
                    // console.log('here are the keys', key);
                    //not goign in here because my threadid isn't in here? 
                    if (threadIdObj[key] === request.me) {
                        threadIdToBeLabelled = key;
                        // console.log('thread id to be labelled', threadIdToBeLabelled)
                    }
                }

                modifyThread('me', threadIdToBeLabelled, labelId, function(response) {
                    sendResponse('response to be sent back to content script', response)
                })
            })

        })

        // refresh the view so that the label is applied in real time 

    }

    if (request.type === 'sync') {

        // Gets list of messages that match query.
        listMessages('me', query, function(response) {
            // response is [{id: gmailMessageID, threadId: gmailThreadID}, ...]
            let arrayOfGmailIdObjects = response;
            let arrayOfGmailMessageIDs = arrayOfGmailIdObjects.map(function(obj) {
                return obj.id;
            });

            arrayOfSyncedIDs = arrayOfGmailMessageIDs.map(syncID);

        }); // closes listMessages

        sendResponse("SYNCHRONIZED BABY!");

    } // closes sync if block

    if (request.type === 'add assign label') {

        console.log("inside add assign label listener");

        assignee = request.assignee;
        labelsToRemove = request.labelsToRemove;
        threadID = request.threadId;

        gapi.client.gmail.users.labels.list({
        'userId': 'me'
        })
        .then(function(response) {

            let arrayOfLabelObjects = response.result.labels;
            let labelDictionary = {};

            for (let obj of arrayOfLabelObjects) {
                labelDictionary[obj.name] = obj.id;
            }

            labelID = labelDictionary[assignee];
            labelsToAdd = [labelID];

            return gapi.client.gmail.users.messages.get({
                'id': threadID,
                'userId': 'me',
                'format': 'metadata'
            });

        })
        .then(function(jsonresp, rawresp) {

            gmailMessageID = jsonresp.result.id;
            gmailThreadID = jsonresp.result.threadId;

            for (var i = 0; i < jsonresp.result.payload.headers.length; i++) {

                if (jsonresp.result.payload.headers[i].name.toUpperCase() === "MESSAGE-ID") {
                    messageID = jsonresp.result.payload.headers[i].value;
                    messageHash = hashCode(messageID);
                }
            }

            // Adds messageHash and its child appliedSharedLabels to messages database if they don't already exist.
            if (!messagesDatabase[messageHash]) messagesDatabase[messageHash] = {};
            if (!messagesDatabase[messageHash].appliedSharedLabels) messagesDatabase[messageHash].appliedSharedLabels = {};
            
            messagesDatabase[messageHash]["appliedSharedLabels"]["Label Name"] = assignee;

            // // Saves updates.
            messages.update(messagesDatabase);

            return gapi.client.gmail.users.threads.modify({
                'userId': 'me',
                'id': gmailThreadID,
                'addLabelIds': labelsToAdd,
                'removeLabelIds': labelsToRemove
            });
        })
        .then(function(response) {
            let megaResponse = {};
            megaResponse["labels"] = response.result.messages[0].labelIds;
            megaResponse["messageID"] = messageHash;
            megaResponse["gmailMessageID"] = gmailMessageID;
            megaResponse["gmailThreadID"] = gmailThreadID;
            sendResponse(megaResponse);

        })
        // .catch(function(error) {
        //     console.log("add label error: ", error);
        // })
    } // closes add assign label if block

    if (request.type === 'sync assignment label') {

        console.log("received sync assignment label message");
        sendResponse("ROGER THAT");

    } // closes sync assignment label if block

}) // closes addListener



// ---------- FUNCTIONS ----------

// Add Gmail label to thread.
function modifyThread(userId, threadId, labelsToAdd, labelsToRemove, callback) {
    var request = gapi.client.gmail.users.threads.modify({
        'userId': userId,
        'id': threadId,
        'addLabelIds': labelsToAdd,
        'removeLabelIds': labelsToRemove
    });
    request.execute(callback);
}

// Get list of user's Gmail labels.
function listLabels(userId, callback) {
    var request = gapi.client.gmail.users.labels.list({
        'userId': userId
    });
    request.execute(callback);
}

// For some godforsaken reason, 'label' should really be 'resource'.
function createLabel(userId, newLabelName, callback) {
    var request = gapi.client.gmail.users.labels.create({
        'userId': userId,
        'resource': {
            'name': newLabelName,
            'labelListVisibility': 'labelShow',
            'messageListVisibility': 'show'
        }
    });
    request.execute(callback);
}

// Using threadID because messageID of 1st msg in thread is same as threadID.
function getMessage(userId, threadId, callback) {
    var request = gapi.client.gmail.users.messages.get({
        'id': threadId,
        'userId': userId,
        'format': 'metadata'
    })
    return request.execute(callback);
}

function listMessages(userId, query, callback) {
    var getPageOfMessages = function(request, result) {
        request.execute(function(resp) {
            result = result.concat(resp.messages);
            var nextPageToken = resp.nextPageToken;
            if (nextPageToken) {
                request = gapi.client.gmail.users.messages.list({
                    'userId': userId,
                    'pageToken': nextPageToken,
                    'q': query
                });
                getPageOfMessages(request, result);
            } else {
                callback(result);
            }
        });
    };
    var initialRequest = gapi.client.gmail.users.messages.list({
        'userId': userId,
        'q': query
    });
    getPageOfMessages(initialRequest, []);
}

// Syncs common messageID with its respective Gmail threadID, which are different for each user.
function syncID(gmailMessageID) {

    let newLabelsToAdd;
    let newLabelsToRemove = [];

    var whoAmI;

    gapi.client.gmail.users.getProfile({
            userId: "me"
    })
    .then(function(response){

        // console.log('from get profile', response)
        whoAmI = response.result.emailAddress; 

        gapi.client.gmail.users.messages.get({
                'id': gmailMessageID,
                'userId': 'me',
                'format': 'metadata'
            })
            .then(function(jsonresp, rawresp) {
                // console.log('HERE IS THE WHOLE JSONRESP', jsonresp);

                for (var i = 0; i < jsonresp.result.payload.headers.length; i++) {

                    if (jsonresp.result.payload.headers[i].name.toUpperCase() === "DELIVERED-TO") {
                        memberEmailAddress = jsonresp.result.payload.headers[i].value;
                    }
                    if (jsonresp.result.payload.headers[i].name.toUpperCase() === "MESSAGE-ID") {
                        messageID = jsonresp.result.payload.headers[i].value;
                    }
                    if (jsonresp.result.payload.headers[i].name.toUpperCase() === "DATE") {
                        var date = jsonresp.result.payload.headers[i].value;
                    }
                    if (jsonresp.result.payload.headers[i].name.toUpperCase() === "TO") {
                        var emailTo = jsonresp.result.payload.headers[i].value;
                    }
                    if (jsonresp.result.payload.headers[i].name.toUpperCase() === "FROM") {
                        var emailFrom = jsonresp.result.payload.headers[i].value;
                    }
                    if (jsonresp.result.payload.headers[i].name.toUpperCase() === "SUBJECT") {
                        var subject = jsonresp.result.payload.headers[i].value;
                    }
                    if (jsonresp.result.payload.headers[i].name.toUpperCase() === "X-FORWARDED-TO") {
                        forwardedTo = jsonresp.result.payload.headers[i].value;
                    }
                }  // closes for loop

                gmailMessageID = jsonresp.result.id;
                gmailThreadID = jsonresp.result.threadId;
                messageHash = hashCode(messageID);

                if (!messagesDatabase) messagesDatabase = {};
                if (!messagesDatabase[messageHash]) messagesDatabase[messageHash] = {};
                if (!messagesDatabase[messageHash].gmailThreadIDs) messagesDatabase[messageHash].gmailThreadIDs = {};

                // BELINDA AND KATHY ADDING STUFF AT 9:20 ON MONDAY NIGHT SO SAD


                messagesDatabase[messageHash]["gmailThreadIDs"][gmailThreadID] = whoAmI;

                if (!messagesDatabase[messageHash].appliedSharedLabels) messagesDatabase[messageHash].appliedSharedLabels = {};
                // messagesDatabase[messageHash].appliedSharedLabels["boogie"] = "woogie";



                // // Saves updates.
                messages.update(messagesDatabase);

                messages.child(messageHash).child("appliedSharedLabels").on("child_added", 
                    function(snapshot) {

                        newAssignee = snapshot.val();

                        console.log("newAssignee: ", newAssignee);

                        if (newAssignee) {

                            console.log(messageHash + " has a new value for appliedSharedLabels: ", newAssignee);

                        }

                        gapi.client.gmail.users.labels.list({
                            'userId': 'me'
                            })
                            .then(function(response) {

                                let newArrayOfLabelObjects = response.result.labels;
                                // let newLabelDictionary = {};

                                // for (let obj of newArrayOfLabelObjects) {
                                //     newLabelDictionary[obj.name] = obj.id;
                                // }

                                // let newLabelID = newLabelDictionary[newAssignee];

                                newArrayOfLabelObjects.forEach(function(labelObject) {
                                    if (labelObject.name === newAssignee) {
                                        newLabelID = labelObject.id;
                                    }
                                })

                                newLabelsToAdd = [newLabelID];

                                console.log("hopefully labelID: ", newLabelID);
                                console.log("newLabelsToAdd: ", newLabelsToAdd);
                                console.log("newAssignee: ", newAssignee);

                                return gapi.client.gmail.users.threads.modify({
                                    'userId': 'me',
                                    'id': gmailThreadID,
                                    'addLabelIds': newLabelsToAdd,
                                    'removeLabelIds': newLabelsToRemove
                                });
                            })

                    })  // closes callback

                return {
                    memberEmailAddress: memberEmailAddress,
                    messageHash: messageHash,
                    gmailThreadID: gmailThreadID,
                    date: date,
                    to: emailTo,
                    from: emailFrom,
                    subject: subject
                };
            })
            .then(function(response) {

                // console.log("email to sync: ", response);

            })
    })

    // .catch(function(error) {
    //     console.log("add label error: ", error);
    // })
} // closes syncID


// Because Firebase doesn't like weird characters.
function hashCode(s) {
    // return s.split("").reduce(function(a, b) { a = ((a << 5) - a) + b.charCodeAt(0);
    //     return a & a }, 0);
    return s.replace(/[^\w\s]/gi, '');
}

function getProfile(userId, callback){
    var request = gapi.client.gmail.users.getProfile({
        userId: userId
    })
    request.execute(callback);
}
