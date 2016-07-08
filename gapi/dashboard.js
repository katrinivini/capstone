// Get list of user's Gmail labels.
function listLabels(userId, callback) {
    console.log('in listlabels, id: ', userId)
    var request = gapi.client.gmail.users.labels.list({
        'userId': userId
    });
    request.execute(callback);
}

// After creating shared label, create it in Gmail labels as well. 
function createLabel(userId, newLabelName, callback) {
    var something = gapi.client.gmail.users.labels.create({
        'userId': userId,
        'resource': {
            'labelListVisibility': 'labelShow',
            'messageListVisibility': 'show',
            'name': newLabelName
        }
    });
    something.execute(callback);
}

// Listens for requests from content script app.js.
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    // console.log('in the listener function in dashboard.js', request, sender)
    if (request.type === 'list labels') {
        listLabels('me', function(response) {
            var arrayOfLabelObjects = response.labels;
            var labelDictionary = {};
            for (var obj of arrayOfLabelObjects) {
                labelDictionary[obj.name] = obj.id;
            }
            // console.log("listLabels response.labels: ", arrayOfLabelObjects);
            // console.log("labelDictionary: ", labelDictionary);
            sendResponse(labelDictionary);
        });
    }

    if (request.type === 'create sharedLabel') {
        var newLabelName = request.name; 
        createLabel('me', newLabelName, function(response) {
            // console.log('what is this response', response)
            sendResponse(response);
        });
    }

})

