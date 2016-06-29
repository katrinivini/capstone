chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.type === 'read message') {
        sendResponse(gapi.client.gmail.users.messages.get({
        	'id': request.threadId,
            'userId': 'me',
            'format': 'raw'
        }));
    }
    return true;
});
