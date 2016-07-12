function getProfile(userId, callback){
	var request = gapi.client.gmail.users.getProfile({
		userId: userId
	})
	request.execute(callback);
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
	if (request.type === 'get profile') {
		getProfile('me', function(response){
			// console.log('response for profile: ', response);
			sendResponse(response.emailAddress);
		})
	}
})