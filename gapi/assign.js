// // Listens for requests from content script app.js.
// chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {

//     var messageID;
//     var messageHash;
//     var gmailMessageID;
//     var gmailThreadID;
//     var threadID;
//     var senderName;
//     var megaResponse;
//     var labelsToAdd;
//     var labelsToRemove;
//     var request = request;
    

//     if (request.type === 'add assign label') {

//         labelsToAdd = request.labelsToAdd;
//         labelsToRemove = request.labelsToRemove;
//         threadID = request.threadId;

//         gapi.client.gmail.users.messages.get({
//             'id': request.threadId,
//             'userId': 'me',
//             'format': 'metadata'
//         })
//         .then(function(jsonresp, rawresp) {

//             gmailMessageID = jsonresp.result.id;
//             gmailThreadID = jsonresp.result.threadId;
//             messageID = jsonresp.result.payload.headers[16].value;
//             messageHash = hashCode(messageID);

//             return gapi.client.gmail.users.threads.modify({
//                 'userId': 'me',
//                 'id': gmailThreadID,
//                 'addLabelIds': labelsToAdd,
//                 'removeLabelIds': labelsToRemove
//             });
//         })
//         .then(function(response) {
//             megaResponse = response;
//             megaResponse["messageID"] = messageHash;
//             megaResponse["gmailMessageID"] = gmailMessageID;
//             megaResponse["gmailThreadID"] = gmailThreadID;
//             console.log("megaResponse: ", megaResponse);
//             sendResponse(megaResponse);
//         })
//         // .catch(function(error) {
//         //     console.log("add label error: ", error);
//         // })

//     } else if (request.type === 'list user labels') {

//         listLabels('me', function(response) {

//             var arrayOfLabelObjects = response.labels;
//             var labelDictionary = {};

//             for (var obj of arrayOfLabelObjects) {
//                 labelDictionary[obj.name] = obj.id;
//             }

//             // console.log("labelDictionary: ", labelDictionary);

//             sendResponse(labelDictionary);
//         });

//     }  // closes else if

// })    // closes addListener



// // ---------- FUNCTIONS ----------

// // Add Gmail label to thread.
// function modifyThread(userId, threadId, labelsToAdd, labelsToRemove, callback) {
//     var request = gapi.client.gmail.users.threads.modify({
//         'userId': userId,
//         'id': threadId,
//         'addLabelIds': labelsToAdd,
//         'removeLabelIds': labelsToRemove
//     });
//     request.execute(callback);
// }

// // Get list of user's Gmail labels.
// function listLabels(userId, callback) {
//     var request = gapi.client.gmail.users.labels.list({
//         'userId': userId
//     });
//     request.execute(callback);
// }

// // For some godforsaken reason, 'label' should really be 'resources'.
// function createLabel(userId, newLabelName, callback) {
//     var request = gapi.client.gmail.users.labels.create({
//         'userId': userId,
//         'resources': {
//             'name': newLabelName,
//             'labelListVisibility': 'labelShow',
//             'messageListVisibility': 'show'
//         }
//     });
//     request.execute(callback);
// }

// // Using threadID because messageID of 1st msg in thread is same as threadID.
// function getMessage(userId, threadId, callback) {
//     var request = gapi.client.gmail.users.messages.get({
//         'id': threadId,
//         'userId': userId,
//         'format': 'metadata'
//     })
//     return request.execute(callback);
// }

// function listMessages(userId, query, callback) {
//     var getPageOfMessages = function(request, result) {
//         request.execute(function(resp) {
//             result = result.concat(resp.messages);
//             var nextPageToken = resp.nextPageToken;
//             if (nextPageToken) {
//                 request = gapi.client.gmail.users.messages.list({
//                     'userId': userId,
//                     'pageToken': nextPageToken,
//                     'q': query
//                 });
//                 getPageOfMessages(request, result);
//             } else {
//                 callback(result);
//             }
//         });
//     };
//     var initialRequest = gapi.client.gmail.users.messages.list({
//         'userId': userId,
//         'q': query
//     });
//     getPageOfMessages(initialRequest, []);
// }

// // alternatively, maybe a function that removes the non letter characters?
// function hashCode(s) {
//     // return s.split("").reduce(function(a, b) { a = ((a << 5) - a) + b.charCodeAt(0);
//     //     return a & a }, 0);
//     return s.replace(/[^\w\s]/gi, '');
// }