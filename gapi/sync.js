// background script: making gapi calls a like a rock star!

var firebase = require('firebase');
var config = {
    apiKey: "AIzaSyDPRP1vgm6bQ7SXuVAQtgBS5ewsjJoDLzg",
    authDomain: "capstone1604gha.firebaseapp.com",
    databaseURL: "https://capstone1604gha.firebaseio.com",
    storageBucket: "https://capstone1604gha.firebaseio.com",
};

firebase.initializeApp(config);

var messages = firebase.database().ref('/messages');
var sharedLabels = firebase.database().ref('/sharedLabels');



messages.once('value', function(snapshot) { messagesDatabase = snapshot.val(); })
    // Listens for requests from content script mysync.js.
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {

    // console.log("inside sync.js addListener");

    var messageHash;
    var gmailMessageID;
    var gmailThreadID;
    var threadID;
    var memberEmailAddress;
    var megaResponse;
    var labelsToAdd;
    var labelsToRemove;
    var request = request;
    var arrayOfSyncedIDs;
    var query = "is:unread newer_than:7d to:teamidkgha@googlegroups.com OR from:teamidkgha@googlegroups.com OR from:b.emma.lai@gmail.com OR from:emailkathy@gmail.com OR from:rina.krevat@gmail.com OR from:katrinamvelez@gmail.com";

    if (request.type === 'sync') {

        // Gets list of messages that match query.
        listMessages('me', query, function(response) {
            // response is [{id: gmailMessageID, threadId: gmailThreadID}, ...]
            let arrayOfGmailIdObjects = response;
            console.log("sync.js listMessages response: ", arrayOfGmailIdObjects);
            let arrayOfGmailMessageIDs = arrayOfGmailIdObjects.map(function(obj) {
                return obj.id;
            });
            console.log("arrayOfGmailMessageIDs: ", arrayOfGmailMessageIDs);
            arrayOfSyncedIDs = arrayOfGmailMessageIDs.map(syncID);

        }); // closes listMessages

    } // closes if block
    // console.log("arrayOfSyncedIDs: ", arrayOfSyncedIDs);
    // sendResponse("heyo from sync.js");


    // BELINDAS WORK BELOW FOR SHARED LABELS

    if (request.type === 'get messageId') {

        var messageId;
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
                    var messageId = arrayWithMessageIdInside[i].value
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
                            var firebaseIdOfMatchingLabel = key;
                        }
                    }
                } 
                return firebaseIdOfMatchingLabel;
            })
            .then(function(firebaseId){
                // console.log('firebaseId here', firebaseId);
                // console.log('making sure messageid is still right', messageId)
                sharedLabels.child(firebaseId).update({ messageId: messageId });
            })
        })
    } // closes request.type === 'get messageId'

    if (request.type === 'apply sharedLabel') {
        console.log('in the listener apply sharedLabel', request)
        //receive the label name and the thread id for which the label should be applied
        // call a function that will apply this label 
        // refresh the view so that the label is applied in real time 

    }

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

function createLabel(userId, newLabelName, callback) {
    var request = gapi.client.gmail.users.labels.create({
        'userId': userId,
        'label': {
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
            }

            gmailMessageID = jsonresp.result.id;
            gmailThreadID = jsonresp.result.threadId;
            messageHash = hashCode(messageID);

            if (!messagesDatabase[messageHash]) messagesDatabase[messageHash] = {};

            // // Saves updates.
            messages.update(messagesDatabase);



            return {
                memberEmailAddress: memberEmailAddress,
                messageHash: messageHash,
                gmailThreadID: gmailThreadID
            };
        })
        .then(function(response) {

            // messages.child(messageHash).child("gmailThreadIDs")[response.gmailThreadID] = response.memberEmailAddress;

            if (!messagesDatabase[response.messageHash].gmailThreadIDs) messagesDatabase[response.messageHash].gmailThreadIDs = {};

            messagesDatabase[response.messageHash]["gmailThreadIDs"][response.gmailThreadID] = response.memberEmailAddress;

            // Saves updates.
            messages.update(messagesDatabase);

        })
        // .catch(function(error) {
        //     console.log("add label error: ", error);
        // })
} // closes syncID

// alternatively, maybe a function that removes the non letter characters?
function hashCode(s) {
    // return s.split("").reduce(function(a, b) { a = ((a << 5) - a) + b.charCodeAt(0);
    //     return a & a }, 0);
    return s.replace(/[^\w\s]/gi, '');
}
