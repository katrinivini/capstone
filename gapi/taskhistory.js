chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.type === 'read message') {
        /**
         * Get Thread with given ID.
         *
         * @param  {String} userId User's email address. The special value 'me'
         * can be used to indicate the authenticated user.
         * @param  {String} threadId ID of Thread to get.
         * @param  {Function} callback Function to call when the request is complete.
         */
        function getThread(userId, threadId, callback) {
            var req = gapi.client.gmail.users.messages.get({
                'id': threadId,

                'userId': userId,
                'format': 'metadata'
            })
            return req.execute(callback);
        }

        getThread('me', request.threadId, function(jsonresp, rawresp) {
            console.log('jsonresp', jsonresp)
            var msgId = "";
            var senderName = "";
            for (var i = 0; i < jsonresp.payload.headers.length; i++) {
                if (jsonresp.payload.headers[i].name.toUpperCase() === "MESSAGE-ID") {
                    msgId = jsonresp.payload.headers[i].value;
                }
                // if (jsonresp.payload.headers[i].name === "From"){
                //  senderName = jsonresp.payload.headers[i].value.match(/[^<]*/)[0];
                // }
            }
            var msgHash = hashCode(msgId);

            // console.log('rawResp', rawresp);
            console.log("are we in here??!!!!???")
            sendResponse(msgHash);
            console.log('jsonresp', jsonresp);
            // console.log('rawResp', rawresp);
            // sendResponse(jsonresp);
        });
    }
    return true;
});


// alternatively, maybe a function that removes the non letter characters?
function hashCode(s) {
    console.log("rina omg")
    console.log(s)
    console.log(s.replace(/[^\w\s]/gi, ''))
    // return s.split("").reduce(function(a, b) { a = ((a << 5) - a) + b.charCodeAt(0);
    //     return a & a }, 0);
    return s.replace(/[^\w\s]/gi, '');
}

