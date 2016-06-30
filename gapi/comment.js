// var getThread = function(userId, threadId, callback) {
//     var  req = gapi.client.gmail.users.messages.get({
//             'id': threadId,
//             'userId': userId,
//             'format': 'metadata'
//         })
//         return req.execute(callback);
// }

// chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
// 	request.user.name;
//     if (request.type === 'add comment') {
//         getThread('me', request.threadId, function(jsonresp) {
//             jsonresp.payload.headers.forEach(function(header){
//             	if (header.name === 'Message-ID') {
            		
//             	}
//             })
//         })
//     }
// })
