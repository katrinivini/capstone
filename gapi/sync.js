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
messages.once('value', function(snapshot) { messagesDatabase = snapshot.val(); })




// Listens for requests from content script angular/app.js.
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {

    console.log("inside sync.js addListener");

    var unclear;
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
    var request = request;
    var arrayOfSyncedIDs;
    var query = "newer_than:4d in:inbox to:teamidkgha@googlegroups.com OR from:teamidkgha@gmail.com OR from:b.emma.lai@gmail.com OR from:emailkathy@gmail.com OR from:rina.krevat@gmail.com OR from:katrinamvelez@gmail.com";
    // var query = "newer_than:1d from:emailkathy@gmail.com OR to:teamidkgha@googlegroups.com OR from:teamidkgha@googlegroups.com to:teamidkgha@gmail.com OR from:teamidkgha@gmail.com OR from:b.emma.lai@gmail.com OR from:rina.krevat@gmail.com OR to:katrinavelez@gmail.com OR from:katrinamvelez@gmail.com";
    // var query = "is:unread newer_than:7d to:teamidkgha@googlegroups.com OR from:teamidkgha@googlegroups.com OR from:b.emma.lai@gmail.com OR from:emailkathy@gmail.com OR from:rina.krevat@gmail.com OR from:katrinamvelez@gmail.com";


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
            
            messagesDatabase[messageHash]["appliedSharedLabels"][assignee] = labelID;

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

    let labelsToAdd;
    let labelsToRemove = [];

    gapi.client.gmail.users.messages.get({
            'id': gmailMessageID,
            'userId': 'me',
            'format': 'metadata'
        })
        .then(function(jsonresp, rawresp) {

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
            }  // closes for loop

            gmailMessageID = jsonresp.result.id;
            gmailThreadID = jsonresp.result.threadId;
            messageHash = hashCode(messageID);

            if (!messagesDatabase[messageHash]) messagesDatabase[messageHash] = {};
            if (!messagesDatabase[messageHash].gmailThreadIDs) messagesDatabase[messageHash].gmailThreadIDs = {};

            messagesDatabase[messageHash]["gmailThreadIDs"][gmailThreadID] = memberEmailAddress;

            if (!messagesDatabase[messageHash].appliedSharedLabels) messagesDatabase[messageHash].appliedSharedLabels = {};

            // // Saves updates.
            messages.update(messagesDatabase);

            messages.child(messageHash).child("appliedSharedLabels").on("value", 
                function(snapshot) {

                    let newLabelObject = snapshot.val();

                    if (newLabelObject) {
                        let newLabelObjectKey = Object.keys(newLabelObject)[0];

                        console.log(messageHash + " has a new value for appliedSharedLabels: ", newLabelObject);

                        console.log("hopefully labelID: ", newLabelObject[newLabelObjectKey])

                        var newLabelID = newLabelObject[newLabelObjectKey];
                        labelsToAdd = [newLabelID];
                    }

                    return gapi.client.gmail.users.threads.modify({
                        'userId': 'me',
                        'id': gmailThreadID,
                        'addLabelIds': labelsToAdd,
                        'removeLabelIds': labelsToRemove
                    });

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

            console.log("email to sync: ", response);

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
