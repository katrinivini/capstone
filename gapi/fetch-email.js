function fetchEmail(userId, threadId, callback){
	var request = gapi.client.gmail.users.messages.get({
		'id': threadId,
		'userId': userId
	})
	return request.execute(callback);
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
	if (request.type === 'fetch email'){
		fetchEmail('me', request.threadId, function(emailBody){
			sendResponse(emailBody);
			console.log('is the email body for sent email fetched back?', emailBody);
		})
	}
	// return true;
});