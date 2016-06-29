chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    console.log('trying to read message');
    if (request.type === 'read message') {
        console.log('taskhistory in background script');
        console.log('trying to access gmail api: ', gapi.client.gmail);
        sendResponse(gapi.client.gmail.users.threads.get({
        	'id': request.threadId,
            'userId': 'me',
            'format': 'raw'
        }));
    }
    return true;
});
