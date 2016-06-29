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


// alternatively, maybe a function that removes the non letter characters?
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3Vzci9sb2NhbC9saWIvbm9kZV9tb2R1bGVzL3dhdGNoaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJnYXBpL2JhY2tncm91bmQtdHdvLmpzIiwiZ2FwaS9jb21tZW50LmpzIiwiZ2FwaS90YXNraGlzdG9yeS5qcyIsIm1hbmlmZXN0Lmpzb24iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3SUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwidmFyIGhlYWQgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnaGVhZCcpWzBdO1xudmFyIGF1dGhTY3JpcHQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzY3JpcHQnKTtcbmF1dGhTY3JpcHQudHlwZSA9ICd0ZXh0L2phdmFzY3JpcHQnO1xuYXV0aFNjcmlwdC5zcmMgPSBcImh0dHBzOi8vYXBpcy5nb29nbGUuY29tL2pzL2NsaWVudC5qcz9vbmxvYWQ9Y2hlY2tBdXRoXCI7XG5kb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGF1dGhTY3JpcHQpO1xuY29uc29sZS5sb2coZG9jdW1lbnQuYm9keSlcblxudmFyIGJvZHkgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnYm9keScpWzBdO1xudmFyIGRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuZGl2LmlkID0gXCJhdXRob3JpemUtZGl2XCI7XG5kaXYuc3R5bGUgPSBcImRpc3BheTogbm9uZVwiO1xudmFyIHNwYW4gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJyk7XG5zcGFuLmlubmVySFRNTCA9IFwiQXV0aG9yaXplIGFjY2VzcyB0byBHbWFpbCBBUElcIjtcbnZhciBidXR0b24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdidXR0b24nKTtcbmJ1dHRvbi5pZCA9IFwiYXV0aG9yaXplLWJ1dHRvblwiO1xuYnV0dG9uLmlubmVySFRNTCA9IFwiQXV0aG9yaXplXCI7XG5idXR0b24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbihldmVudCkge1xuICAgIGhhbmRsZUF1dGhDbGljayhldmVudCk7XG59KVxudmFyIHByZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3ByZScpO1xucHJlLmlkID0gXCJvdXRwdXRcIlxudmFyIERJViA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuZGl2LmFwcGVuZENoaWxkKHNwYW4pO1xuZGl2LmFwcGVuZENoaWxkKGJ1dHRvbik7XG5ESVYuYXBwZW5kQ2hpbGQoZGl2KTtcbkRJVi5hcHBlbmRDaGlsZChwcmUpO1xuYm9keS5hcHBlbmRDaGlsZChESVYpO1xuXG4vLyBZb3VyIENsaWVudCBJRCBjYW4gYmUgcmV0cmlldmVkIGZyb20geW91ciBwcm9qZWN0IGluIHRoZSBHb29nbGVcbi8vIERldmVsb3BlciBDb25zb2xlLCBodHRwczovL2NvbnNvbGUuZGV2ZWxvcGVycy5nb29nbGUuY29tXG52YXIgQ0xJRU5UX0lEID0gcmVxdWlyZSgnLi4vbWFuaWZlc3QuanNvbicpLm9hdXRoMi5jbGllbnRfaWRcblxudmFyIFNDT1BFUyA9IFsnaHR0cHM6Ly93d3cuZ29vZ2xlYXBpcy5jb20vYXV0aC9nbWFpbC5yZWFkb25seSddO1xuXG4vKipcbiAqIENoZWNrIGlmIGN1cnJlbnQgdXNlciBoYXMgYXV0aG9yaXplZCB0aGlzIGFwcGxpY2F0aW9uLlxuICovXG53aW5kb3cuY2hlY2tBdXRoID0gZnVuY3Rpb24gY2hlY2tBdXRoKCkge1xuICAgIGNvbnNvbGUubG9nKCdkaWQgeW91IGdldCBpbiBoZXJlPycpO1xuICAgIGdhcGkuYXV0aC5hdXRob3JpemUoe1xuICAgICAgICAnY2xpZW50X2lkJzogQ0xJRU5UX0lELFxuICAgICAgICAnc2NvcGUnOiBTQ09QRVMsXG4gICAgICAgICdpbW1lZGlhdGUnOiB0cnVlXG4gICAgfSwgaGFuZGxlQXV0aFJlc3VsdCk7XG59XG5cbi8qKlxuICogSGFuZGxlIHJlc3BvbnNlIGZyb20gYXV0aG9yaXphdGlvbiBzZXJ2ZXIuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGF1dGhSZXN1bHQgQXV0aG9yaXphdGlvbiByZXN1bHQuXG4gKi9cbmZ1bmN0aW9uIGhhbmRsZUF1dGhSZXN1bHQoYXV0aFJlc3VsdCkge1xuICAgIGNvbnNvbGUubG9nKCdhdXRoUmVzdWx0OiAnLCBhdXRoUmVzdWx0KTtcbiAgICB2YXIgYXV0aG9yaXplRGl2ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2F1dGhvcml6ZS1kaXYnKTtcbiAgICBpZiAoYXV0aFJlc3VsdCAmJiAhYXV0aFJlc3VsdC5lcnJvcikge1xuICAgICAgICAvLyBIaWRlIGF1dGggVUksIHRoZW4gbG9hZCBjbGllbnQgbGlicmFyeS5cbiAgICAgICAgYXV0aG9yaXplRGl2LnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gICAgICAgIGxvYWRHbWFpbEFwaSgpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIFNob3cgYXV0aCBVSSwgYWxsb3dpbmcgdGhlIHVzZXIgdG8gaW5pdGlhdGUgYXV0aG9yaXphdGlvbiBieVxuICAgICAgICAvLyBjbGlja2luZyBhdXRob3JpemUgYnV0dG9uLlxuICAgICAgICBhdXRob3JpemVEaXYuc3R5bGUuZGlzcGxheSA9ICdpbmxpbmUnO1xuICAgIH1cbn1cblxuLyoqXG4gKiBJbml0aWF0ZSBhdXRoIGZsb3cgaW4gcmVzcG9uc2UgdG8gdXNlciBjbGlja2luZyBhdXRob3JpemUgYnV0dG9uLlxuICpcbiAqIEBwYXJhbSB7RXZlbnR9IGV2ZW50IEJ1dHRvbiBjbGljayBldmVudC5cbiAqL1xuZnVuY3Rpb24gaGFuZGxlQXV0aENsaWNrKGV2ZW50KSB7XG4gICAgY29uc29sZS5sb2coJ2V2ZW50OiAnLCBldmVudCk7XG4gICAgZ2FwaS5hdXRoLmF1dGhvcml6ZSh7IGNsaWVudF9pZDogQ0xJRU5UX0lELCBzY29wZTogU0NPUEVTLCBpbW1lZGlhdGU6IGZhbHNlIH0sXG4gICAgICAgIGhhbmRsZUF1dGhSZXN1bHQpO1xuICAgIHJldHVybiBmYWxzZTtcbn1cblxuLyoqXG4gKiBMb2FkIEdtYWlsIEFQSSBjbGllbnQgbGlicmFyeS4gTGlzdCBsYWJlbHMgb25jZSBjbGllbnQgbGlicmFyeVxuICogaXMgbG9hZGVkLlxuICovXG5mdW5jdGlvbiBsb2FkR21haWxBcGkoKSB7XG4gICAgZ2FwaS5jbGllbnQubG9hZCgnZ21haWwnLCAndjEnLCBsaXN0TGFiZWxzKTtcbn1cblxuLyoqXG4gKiBQcmludCBhbGwgTGFiZWxzIGluIHRoZSBhdXRob3JpemVkIHVzZXIncyBpbmJveC4gSWYgbm8gbGFiZWxzXG4gKiBhcmUgZm91bmQgYW4gYXBwcm9wcmlhdGUgbWVzc2FnZSBpcyBwcmludGVkLlxuICovXG5mdW5jdGlvbiBsaXN0TGFiZWxzKCkge1xuICAgIHZhciByZXF1ZXN0ID0gZ2FwaS5jbGllbnQuZ21haWwudXNlcnMubGFiZWxzLmxpc3Qoe1xuICAgICAgICAndXNlcklkJzogJ21lJ1xuICAgIH0pO1xuXG4gICAgcmVxdWVzdC5leGVjdXRlKGZ1bmN0aW9uKHJlc3ApIHtcbiAgICAgICAgY29uc29sZS5sb2coJ3Jlc3A6ICcsIHJlc3ApO1xuICAgICAgICB2YXIgbGFiZWxzID0gcmVzcC5sYWJlbHM7XG4gICAgICAgIGFwcGVuZFByZSgnTGFiZWxzOicpO1xuXG4gICAgICAgIGlmIChsYWJlbHMgJiYgbGFiZWxzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCBsYWJlbHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICB2YXIgbGFiZWwgPSBsYWJlbHNbaV07XG4gICAgICAgICAgICAgICAgYXBwZW5kUHJlKGxhYmVsLm5hbWUpXG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBhcHBlbmRQcmUoJ05vIExhYmVscyBmb3VuZC4nKTtcbiAgICAgICAgfVxuICAgIH0pO1xufVxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgZ2V0VGhyZWFkOiBnZXRUaHJlYWRcbn1cblxuLyoqXG4gKiBBcHBlbmQgYSBwcmUgZWxlbWVudCB0byB0aGUgYm9keSBjb250YWluaW5nIHRoZSBnaXZlbiBtZXNzYWdlXG4gKiBhcyBpdHMgdGV4dCBub2RlLlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBtZXNzYWdlIFRleHQgdG8gYmUgcGxhY2VkIGluIHByZSBlbGVtZW50LlxuICovXG5mdW5jdGlvbiBhcHBlbmRQcmUobWVzc2FnZSkge1xuICAgIHZhciBwcmUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnb3V0cHV0Jyk7XG4gICAgdmFyIHRleHRDb250ZW50ID0gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUobWVzc2FnZSArICdcXG4nKTtcbiAgICBwcmUuYXBwZW5kQ2hpbGQodGV4dENvbnRlbnQpO1xufVxuXG5cbnZhciBnZXRUaHJlYWQgPSBmdW5jdGlvbih1c2VySWQsIHRocmVhZElkLCBjYWxsYmFjaykge1xuICAgIHJldHVybiBnYXBpLmNsaWVudC5nbWFpbC51c2Vycy5tZXNzYWdlcy5nZXQoe1xuICAgICAgICAnaWQnOiB0aHJlYWRJZCxcbiAgICAgICAgJ3VzZXJJZCc6IHVzZXJJZCxcbiAgICAgICAgJ2Zvcm1hdCc6ICdtZXRhZGF0YSdcbiAgICB9KVxuICAgIC50aGVuKGZ1bmN0aW9uKHJlc3Ape1xuICAgICAgICByZXR1cm4gcmVzcDtcbiAgICB9KVxuICAgIC8vIHJldHVybiByZXEuZXhlY3V0ZShjYWxsYmFjayk7XG59XG5cbnJlcXVpcmUoJy4vdGFza2hpc3RvcnkuanMnKTtcbnJlcXVpcmUoJy4vY29tbWVudC5qcycpO1xuXG4iLCJ2YXIgZ2V0VGhyZWFkID0gZnVuY3Rpb24odXNlcklkLCB0aHJlYWRJZCwgY2FsbGJhY2spIHtcbiAgICB2YXIgIHJlcSA9IGdhcGkuY2xpZW50LmdtYWlsLnVzZXJzLm1lc3NhZ2VzLmdldCh7XG4gICAgICAgICAgICAnaWQnOiB0aHJlYWRJZCxcbiAgICAgICAgICAgICd1c2VySWQnOiB1c2VySWQsXG4gICAgICAgICAgICAnZm9ybWF0JzogJ21ldGFkYXRhJ1xuICAgICAgICB9KVxuICAgICAgICAvLyAudGhlbihmdW5jdGlvbihyZXNwKXtcbiAgICAgICAgLy8gXHRjb25zb2xlLmxvZyhyZXNwKTtcbiAgICAgICAgLy8gfSlcbiAgICAgICAgcmV0dXJuIHJlcS5leGVjdXRlKGNhbGxiYWNrKTtcbn1cblxuY2hyb21lLnJ1bnRpbWUub25NZXNzYWdlLmFkZExpc3RlbmVyKGZ1bmN0aW9uKHJlcXVlc3QsIHNlbmRlciwgc2VuZFJlc3BvbnNlKSB7XG5cdHJlcXVlc3QudXNlci5uYW1lO1xuICAgIGlmIChyZXF1ZXN0LnR5cGUgPT09ICdhZGQgY29tbWVudCcpIHtcbiAgICAgICAgZ2V0VGhyZWFkKCdtZScsIHJlcXVlc3QudGhyZWFkSWQsIGZ1bmN0aW9uKGpzb25yZXNwKSB7XG4gICAgICAgICAgICBqc29ucmVzcC5wYXlsb2FkLmhlYWRlcnMuZm9yRWFjaChmdW5jdGlvbihoZWFkZXIpe1xuICAgICAgICAgICAgXHRpZiAoaGVhZGVyLm5hbWUgPT09ICdNZXNzYWdlLUlEJykge1xuICAgICAgICAgICAgXHRcdFxuICAgICAgICAgICAgXHR9XG4gICAgICAgICAgICB9KVxuICAgICAgICB9KVxuICAgIH1cbn0pXG4iLCJjaHJvbWUucnVudGltZS5vbk1lc3NhZ2UuYWRkTGlzdGVuZXIoZnVuY3Rpb24ocmVxdWVzdCwgc2VuZGVyLCBzZW5kUmVzcG9uc2UpIHtcbiAgICBpZiAocmVxdWVzdC50eXBlID09PSAncmVhZCBtZXNzYWdlJykge1xuICAgICAgICAvKipcbiAgICAgICAgICogR2V0IFRocmVhZCB3aXRoIGdpdmVuIElELlxuICAgICAgICAgKlxuICAgICAgICAgKiBAcGFyYW0gIHtTdHJpbmd9IHVzZXJJZCBVc2VyJ3MgZW1haWwgYWRkcmVzcy4gVGhlIHNwZWNpYWwgdmFsdWUgJ21lJ1xuICAgICAgICAgKiBjYW4gYmUgdXNlZCB0byBpbmRpY2F0ZSB0aGUgYXV0aGVudGljYXRlZCB1c2VyLlxuICAgICAgICAgKiBAcGFyYW0gIHtTdHJpbmd9IHRocmVhZElkIElEIG9mIFRocmVhZCB0byBnZXQuXG4gICAgICAgICAqIEBwYXJhbSAge0Z1bmN0aW9ufSBjYWxsYmFjayBGdW5jdGlvbiB0byBjYWxsIHdoZW4gdGhlIHJlcXVlc3QgaXMgY29tcGxldGUuXG4gICAgICAgICAqL1xuICAgICAgICBmdW5jdGlvbiBnZXRUaHJlYWQodXNlcklkLCB0aHJlYWRJZCwgY2FsbGJhY2spIHtcbiAgICAgICAgICAgIHZhciByZXEgPSBnYXBpLmNsaWVudC5nbWFpbC51c2Vycy5tZXNzYWdlcy5nZXQoe1xuICAgICAgICAgICAgICAgICdpZCc6IHRocmVhZElkLFxuXG4gICAgICAgICAgICAgICAgJ3VzZXJJZCc6IHVzZXJJZCxcbiAgICAgICAgICAgICAgICAnZm9ybWF0JzogJ21ldGFkYXRhJ1xuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIHJldHVybiByZXEuZXhlY3V0ZShjYWxsYmFjayk7XG4gICAgICAgIH1cblxuICAgICAgICBnZXRUaHJlYWQoJ21lJywgcmVxdWVzdC50aHJlYWRJZCwgZnVuY3Rpb24oanNvbnJlc3AsIHJhd3Jlc3ApIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdqc29ucmVzcCcsIGpzb25yZXNwKVxuICAgICAgICAgICAgdmFyIG1zZ0lkID0gXCJcIjtcbiAgICAgICAgICAgIHZhciBzZW5kZXJOYW1lID0gXCJcIjtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwganNvbnJlc3AucGF5bG9hZC5oZWFkZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgaWYgKGpzb25yZXNwLnBheWxvYWQuaGVhZGVyc1tpXS5uYW1lID09PSBcIk1lc3NhZ2UtSURcIikge1xuICAgICAgICAgICAgICAgICAgICBtc2dJZCA9IGpzb25yZXNwLnBheWxvYWQuaGVhZGVyc1tpXS52YWx1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8gaWYgKGpzb25yZXNwLnBheWxvYWQuaGVhZGVyc1tpXS5uYW1lID09PSBcIkZyb21cIil7XG4gICAgICAgICAgICAgICAgLy8gIHNlbmRlck5hbWUgPSBqc29ucmVzcC5wYXlsb2FkLmhlYWRlcnNbaV0udmFsdWUubWF0Y2goL1tePF0qLylbMF07XG4gICAgICAgICAgICAgICAgLy8gfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIG1zZ0hhc2ggPSBoYXNoQ29kZShtc2dJZCk7XG5cbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKCdyYXdSZXNwJywgcmF3cmVzcCk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcImFyZSB3ZSBpbiBoZXJlXCIpXG4gICAgICAgICAgICBzZW5kUmVzcG9uc2UobXNnSGFzaCk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnanNvbnJlc3AnLCBqc29ucmVzcCk7XG4gICAgICAgICAgICAvLyBjb25zb2xlLmxvZygncmF3UmVzcCcsIHJhd3Jlc3ApO1xuICAgICAgICAgICAgLy8gc2VuZFJlc3BvbnNlKGpzb25yZXNwKTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xufSk7XG5cblxuLy8gYWx0ZXJuYXRpdmVseSwgbWF5YmUgYSBmdW5jdGlvbiB0aGF0IHJlbW92ZXMgdGhlIG5vbiBsZXR0ZXIgY2hhcmFjdGVycz9cbmZ1bmN0aW9uIGhhc2hDb2RlKHMpIHtcbiAgICByZXR1cm4gcy5zcGxpdChcIlwiKS5yZWR1Y2UoZnVuY3Rpb24oYSwgYikgeyBhID0gKChhIDw8IDUpIC0gYSkgKyBiLmNoYXJDb2RlQXQoMCk7XG4gICAgICAgIHJldHVybiBhICYgYSB9LCAwKTtcbn0iLCJtb2R1bGUuZXhwb3J0cz17XG4gICAgXCJtYW5pZmVzdF92ZXJzaW9uXCI6IDIsXG4gICAgXCJuYW1lXCI6IFwiSGVsbG8gV29ybGQgRXh0ZW5zaW9uXCIsXG4gICAgXCJ2ZXJzaW9uXCI6IFwiMS4wXCIsXG4gICAgXCJwZXJtaXNzaW9uc1wiOiBbXG4gICAgICAgIFwiaHR0cHM6Ly9tYWlsLmdvb2dsZS5jb20vXCIsXG4gICAgICAgIFwiaHR0cHM6Ly9pbmJveC5nb29nbGUuY29tL1wiLFxuICAgICAgICBcImlkZW50aXR5XCJcbiAgICBdLFxuICAgIC8vIFwiYnJvd3Nlcl9hY3Rpb25cIjoge1xuICAgIC8vICAgXCJkZWZhdWx0X2ljb25cIjogeyAgICAgICAgICAgICAgICAgICAgLy8gb3B0aW9uYWxcbiAgICAvLyAgICAgXCIxOVwiOiBcImltYWdlcy9pY29uMTkucG5nXCIsICAgICAgICAgICAvLyBvcHRpb25hbFxuICAgIC8vICAgICBcIjM4XCI6IFwiaW1hZ2VzL2ljb24zOC5wbmdcIiAgICAgICAgICAgIC8vIG9wdGlvbmFsXG4gICAgLy8gICB9LFxuICAgIC8vICAgXCJkZWZhdWx0X3RpdGxlXCI6IFwiR29vZ2xlIE1haWxcIiwgICAgICAvLyBvcHRpb25hbDsgc2hvd24gaW4gdG9vbHRpcFxuICAgIC8vICAgXCJkZWZhdWx0X3BvcHVwXCI6IFwicG9wdXAuaHRtbFwiICAgICAgICAvLyBvcHRpb25hbFxuICAgIC8vIH0sIFxuICAgIFwid2ViX2FjY2Vzc2libGVfcmVzb3VyY2VzXCI6IFtcbiAgICAgICAgXCJub2RlX21vZHVsZXMvKlwiLFxuICAgICAgICBcInRlbXBsYXRlcy8qXCJcbiAgICBdLFxuICAgIFwiYmFja2dyb3VuZFwiOiB7XG4gICAgICAgIFwic2NyaXB0c1wiOiBbXCJiYWNrZ3JvdW5kLmJ1bmRsZS5qc1wiXVxuICAgIH0sXG4gICAgXCJvYXV0aDJcIjoge1xuICAgICAgICBcImNsaWVudF9pZFwiOiBcIjEyNDgzNDI0NDk0OS1zbG5obzZibzlmYnRhOWY0Z21jNWNxaW9ycGthaGptNi5hcHBzLmdvb2dsZXVzZXJjb250ZW50LmNvbVwiLFxuICAgICAgICBcInNjb3Blc1wiOiBbXG4gICAgICAgICAgXCJlbWFpbFwiLCBcIm9wZW5pZFwiLCBcInByb2ZpbGVcIiwgXCJodHRwczovL3d3dy5nb29nbGVhcGlzLmNvbS9hdXRoL2dtYWlsLnJlYWRvbmx5XCJcbiAgICAgICAgXVxuICAgIH0sXG4gICAgXCJjb250ZW50X3NlY3VyaXR5X3BvbGljeVwiOiBcInNjcmlwdC1zcmMgJ3NlbGYnICd1bnNhZmUtZXZhbCcgaHR0cHM6Ly8qLmdvb2dsZS5jb20gaHR0cHM6Ly9jYXBzdG9uZTE2MDRnaGEuZmlyZWJhc2Vpby5jb207IG9iamVjdC1zcmMgJ3NlbGYnIGh0dHBzOi8vKi5nb29nbGUuY29tIGh0dHBzOi8vY2Fwc3RvbmUxNjA0Z2hhLmZpcmViYXNlaW8uY29tXCIsXG4gICAgXCJjb250ZW50X3NjcmlwdHNcIjogW3tcbiAgICAgICAgXCJtYXRjaGVzXCI6IFtcImh0dHBzOi8vbWFpbC5nb29nbGUuY29tLypcIiwgXCJodHRwczovL2luYm94Lmdvb2dsZS5jb20vKlwiXSxcbiAgICAgICAgXCJqc1wiOiBbXCJmaXJlYmFzZS5qc1wiLCBcImluYm94c2RrLmpzXCIsIFwiYnVuZGxlLmpzXCJdXG4gICAgfV0sXG4gICAgXCJrZXlcIjogXCJNSUlCSWpBTkJna3Foa2lHOXcwQkFRRUZBQU9DQVE4QU1JSUJDZ0tDQVFFQXlGMlA1Qjd2aStaNnZFT29MN1RsWllkVDNDRUJIcmhkcDgzLzlwelR1QSs5WnJoZ0dRR0MwaXgrdTc1RHhwb3pQekIrUk96V3ZUSHhMZ2R2dFZ2SDk3WmFib2NhYlU4Um15WkZQN1pRblJnOUZ4OTFUY1ljQmkraSt0NEh6aC80cU8xdHNPd2k4N1dNYlVSRjNwd01tamlSWFZ0dG9IUVZhNDJoY0R5SG9TemJ1U0l0VjJVdUVVbkdMMmxyV2R6M0c5QkJvcmVFdHhKY2o1Wk80cU03K2FWbjBHRzVXV3g1WW1qaFQ5WDgxUmRTcjZxaGlpTy9IT0pWYnFaVjVkOVViWThZbzRtemhRaFBqVnVDb2tpNmN2c0NNOVdESTIrVlV3cWlKWDZNUUNpVUY2QUdmaFNnMkNhcGcxWlpEekcyTXZvOG96WFJ5d1NaUENnVCtCYkd6UUlEQVFBQlwiXG59Il19
