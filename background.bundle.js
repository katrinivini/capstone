(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var head = document.getElementsByTagName('head')[0];
var authScript = document.createElement('script');
authScript.type = 'text/javascript';
authScript.src = "https://apis.google.com/js/client.js?onload=checkAuth";
document.body.appendChild(authScript);
console.log(document.body)

var body = document.getElementsByTagName('body')[0];
var div = document.createElement('div');
div.id = "authorize-div";
div.style = "dispay: none";
var span = document.createElement('span');
span.innerHTML = "Authorize access to Gmail API";
var button = document.createElement('button');
button.id = "authorize-button";
button.innerHTML = "Authorize";
button.addEventListener('click', function(event) {
    handleAuthClick(event);
})
var pre = document.createElement('pre');
pre.id = "output"
var DIV = document.createElement('div');
div.appendChild(span);
div.appendChild(button);
DIV.appendChild(div);
DIV.appendChild(pre);
body.appendChild(DIV);

// Your Client ID can be retrieved from your project in the Google
// Developer Console, https://console.developers.google.com
var CLIENT_ID = require('../manifest.json').oauth2.client_id

var SCOPES = ['https://www.googleapis.com/auth/gmail.readonly'];

/**
 * Check if current user has authorized this application.
 */
window.checkAuth = function checkAuth() {
    console.log('did you get in here?');
    gapi.auth.authorize({
        'client_id': CLIENT_ID,
        'scope': SCOPES,
        'immediate': true
    }, handleAuthResult);
}

/**
 * Handle response from authorization server.
 *
 * @param {Object} authResult Authorization result.
 */
function handleAuthResult(authResult) {
    console.log('authResult: ', authResult);
    var authorizeDiv = document.getElementById('authorize-div');
    if (authResult && !authResult.error) {
        // Hide auth UI, then load client library.
        authorizeDiv.style.display = 'none';
        loadGmailApi();
    } else {
        // Show auth UI, allowing the user to initiate authorization by
        // clicking authorize button.
        authorizeDiv.style.display = 'inline';
    }
}

/**
 * Initiate auth flow in response to user clicking authorize button.
 *
 * @param {Event} event Button click event.
 */
function handleAuthClick(event) {
    console.log('event: ', event);
    gapi.auth.authorize({ client_id: CLIENT_ID, scope: SCOPES, immediate: false },
        handleAuthResult);
    return false;
}

/**
 * Load Gmail API client library. List labels once client library
 * is loaded.
 */
function loadGmailApi() {
    gapi.client.load('gmail', 'v1', listLabels);
}

/**
 * Print all Labels in the authorized user's inbox. If no labels
 * are found an appropriate message is printed.
 */
function listLabels() {
    var request = gapi.client.gmail.users.labels.list({
        'userId': 'me'
    });

    request.execute(function(resp) {
        console.log('resp: ', resp);
        var labels = resp.labels;
        appendPre('Labels:');

        if (labels && labels.length > 0) {
            for (i = 0; i < labels.length; i++) {
                var label = labels[i];
                appendPre(label.name)
            }
        } else {
            appendPre('No Labels found.');
        }
    });
}
module.exports = {
    getThread: getThread
}

/**
 * Append a pre element to the body containing the given message
 * as its text node.
 *
 * @param {string} message Text to be placed in pre element.
 */
function appendPre(message) {
    var pre = document.getElementById('output');
    var textContent = document.createTextNode(message + '\n');
    pre.appendChild(textContent);
}


var getThread = function(userId, threadId, callback) {
    return gapi.client.gmail.users.messages.get({
        'id': threadId,
        'userId': userId,
        'format': 'metadata'
    })
    .then(function(resp){
        return resp;
    })
    // return req.execute(callback);
}

require('./taskhistory.js');
require('./comment.js');


},{"../manifest.json":4,"./comment.js":2,"./taskhistory.js":3}],2:[function(require,module,exports){
var getThread = function(userId, threadId, callback) {
    var  req = gapi.client.gmail.users.messages.get({
            'id': threadId,
            'userId': userId,
            'format': 'metadata'
        })
        // .then(function(resp){
        // 	console.log(resp);
        // })
        return req.execute(callback);
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	request.user.name;
    if (request.type === 'add comment') {
        getThread('me', request.threadId, function(jsonresp) {
            jsonresp.payload.headers.forEach(function(header){
            	if (header.name === 'Message-ID') {
            		
            	}
            })
        })
    }
})

},{}],3:[function(require,module,exports){
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
                if (jsonresp.payload.headers[i].name === "Message-ID") {
                    msgId = jsonresp.payload.headers[i].value;
                }
                // if (jsonresp.payload.headers[i].name === "From"){
                //  senderName = jsonresp.payload.headers[i].value.match(/[^<]*/)[0];
                // }
            }
            var msgHash = hashCode(msgId);

            // console.log('rawResp', rawresp);
            console.log("are we in here")
            sendResponse(msgHash);
            console.log('jsonresp', jsonresp);
            // console.log('rawResp', rawresp);
            // sendResponse(jsonresp);
        });
    }
    return true;
});

function hashCode(s) {
    return s.split("").reduce(function(a, b) { a = ((a << 5) - a) + b.charCodeAt(0);
        return a & a }, 0);
}
},{}],4:[function(require,module,exports){
module.exports={
    "manifest_version": 2,
    "name": "Hello World Extension",
    "version": "1.0",
    "permissions": [
        "https://mail.google.com/",
        "https://inbox.google.com/",
        "identity"
    ],
    // "browser_action": {
    //   "default_icon": {                    // optional
    //     "19": "images/icon19.png",           // optional
    //     "38": "images/icon38.png"            // optional
    //   },
    //   "default_title": "Google Mail",      // optional; shown in tooltip
    //   "default_popup": "popup.html"        // optional
    // }, 
    "web_accessible_resources": [
        "node_modules/*",
        "templates/*"
    ],
    "background": {
        "scripts": ["background.bundle.js"]
    },
    "oauth2": {
        "client_id": "124834244949-slnho6bo9fbta9f4gmc5cqiorpkahjm6.apps.googleusercontent.com",
        "scopes": [
          "email", "openid", "profile", "https://www.googleapis.com/auth/gmail.readonly"
        ]
    },
    "content_security_policy": "script-src 'self' 'unsafe-eval' https://*.google.com https://capstone1604gha.firebaseio.com; object-src 'self' https://*.google.com https://capstone1604gha.firebaseio.com",
    "content_scripts": [{
        "matches": ["https://mail.google.com/*", "https://inbox.google.com/*"],
        "js": ["firebase.js", "inboxsdk.js", "bundle.js"]
    }],
    "key": "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAyF2P5B7vi+Z6vEOoL7TlZYdT3CEBHrhdp83/9pzTuA+9ZrhgGQGC0ix+u75DxpozPzB+ROzWvTHxLgdvtVvH97ZabocabU8RmyZFP7ZQnRg9Fx91TcYcBi+i+t4Hzh/4qO1tsOwi87WMbURF3pwMmjiRXVttoHQVa42hcDyHoSzbuSItV2UuEUnGL2lrWdz3G9BBoreEtxJcj5ZO4qM7+aVn0GG5WWx5YmjhT9X81RdSr6qhiiO/HOJVbqZV5d9UbY8Yo4mzhQhPjVuCoki6cvsCM9WDI2+VUwqiJX6MQCiUF6AGfhSg2Capg1ZZDzG2Mvo8ozXRywSZPCgT+BbGzQIDAQAB"
}
},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3Vzci9sb2NhbC9saWIvbm9kZV9tb2R1bGVzL3dhdGNoaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJnYXBpL2JhY2tncm91bmQtdHdvLmpzIiwiZ2FwaS9jb21tZW50LmpzIiwiZ2FwaS90YXNraGlzdG9yeS5qcyIsIm1hbmlmZXN0Lmpzb24iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3SUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJ2YXIgaGVhZCA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdoZWFkJylbMF07XG52YXIgYXV0aFNjcmlwdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NjcmlwdCcpO1xuYXV0aFNjcmlwdC50eXBlID0gJ3RleHQvamF2YXNjcmlwdCc7XG5hdXRoU2NyaXB0LnNyYyA9IFwiaHR0cHM6Ly9hcGlzLmdvb2dsZS5jb20vanMvY2xpZW50LmpzP29ubG9hZD1jaGVja0F1dGhcIjtcbmRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoYXV0aFNjcmlwdCk7XG5jb25zb2xlLmxvZyhkb2N1bWVudC5ib2R5KVxuXG52YXIgYm9keSA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdib2R5JylbMF07XG52YXIgZGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG5kaXYuaWQgPSBcImF1dGhvcml6ZS1kaXZcIjtcbmRpdi5zdHlsZSA9IFwiZGlzcGF5OiBub25lXCI7XG52YXIgc3BhbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKTtcbnNwYW4uaW5uZXJIVE1MID0gXCJBdXRob3JpemUgYWNjZXNzIHRvIEdtYWlsIEFQSVwiO1xudmFyIGJ1dHRvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2J1dHRvbicpO1xuYnV0dG9uLmlkID0gXCJhdXRob3JpemUtYnV0dG9uXCI7XG5idXR0b24uaW5uZXJIVE1MID0gXCJBdXRob3JpemVcIjtcbmJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgaGFuZGxlQXV0aENsaWNrKGV2ZW50KTtcbn0pXG52YXIgcHJlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgncHJlJyk7XG5wcmUuaWQgPSBcIm91dHB1dFwiXG52YXIgRElWID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG5kaXYuYXBwZW5kQ2hpbGQoc3Bhbik7XG5kaXYuYXBwZW5kQ2hpbGQoYnV0dG9uKTtcbkRJVi5hcHBlbmRDaGlsZChkaXYpO1xuRElWLmFwcGVuZENoaWxkKHByZSk7XG5ib2R5LmFwcGVuZENoaWxkKERJVik7XG5cbi8vIFlvdXIgQ2xpZW50IElEIGNhbiBiZSByZXRyaWV2ZWQgZnJvbSB5b3VyIHByb2plY3QgaW4gdGhlIEdvb2dsZVxuLy8gRGV2ZWxvcGVyIENvbnNvbGUsIGh0dHBzOi8vY29uc29sZS5kZXZlbG9wZXJzLmdvb2dsZS5jb21cbnZhciBDTElFTlRfSUQgPSByZXF1aXJlKCcuLi9tYW5pZmVzdC5qc29uJykub2F1dGgyLmNsaWVudF9pZFxuXG52YXIgU0NPUEVTID0gWydodHRwczovL3d3dy5nb29nbGVhcGlzLmNvbS9hdXRoL2dtYWlsLnJlYWRvbmx5J107XG5cbi8qKlxuICogQ2hlY2sgaWYgY3VycmVudCB1c2VyIGhhcyBhdXRob3JpemVkIHRoaXMgYXBwbGljYXRpb24uXG4gKi9cbndpbmRvdy5jaGVja0F1dGggPSBmdW5jdGlvbiBjaGVja0F1dGgoKSB7XG4gICAgY29uc29sZS5sb2coJ2RpZCB5b3UgZ2V0IGluIGhlcmU/Jyk7XG4gICAgZ2FwaS5hdXRoLmF1dGhvcml6ZSh7XG4gICAgICAgICdjbGllbnRfaWQnOiBDTElFTlRfSUQsXG4gICAgICAgICdzY29wZSc6IFNDT1BFUyxcbiAgICAgICAgJ2ltbWVkaWF0ZSc6IHRydWVcbiAgICB9LCBoYW5kbGVBdXRoUmVzdWx0KTtcbn1cblxuLyoqXG4gKiBIYW5kbGUgcmVzcG9uc2UgZnJvbSBhdXRob3JpemF0aW9uIHNlcnZlci5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gYXV0aFJlc3VsdCBBdXRob3JpemF0aW9uIHJlc3VsdC5cbiAqL1xuZnVuY3Rpb24gaGFuZGxlQXV0aFJlc3VsdChhdXRoUmVzdWx0KSB7XG4gICAgY29uc29sZS5sb2coJ2F1dGhSZXN1bHQ6ICcsIGF1dGhSZXN1bHQpO1xuICAgIHZhciBhdXRob3JpemVEaXYgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYXV0aG9yaXplLWRpdicpO1xuICAgIGlmIChhdXRoUmVzdWx0ICYmICFhdXRoUmVzdWx0LmVycm9yKSB7XG4gICAgICAgIC8vIEhpZGUgYXV0aCBVSSwgdGhlbiBsb2FkIGNsaWVudCBsaWJyYXJ5LlxuICAgICAgICBhdXRob3JpemVEaXYuc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgICAgICAgbG9hZEdtYWlsQXBpKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgLy8gU2hvdyBhdXRoIFVJLCBhbGxvd2luZyB0aGUgdXNlciB0byBpbml0aWF0ZSBhdXRob3JpemF0aW9uIGJ5XG4gICAgICAgIC8vIGNsaWNraW5nIGF1dGhvcml6ZSBidXR0b24uXG4gICAgICAgIGF1dGhvcml6ZURpdi5zdHlsZS5kaXNwbGF5ID0gJ2lubGluZSc7XG4gICAgfVxufVxuXG4vKipcbiAqIEluaXRpYXRlIGF1dGggZmxvdyBpbiByZXNwb25zZSB0byB1c2VyIGNsaWNraW5nIGF1dGhvcml6ZSBidXR0b24uXG4gKlxuICogQHBhcmFtIHtFdmVudH0gZXZlbnQgQnV0dG9uIGNsaWNrIGV2ZW50LlxuICovXG5mdW5jdGlvbiBoYW5kbGVBdXRoQ2xpY2soZXZlbnQpIHtcbiAgICBjb25zb2xlLmxvZygnZXZlbnQ6ICcsIGV2ZW50KTtcbiAgICBnYXBpLmF1dGguYXV0aG9yaXplKHsgY2xpZW50X2lkOiBDTElFTlRfSUQsIHNjb3BlOiBTQ09QRVMsIGltbWVkaWF0ZTogZmFsc2UgfSxcbiAgICAgICAgaGFuZGxlQXV0aFJlc3VsdCk7XG4gICAgcmV0dXJuIGZhbHNlO1xufVxuXG4vKipcbiAqIExvYWQgR21haWwgQVBJIGNsaWVudCBsaWJyYXJ5LiBMaXN0IGxhYmVscyBvbmNlIGNsaWVudCBsaWJyYXJ5XG4gKiBpcyBsb2FkZWQuXG4gKi9cbmZ1bmN0aW9uIGxvYWRHbWFpbEFwaSgpIHtcbiAgICBnYXBpLmNsaWVudC5sb2FkKCdnbWFpbCcsICd2MScsIGxpc3RMYWJlbHMpO1xufVxuXG4vKipcbiAqIFByaW50IGFsbCBMYWJlbHMgaW4gdGhlIGF1dGhvcml6ZWQgdXNlcidzIGluYm94LiBJZiBubyBsYWJlbHNcbiAqIGFyZSBmb3VuZCBhbiBhcHByb3ByaWF0ZSBtZXNzYWdlIGlzIHByaW50ZWQuXG4gKi9cbmZ1bmN0aW9uIGxpc3RMYWJlbHMoKSB7XG4gICAgdmFyIHJlcXVlc3QgPSBnYXBpLmNsaWVudC5nbWFpbC51c2Vycy5sYWJlbHMubGlzdCh7XG4gICAgICAgICd1c2VySWQnOiAnbWUnXG4gICAgfSk7XG5cbiAgICByZXF1ZXN0LmV4ZWN1dGUoZnVuY3Rpb24ocmVzcCkge1xuICAgICAgICBjb25zb2xlLmxvZygncmVzcDogJywgcmVzcCk7XG4gICAgICAgIHZhciBsYWJlbHMgPSByZXNwLmxhYmVscztcbiAgICAgICAgYXBwZW5kUHJlKCdMYWJlbHM6Jyk7XG5cbiAgICAgICAgaWYgKGxhYmVscyAmJiBsYWJlbHMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IGxhYmVscy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIHZhciBsYWJlbCA9IGxhYmVsc1tpXTtcbiAgICAgICAgICAgICAgICBhcHBlbmRQcmUobGFiZWwubmFtZSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGFwcGVuZFByZSgnTm8gTGFiZWxzIGZvdW5kLicpO1xuICAgICAgICB9XG4gICAgfSk7XG59XG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBnZXRUaHJlYWQ6IGdldFRocmVhZFxufVxuXG4vKipcbiAqIEFwcGVuZCBhIHByZSBlbGVtZW50IHRvIHRoZSBib2R5IGNvbnRhaW5pbmcgdGhlIGdpdmVuIG1lc3NhZ2VcbiAqIGFzIGl0cyB0ZXh0IG5vZGUuXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IG1lc3NhZ2UgVGV4dCB0byBiZSBwbGFjZWQgaW4gcHJlIGVsZW1lbnQuXG4gKi9cbmZ1bmN0aW9uIGFwcGVuZFByZShtZXNzYWdlKSB7XG4gICAgdmFyIHByZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdvdXRwdXQnKTtcbiAgICB2YXIgdGV4dENvbnRlbnQgPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShtZXNzYWdlICsgJ1xcbicpO1xuICAgIHByZS5hcHBlbmRDaGlsZCh0ZXh0Q29udGVudCk7XG59XG5cblxudmFyIGdldFRocmVhZCA9IGZ1bmN0aW9uKHVzZXJJZCwgdGhyZWFkSWQsIGNhbGxiYWNrKSB7XG4gICAgcmV0dXJuIGdhcGkuY2xpZW50LmdtYWlsLnVzZXJzLm1lc3NhZ2VzLmdldCh7XG4gICAgICAgICdpZCc6IHRocmVhZElkLFxuICAgICAgICAndXNlcklkJzogdXNlcklkLFxuICAgICAgICAnZm9ybWF0JzogJ21ldGFkYXRhJ1xuICAgIH0pXG4gICAgLnRoZW4oZnVuY3Rpb24ocmVzcCl7XG4gICAgICAgIHJldHVybiByZXNwO1xuICAgIH0pXG4gICAgLy8gcmV0dXJuIHJlcS5leGVjdXRlKGNhbGxiYWNrKTtcbn1cblxucmVxdWlyZSgnLi90YXNraGlzdG9yeS5qcycpO1xucmVxdWlyZSgnLi9jb21tZW50LmpzJyk7XG5cbiIsInZhciBnZXRUaHJlYWQgPSBmdW5jdGlvbih1c2VySWQsIHRocmVhZElkLCBjYWxsYmFjaykge1xuICAgIHZhciAgcmVxID0gZ2FwaS5jbGllbnQuZ21haWwudXNlcnMubWVzc2FnZXMuZ2V0KHtcbiAgICAgICAgICAgICdpZCc6IHRocmVhZElkLFxuICAgICAgICAgICAgJ3VzZXJJZCc6IHVzZXJJZCxcbiAgICAgICAgICAgICdmb3JtYXQnOiAnbWV0YWRhdGEnXG4gICAgICAgIH0pXG4gICAgICAgIC8vIC50aGVuKGZ1bmN0aW9uKHJlc3Ape1xuICAgICAgICAvLyBcdGNvbnNvbGUubG9nKHJlc3ApO1xuICAgICAgICAvLyB9KVxuICAgICAgICByZXR1cm4gcmVxLmV4ZWN1dGUoY2FsbGJhY2spO1xufVxuXG5jaHJvbWUucnVudGltZS5vbk1lc3NhZ2UuYWRkTGlzdGVuZXIoZnVuY3Rpb24ocmVxdWVzdCwgc2VuZGVyLCBzZW5kUmVzcG9uc2UpIHtcblx0cmVxdWVzdC51c2VyLm5hbWU7XG4gICAgaWYgKHJlcXVlc3QudHlwZSA9PT0gJ2FkZCBjb21tZW50Jykge1xuICAgICAgICBnZXRUaHJlYWQoJ21lJywgcmVxdWVzdC50aHJlYWRJZCwgZnVuY3Rpb24oanNvbnJlc3ApIHtcbiAgICAgICAgICAgIGpzb25yZXNwLnBheWxvYWQuaGVhZGVycy5mb3JFYWNoKGZ1bmN0aW9uKGhlYWRlcil7XG4gICAgICAgICAgICBcdGlmIChoZWFkZXIubmFtZSA9PT0gJ01lc3NhZ2UtSUQnKSB7XG4gICAgICAgICAgICBcdFx0XG4gICAgICAgICAgICBcdH1cbiAgICAgICAgICAgIH0pXG4gICAgICAgIH0pXG4gICAgfVxufSlcbiIsImNocm9tZS5ydW50aW1lLm9uTWVzc2FnZS5hZGRMaXN0ZW5lcihmdW5jdGlvbihyZXF1ZXN0LCBzZW5kZXIsIHNlbmRSZXNwb25zZSkge1xuICAgIGlmIChyZXF1ZXN0LnR5cGUgPT09ICdyZWFkIG1lc3NhZ2UnKSB7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBHZXQgVGhyZWFkIHdpdGggZ2l2ZW4gSUQuXG4gICAgICAgICAqXG4gICAgICAgICAqIEBwYXJhbSAge1N0cmluZ30gdXNlcklkIFVzZXIncyBlbWFpbCBhZGRyZXNzLiBUaGUgc3BlY2lhbCB2YWx1ZSAnbWUnXG4gICAgICAgICAqIGNhbiBiZSB1c2VkIHRvIGluZGljYXRlIHRoZSBhdXRoZW50aWNhdGVkIHVzZXIuXG4gICAgICAgICAqIEBwYXJhbSAge1N0cmluZ30gdGhyZWFkSWQgSUQgb2YgVGhyZWFkIHRvIGdldC5cbiAgICAgICAgICogQHBhcmFtICB7RnVuY3Rpb259IGNhbGxiYWNrIEZ1bmN0aW9uIHRvIGNhbGwgd2hlbiB0aGUgcmVxdWVzdCBpcyBjb21wbGV0ZS5cbiAgICAgICAgICovXG4gICAgICAgIGZ1bmN0aW9uIGdldFRocmVhZCh1c2VySWQsIHRocmVhZElkLCBjYWxsYmFjaykge1xuICAgICAgICAgICAgdmFyIHJlcSA9IGdhcGkuY2xpZW50LmdtYWlsLnVzZXJzLm1lc3NhZ2VzLmdldCh7XG4gICAgICAgICAgICAgICAgJ2lkJzogdGhyZWFkSWQsXG5cbiAgICAgICAgICAgICAgICAndXNlcklkJzogdXNlcklkLFxuICAgICAgICAgICAgICAgICdmb3JtYXQnOiAnbWV0YWRhdGEnXG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgcmV0dXJuIHJlcS5leGVjdXRlKGNhbGxiYWNrKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGdldFRocmVhZCgnbWUnLCByZXF1ZXN0LnRocmVhZElkLCBmdW5jdGlvbihqc29ucmVzcCwgcmF3cmVzcCkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ2pzb25yZXNwJywganNvbnJlc3ApXG4gICAgICAgICAgICB2YXIgbXNnSWQgPSBcIlwiO1xuICAgICAgICAgICAgdmFyIHNlbmRlck5hbWUgPSBcIlwiO1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBqc29ucmVzcC5wYXlsb2FkLmhlYWRlcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBpZiAoanNvbnJlc3AucGF5bG9hZC5oZWFkZXJzW2ldLm5hbWUgPT09IFwiTWVzc2FnZS1JRFwiKSB7XG4gICAgICAgICAgICAgICAgICAgIG1zZ0lkID0ganNvbnJlc3AucGF5bG9hZC5oZWFkZXJzW2ldLnZhbHVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyBpZiAoanNvbnJlc3AucGF5bG9hZC5oZWFkZXJzW2ldLm5hbWUgPT09IFwiRnJvbVwiKXtcbiAgICAgICAgICAgICAgICAvLyAgc2VuZGVyTmFtZSA9IGpzb25yZXNwLnBheWxvYWQuaGVhZGVyc1tpXS52YWx1ZS5tYXRjaCgvW148XSovKVswXTtcbiAgICAgICAgICAgICAgICAvLyB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgbXNnSGFzaCA9IGhhc2hDb2RlKG1zZ0lkKTtcblxuICAgICAgICAgICAgLy8gY29uc29sZS5sb2coJ3Jhd1Jlc3AnLCByYXdyZXNwKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiYXJlIHdlIGluIGhlcmVcIilcbiAgICAgICAgICAgIHNlbmRSZXNwb25zZShtc2dIYXNoKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdqc29ucmVzcCcsIGpzb25yZXNwKTtcbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKCdyYXdSZXNwJywgcmF3cmVzcCk7XG4gICAgICAgICAgICAvLyBzZW5kUmVzcG9uc2UoanNvbnJlc3ApO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgcmV0dXJuIHRydWU7XG59KTtcblxuZnVuY3Rpb24gaGFzaENvZGUocykge1xuICAgIHJldHVybiBzLnNwbGl0KFwiXCIpLnJlZHVjZShmdW5jdGlvbihhLCBiKSB7IGEgPSAoKGEgPDwgNSkgLSBhKSArIGIuY2hhckNvZGVBdCgwKTtcbiAgICAgICAgcmV0dXJuIGEgJiBhIH0sIDApO1xufSIsIm1vZHVsZS5leHBvcnRzPXtcbiAgICBcIm1hbmlmZXN0X3ZlcnNpb25cIjogMixcbiAgICBcIm5hbWVcIjogXCJIZWxsbyBXb3JsZCBFeHRlbnNpb25cIixcbiAgICBcInZlcnNpb25cIjogXCIxLjBcIixcbiAgICBcInBlcm1pc3Npb25zXCI6IFtcbiAgICAgICAgXCJodHRwczovL21haWwuZ29vZ2xlLmNvbS9cIixcbiAgICAgICAgXCJodHRwczovL2luYm94Lmdvb2dsZS5jb20vXCIsXG4gICAgICAgIFwiaWRlbnRpdHlcIlxuICAgIF0sXG4gICAgLy8gXCJicm93c2VyX2FjdGlvblwiOiB7XG4gICAgLy8gICBcImRlZmF1bHRfaWNvblwiOiB7ICAgICAgICAgICAgICAgICAgICAvLyBvcHRpb25hbFxuICAgIC8vICAgICBcIjE5XCI6IFwiaW1hZ2VzL2ljb24xOS5wbmdcIiwgICAgICAgICAgIC8vIG9wdGlvbmFsXG4gICAgLy8gICAgIFwiMzhcIjogXCJpbWFnZXMvaWNvbjM4LnBuZ1wiICAgICAgICAgICAgLy8gb3B0aW9uYWxcbiAgICAvLyAgIH0sXG4gICAgLy8gICBcImRlZmF1bHRfdGl0bGVcIjogXCJHb29nbGUgTWFpbFwiLCAgICAgIC8vIG9wdGlvbmFsOyBzaG93biBpbiB0b29sdGlwXG4gICAgLy8gICBcImRlZmF1bHRfcG9wdXBcIjogXCJwb3B1cC5odG1sXCIgICAgICAgIC8vIG9wdGlvbmFsXG4gICAgLy8gfSwgXG4gICAgXCJ3ZWJfYWNjZXNzaWJsZV9yZXNvdXJjZXNcIjogW1xuICAgICAgICBcIm5vZGVfbW9kdWxlcy8qXCIsXG4gICAgICAgIFwidGVtcGxhdGVzLypcIlxuICAgIF0sXG4gICAgXCJiYWNrZ3JvdW5kXCI6IHtcbiAgICAgICAgXCJzY3JpcHRzXCI6IFtcImJhY2tncm91bmQuYnVuZGxlLmpzXCJdXG4gICAgfSxcbiAgICBcIm9hdXRoMlwiOiB7XG4gICAgICAgIFwiY2xpZW50X2lkXCI6IFwiMTI0ODM0MjQ0OTQ5LXNsbmhvNmJvOWZidGE5ZjRnbWM1Y3Fpb3Jwa2Foam02LmFwcHMuZ29vZ2xldXNlcmNvbnRlbnQuY29tXCIsXG4gICAgICAgIFwic2NvcGVzXCI6IFtcbiAgICAgICAgICBcImVtYWlsXCIsIFwib3BlbmlkXCIsIFwicHJvZmlsZVwiLCBcImh0dHBzOi8vd3d3Lmdvb2dsZWFwaXMuY29tL2F1dGgvZ21haWwucmVhZG9ubHlcIlxuICAgICAgICBdXG4gICAgfSxcbiAgICBcImNvbnRlbnRfc2VjdXJpdHlfcG9saWN5XCI6IFwic2NyaXB0LXNyYyAnc2VsZicgJ3Vuc2FmZS1ldmFsJyBodHRwczovLyouZ29vZ2xlLmNvbSBodHRwczovL2NhcHN0b25lMTYwNGdoYS5maXJlYmFzZWlvLmNvbTsgb2JqZWN0LXNyYyAnc2VsZicgaHR0cHM6Ly8qLmdvb2dsZS5jb20gaHR0cHM6Ly9jYXBzdG9uZTE2MDRnaGEuZmlyZWJhc2Vpby5jb21cIixcbiAgICBcImNvbnRlbnRfc2NyaXB0c1wiOiBbe1xuICAgICAgICBcIm1hdGNoZXNcIjogW1wiaHR0cHM6Ly9tYWlsLmdvb2dsZS5jb20vKlwiLCBcImh0dHBzOi8vaW5ib3guZ29vZ2xlLmNvbS8qXCJdLFxuICAgICAgICBcImpzXCI6IFtcImZpcmViYXNlLmpzXCIsIFwiaW5ib3hzZGsuanNcIiwgXCJidW5kbGUuanNcIl1cbiAgICB9XSxcbiAgICBcImtleVwiOiBcIk1JSUJJakFOQmdrcWhraUc5dzBCQVFFRkFBT0NBUThBTUlJQkNnS0NBUUVBeUYyUDVCN3ZpK1o2dkVPb0w3VGxaWWRUM0NFQkhyaGRwODMvOXB6VHVBKzlacmhnR1FHQzBpeCt1NzVEeHBvelB6QitST3pXdlRIeExnZHZ0VnZIOTdaYWJvY2FiVThSbXlaRlA3WlFuUmc5Rng5MVRjWWNCaStpK3Q0SHpoLzRxTzF0c093aTg3V01iVVJGM3B3TW1qaVJYVnR0b0hRVmE0MmhjRHlIb1N6YnVTSXRWMlV1RVVuR0wybHJXZHozRzlCQm9yZUV0eEpjajVaTzRxTTcrYVZuMEdHNVdXeDVZbWpoVDlYODFSZFNyNnFoaWlPL0hPSlZicVpWNWQ5VWJZOFlvNG16aFFoUGpWdUNva2k2Y3ZzQ005V0RJMitWVXdxaUpYNk1RQ2lVRjZBR2ZoU2cyQ2FwZzFaWkR6RzJNdm84b3pYUnl3U1pQQ2dUK0JiR3pRSURBUUFCXCJcbn0iXX0=
