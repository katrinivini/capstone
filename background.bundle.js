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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3Vzci9sb2NhbC9saWIvbm9kZV9tb2R1bGVzL3dhdGNoaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJnYXBpL2JhY2tncm91bmQtdHdvLmpzIiwiZ2FwaS9jb21tZW50LmpzIiwiZ2FwaS90YXNraGlzdG9yeS5qcyIsIm1hbmlmZXN0Lmpzb24iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3SUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwidmFyIGhlYWQgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnaGVhZCcpWzBdO1xudmFyIGF1dGhTY3JpcHQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzY3JpcHQnKTtcbmF1dGhTY3JpcHQudHlwZSA9ICd0ZXh0L2phdmFzY3JpcHQnO1xuYXV0aFNjcmlwdC5zcmMgPSBcImh0dHBzOi8vYXBpcy5nb29nbGUuY29tL2pzL2NsaWVudC5qcz9vbmxvYWQ9Y2hlY2tBdXRoXCI7XG5kb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGF1dGhTY3JpcHQpO1xuY29uc29sZS5sb2coZG9jdW1lbnQuYm9keSlcblxudmFyIGJvZHkgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnYm9keScpWzBdO1xudmFyIGRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuZGl2LmlkID0gXCJhdXRob3JpemUtZGl2XCI7XG5kaXYuc3R5bGUgPSBcImRpc3BheTogbm9uZVwiO1xudmFyIHNwYW4gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJyk7XG5zcGFuLmlubmVySFRNTCA9IFwiQXV0aG9yaXplIGFjY2VzcyB0byBHbWFpbCBBUElcIjtcbnZhciBidXR0b24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdidXR0b24nKTtcbmJ1dHRvbi5pZCA9IFwiYXV0aG9yaXplLWJ1dHRvblwiO1xuYnV0dG9uLmlubmVySFRNTCA9IFwiQXV0aG9yaXplXCI7XG5idXR0b24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbihldmVudCkge1xuICAgIGhhbmRsZUF1dGhDbGljayhldmVudCk7XG59KVxudmFyIHByZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3ByZScpO1xucHJlLmlkID0gXCJvdXRwdXRcIlxudmFyIERJViA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuZGl2LmFwcGVuZENoaWxkKHNwYW4pO1xuZGl2LmFwcGVuZENoaWxkKGJ1dHRvbik7XG5ESVYuYXBwZW5kQ2hpbGQoZGl2KTtcbkRJVi5hcHBlbmRDaGlsZChwcmUpO1xuYm9keS5hcHBlbmRDaGlsZChESVYpO1xuXG4vLyBZb3VyIENsaWVudCBJRCBjYW4gYmUgcmV0cmlldmVkIGZyb20geW91ciBwcm9qZWN0IGluIHRoZSBHb29nbGVcbi8vIERldmVsb3BlciBDb25zb2xlLCBodHRwczovL2NvbnNvbGUuZGV2ZWxvcGVycy5nb29nbGUuY29tXG52YXIgQ0xJRU5UX0lEID0gcmVxdWlyZSgnLi4vbWFuaWZlc3QuanNvbicpLm9hdXRoMi5jbGllbnRfaWRcblxudmFyIFNDT1BFUyA9IFsnaHR0cHM6Ly93d3cuZ29vZ2xlYXBpcy5jb20vYXV0aC9nbWFpbC5yZWFkb25seSddO1xuXG4vKipcbiAqIENoZWNrIGlmIGN1cnJlbnQgdXNlciBoYXMgYXV0aG9yaXplZCB0aGlzIGFwcGxpY2F0aW9uLlxuICovXG53aW5kb3cuY2hlY2tBdXRoID0gZnVuY3Rpb24gY2hlY2tBdXRoKCkge1xuICAgIGNvbnNvbGUubG9nKCdkaWQgeW91IGdldCBpbiBoZXJlPycpO1xuICAgIGdhcGkuYXV0aC5hdXRob3JpemUoe1xuICAgICAgICAnY2xpZW50X2lkJzogQ0xJRU5UX0lELFxuICAgICAgICAnc2NvcGUnOiBTQ09QRVMsXG4gICAgICAgICdpbW1lZGlhdGUnOiB0cnVlXG4gICAgfSwgaGFuZGxlQXV0aFJlc3VsdCk7XG59XG5cbi8qKlxuICogSGFuZGxlIHJlc3BvbnNlIGZyb20gYXV0aG9yaXphdGlvbiBzZXJ2ZXIuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGF1dGhSZXN1bHQgQXV0aG9yaXphdGlvbiByZXN1bHQuXG4gKi9cbmZ1bmN0aW9uIGhhbmRsZUF1dGhSZXN1bHQoYXV0aFJlc3VsdCkge1xuICAgIGNvbnNvbGUubG9nKCdhdXRoUmVzdWx0OiAnLCBhdXRoUmVzdWx0KTtcbiAgICB2YXIgYXV0aG9yaXplRGl2ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2F1dGhvcml6ZS1kaXYnKTtcbiAgICBpZiAoYXV0aFJlc3VsdCAmJiAhYXV0aFJlc3VsdC5lcnJvcikge1xuICAgICAgICAvLyBIaWRlIGF1dGggVUksIHRoZW4gbG9hZCBjbGllbnQgbGlicmFyeS5cbiAgICAgICAgYXV0aG9yaXplRGl2LnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gICAgICAgIGxvYWRHbWFpbEFwaSgpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIFNob3cgYXV0aCBVSSwgYWxsb3dpbmcgdGhlIHVzZXIgdG8gaW5pdGlhdGUgYXV0aG9yaXphdGlvbiBieVxuICAgICAgICAvLyBjbGlja2luZyBhdXRob3JpemUgYnV0dG9uLlxuICAgICAgICBhdXRob3JpemVEaXYuc3R5bGUuZGlzcGxheSA9ICdpbmxpbmUnO1xuICAgIH1cbn1cblxuLyoqXG4gKiBJbml0aWF0ZSBhdXRoIGZsb3cgaW4gcmVzcG9uc2UgdG8gdXNlciBjbGlja2luZyBhdXRob3JpemUgYnV0dG9uLlxuICpcbiAqIEBwYXJhbSB7RXZlbnR9IGV2ZW50IEJ1dHRvbiBjbGljayBldmVudC5cbiAqL1xuZnVuY3Rpb24gaGFuZGxlQXV0aENsaWNrKGV2ZW50KSB7XG4gICAgY29uc29sZS5sb2coJ2V2ZW50OiAnLCBldmVudCk7XG4gICAgZ2FwaS5hdXRoLmF1dGhvcml6ZSh7IGNsaWVudF9pZDogQ0xJRU5UX0lELCBzY29wZTogU0NPUEVTLCBpbW1lZGlhdGU6IGZhbHNlIH0sXG4gICAgICAgIGhhbmRsZUF1dGhSZXN1bHQpO1xuICAgIHJldHVybiBmYWxzZTtcbn1cblxuLyoqXG4gKiBMb2FkIEdtYWlsIEFQSSBjbGllbnQgbGlicmFyeS4gTGlzdCBsYWJlbHMgb25jZSBjbGllbnQgbGlicmFyeVxuICogaXMgbG9hZGVkLlxuICovXG5mdW5jdGlvbiBsb2FkR21haWxBcGkoKSB7XG4gICAgZ2FwaS5jbGllbnQubG9hZCgnZ21haWwnLCAndjEnLCBsaXN0TGFiZWxzKTtcbn1cblxuLyoqXG4gKiBQcmludCBhbGwgTGFiZWxzIGluIHRoZSBhdXRob3JpemVkIHVzZXIncyBpbmJveC4gSWYgbm8gbGFiZWxzXG4gKiBhcmUgZm91bmQgYW4gYXBwcm9wcmlhdGUgbWVzc2FnZSBpcyBwcmludGVkLlxuICovXG5mdW5jdGlvbiBsaXN0TGFiZWxzKCkge1xuICAgIHZhciByZXF1ZXN0ID0gZ2FwaS5jbGllbnQuZ21haWwudXNlcnMubGFiZWxzLmxpc3Qoe1xuICAgICAgICAndXNlcklkJzogJ21lJ1xuICAgIH0pO1xuXG4gICAgcmVxdWVzdC5leGVjdXRlKGZ1bmN0aW9uKHJlc3ApIHtcbiAgICAgICAgY29uc29sZS5sb2coJ3Jlc3A6ICcsIHJlc3ApO1xuICAgICAgICB2YXIgbGFiZWxzID0gcmVzcC5sYWJlbHM7XG4gICAgICAgIGFwcGVuZFByZSgnTGFiZWxzOicpO1xuXG4gICAgICAgIGlmIChsYWJlbHMgJiYgbGFiZWxzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCBsYWJlbHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICB2YXIgbGFiZWwgPSBsYWJlbHNbaV07XG4gICAgICAgICAgICAgICAgYXBwZW5kUHJlKGxhYmVsLm5hbWUpXG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBhcHBlbmRQcmUoJ05vIExhYmVscyBmb3VuZC4nKTtcbiAgICAgICAgfVxuICAgIH0pO1xufVxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgZ2V0VGhyZWFkOiBnZXRUaHJlYWRcbn1cblxuLyoqXG4gKiBBcHBlbmQgYSBwcmUgZWxlbWVudCB0byB0aGUgYm9keSBjb250YWluaW5nIHRoZSBnaXZlbiBtZXNzYWdlXG4gKiBhcyBpdHMgdGV4dCBub2RlLlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBtZXNzYWdlIFRleHQgdG8gYmUgcGxhY2VkIGluIHByZSBlbGVtZW50LlxuICovXG5mdW5jdGlvbiBhcHBlbmRQcmUobWVzc2FnZSkge1xuICAgIHZhciBwcmUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnb3V0cHV0Jyk7XG4gICAgdmFyIHRleHRDb250ZW50ID0gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUobWVzc2FnZSArICdcXG4nKTtcbiAgICBwcmUuYXBwZW5kQ2hpbGQodGV4dENvbnRlbnQpO1xufVxuXG5cbnZhciBnZXRUaHJlYWQgPSBmdW5jdGlvbih1c2VySWQsIHRocmVhZElkLCBjYWxsYmFjaykge1xuICAgIHJldHVybiBnYXBpLmNsaWVudC5nbWFpbC51c2Vycy5tZXNzYWdlcy5nZXQoe1xuICAgICAgICAnaWQnOiB0aHJlYWRJZCxcbiAgICAgICAgJ3VzZXJJZCc6IHVzZXJJZCxcbiAgICAgICAgJ2Zvcm1hdCc6ICdtZXRhZGF0YSdcbiAgICB9KVxuICAgIC50aGVuKGZ1bmN0aW9uKHJlc3Ape1xuICAgICAgICByZXR1cm4gcmVzcDtcbiAgICB9KVxuICAgIC8vIHJldHVybiByZXEuZXhlY3V0ZShjYWxsYmFjayk7XG59XG5cbnJlcXVpcmUoJy4vdGFza2hpc3RvcnkuanMnKTtcbnJlcXVpcmUoJy4vY29tbWVudC5qcycpO1xuXG4iLCIvLyB2YXIgZ2V0VGhyZWFkID0gZnVuY3Rpb24odXNlcklkLCB0aHJlYWRJZCwgY2FsbGJhY2spIHtcbi8vICAgICB2YXIgIHJlcSA9IGdhcGkuY2xpZW50LmdtYWlsLnVzZXJzLm1lc3NhZ2VzLmdldCh7XG4vLyAgICAgICAgICAgICAnaWQnOiB0aHJlYWRJZCxcbi8vICAgICAgICAgICAgICd1c2VySWQnOiB1c2VySWQsXG4vLyAgICAgICAgICAgICAnZm9ybWF0JzogJ21ldGFkYXRhJ1xuLy8gICAgICAgICB9KVxuLy8gICAgICAgICByZXR1cm4gcmVxLmV4ZWN1dGUoY2FsbGJhY2spO1xuLy8gfVxuXG4vLyBjaHJvbWUucnVudGltZS5vbk1lc3NhZ2UuYWRkTGlzdGVuZXIoZnVuY3Rpb24ocmVxdWVzdCwgc2VuZGVyLCBzZW5kUmVzcG9uc2UpIHtcbi8vIFx0cmVxdWVzdC51c2VyLm5hbWU7XG4vLyAgICAgaWYgKHJlcXVlc3QudHlwZSA9PT0gJ2FkZCBjb21tZW50Jykge1xuLy8gICAgICAgICBnZXRUaHJlYWQoJ21lJywgcmVxdWVzdC50aHJlYWRJZCwgZnVuY3Rpb24oanNvbnJlc3ApIHtcbi8vICAgICAgICAgICAgIGpzb25yZXNwLnBheWxvYWQuaGVhZGVycy5mb3JFYWNoKGZ1bmN0aW9uKGhlYWRlcil7XG4vLyAgICAgICAgICAgICBcdGlmIChoZWFkZXIubmFtZSA9PT0gJ01lc3NhZ2UtSUQnKSB7XG4gICAgICAgICAgICBcdFx0XG4vLyAgICAgICAgICAgICBcdH1cbi8vICAgICAgICAgICAgIH0pXG4vLyAgICAgICAgIH0pXG4vLyAgICAgfVxuLy8gfSlcbiIsImNocm9tZS5ydW50aW1lLm9uTWVzc2FnZS5hZGRMaXN0ZW5lcihmdW5jdGlvbihyZXF1ZXN0LCBzZW5kZXIsIHNlbmRSZXNwb25zZSkge1xuICAgIGlmIChyZXF1ZXN0LnR5cGUgPT09ICdyZWFkIG1lc3NhZ2UnKSB7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBHZXQgVGhyZWFkIHdpdGggZ2l2ZW4gSUQuXG4gICAgICAgICAqXG4gICAgICAgICAqIEBwYXJhbSAge1N0cmluZ30gdXNlcklkIFVzZXIncyBlbWFpbCBhZGRyZXNzLiBUaGUgc3BlY2lhbCB2YWx1ZSAnbWUnXG4gICAgICAgICAqIGNhbiBiZSB1c2VkIHRvIGluZGljYXRlIHRoZSBhdXRoZW50aWNhdGVkIHVzZXIuXG4gICAgICAgICAqIEBwYXJhbSAge1N0cmluZ30gdGhyZWFkSWQgSUQgb2YgVGhyZWFkIHRvIGdldC5cbiAgICAgICAgICogQHBhcmFtICB7RnVuY3Rpb259IGNhbGxiYWNrIEZ1bmN0aW9uIHRvIGNhbGwgd2hlbiB0aGUgcmVxdWVzdCBpcyBjb21wbGV0ZS5cbiAgICAgICAgICovXG4gICAgICAgIGZ1bmN0aW9uIGdldFRocmVhZCh1c2VySWQsIHRocmVhZElkLCBjYWxsYmFjaykge1xuICAgICAgICAgICAgdmFyIHJlcSA9IGdhcGkuY2xpZW50LmdtYWlsLnVzZXJzLm1lc3NhZ2VzLmdldCh7XG4gICAgICAgICAgICAgICAgJ2lkJzogdGhyZWFkSWQsXG5cbiAgICAgICAgICAgICAgICAndXNlcklkJzogdXNlcklkLFxuICAgICAgICAgICAgICAgICdmb3JtYXQnOiAnbWV0YWRhdGEnXG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgcmV0dXJuIHJlcS5leGVjdXRlKGNhbGxiYWNrKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGdldFRocmVhZCgnbWUnLCByZXF1ZXN0LnRocmVhZElkLCBmdW5jdGlvbihqc29ucmVzcCwgcmF3cmVzcCkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ2pzb25yZXNwJywganNvbnJlc3ApXG4gICAgICAgICAgICB2YXIgbXNnSWQgPSBcIlwiO1xuICAgICAgICAgICAgdmFyIHNlbmRlck5hbWUgPSBcIlwiO1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBqc29ucmVzcC5wYXlsb2FkLmhlYWRlcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBpZiAoanNvbnJlc3AucGF5bG9hZC5oZWFkZXJzW2ldLm5hbWUgPT09IFwiTWVzc2FnZS1JRFwiKSB7XG4gICAgICAgICAgICAgICAgICAgIG1zZ0lkID0ganNvbnJlc3AucGF5bG9hZC5oZWFkZXJzW2ldLnZhbHVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyBpZiAoanNvbnJlc3AucGF5bG9hZC5oZWFkZXJzW2ldLm5hbWUgPT09IFwiRnJvbVwiKXtcbiAgICAgICAgICAgICAgICAvLyAgc2VuZGVyTmFtZSA9IGpzb25yZXNwLnBheWxvYWQuaGVhZGVyc1tpXS52YWx1ZS5tYXRjaCgvW148XSovKVswXTtcbiAgICAgICAgICAgICAgICAvLyB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgbXNnSGFzaCA9IGhhc2hDb2RlKG1zZ0lkKTtcblxuICAgICAgICAgICAgLy8gY29uc29sZS5sb2coJ3Jhd1Jlc3AnLCByYXdyZXNwKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiYXJlIHdlIGluIGhlcmVcIilcbiAgICAgICAgICAgIHNlbmRSZXNwb25zZShtc2dIYXNoKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdqc29ucmVzcCcsIGpzb25yZXNwKTtcbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKCdyYXdSZXNwJywgcmF3cmVzcCk7XG4gICAgICAgICAgICAvLyBzZW5kUmVzcG9uc2UoanNvbnJlc3ApO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgcmV0dXJuIHRydWU7XG59KTtcblxuXG4vLyBhbHRlcm5hdGl2ZWx5LCBtYXliZSBhIGZ1bmN0aW9uIHRoYXQgcmVtb3ZlcyB0aGUgbm9uIGxldHRlciBjaGFyYWN0ZXJzP1xuZnVuY3Rpb24gaGFzaENvZGUocykge1xuICAgIHJldHVybiBzLnNwbGl0KFwiXCIpLnJlZHVjZShmdW5jdGlvbihhLCBiKSB7IGEgPSAoKGEgPDwgNSkgLSBhKSArIGIuY2hhckNvZGVBdCgwKTtcbiAgICAgICAgcmV0dXJuIGEgJiBhIH0sIDApO1xufSIsIm1vZHVsZS5leHBvcnRzPXtcbiAgICBcIm1hbmlmZXN0X3ZlcnNpb25cIjogMixcbiAgICBcIm5hbWVcIjogXCJIZWxsbyBXb3JsZCBFeHRlbnNpb25cIixcbiAgICBcInZlcnNpb25cIjogXCIxLjBcIixcbiAgICBcInBlcm1pc3Npb25zXCI6IFtcbiAgICAgICAgXCJodHRwczovL21haWwuZ29vZ2xlLmNvbS9cIixcbiAgICAgICAgXCJodHRwczovL2luYm94Lmdvb2dsZS5jb20vXCIsXG4gICAgICAgIFwiaWRlbnRpdHlcIlxuICAgIF0sXG4gICAgLy8gXCJicm93c2VyX2FjdGlvblwiOiB7XG4gICAgLy8gICBcImRlZmF1bHRfaWNvblwiOiB7ICAgICAgICAgICAgICAgICAgICAvLyBvcHRpb25hbFxuICAgIC8vICAgICBcIjE5XCI6IFwiaW1hZ2VzL2ljb24xOS5wbmdcIiwgICAgICAgICAgIC8vIG9wdGlvbmFsXG4gICAgLy8gICAgIFwiMzhcIjogXCJpbWFnZXMvaWNvbjM4LnBuZ1wiICAgICAgICAgICAgLy8gb3B0aW9uYWxcbiAgICAvLyAgIH0sXG4gICAgLy8gICBcImRlZmF1bHRfdGl0bGVcIjogXCJHb29nbGUgTWFpbFwiLCAgICAgIC8vIG9wdGlvbmFsOyBzaG93biBpbiB0b29sdGlwXG4gICAgLy8gICBcImRlZmF1bHRfcG9wdXBcIjogXCJwb3B1cC5odG1sXCIgICAgICAgIC8vIG9wdGlvbmFsXG4gICAgLy8gfSwgXG4gICAgXCJ3ZWJfYWNjZXNzaWJsZV9yZXNvdXJjZXNcIjogW1xuICAgICAgICBcIm5vZGVfbW9kdWxlcy8qXCIsXG4gICAgICAgIFwidGVtcGxhdGVzLypcIlxuICAgIF0sXG4gICAgXCJiYWNrZ3JvdW5kXCI6IHtcbiAgICAgICAgXCJzY3JpcHRzXCI6IFtcImJhY2tncm91bmQuYnVuZGxlLmpzXCJdXG4gICAgfSxcbiAgICBcIm9hdXRoMlwiOiB7XG4gICAgICAgIFwiY2xpZW50X2lkXCI6IFwiMTI0ODM0MjQ0OTQ5LXNsbmhvNmJvOWZidGE5ZjRnbWM1Y3Fpb3Jwa2Foam02LmFwcHMuZ29vZ2xldXNlcmNvbnRlbnQuY29tXCIsXG4gICAgICAgIFwic2NvcGVzXCI6IFtcbiAgICAgICAgICBcImVtYWlsXCIsIFwib3BlbmlkXCIsIFwicHJvZmlsZVwiLCBcImh0dHBzOi8vd3d3Lmdvb2dsZWFwaXMuY29tL2F1dGgvZ21haWwucmVhZG9ubHlcIlxuICAgICAgICBdXG4gICAgfSxcbiAgICBcImNvbnRlbnRfc2VjdXJpdHlfcG9saWN5XCI6IFwic2NyaXB0LXNyYyAnc2VsZicgJ3Vuc2FmZS1ldmFsJyBodHRwczovLyouZ29vZ2xlLmNvbSBodHRwczovL2NhcHN0b25lMTYwNGdoYS5maXJlYmFzZWlvLmNvbTsgb2JqZWN0LXNyYyAnc2VsZicgaHR0cHM6Ly8qLmdvb2dsZS5jb20gaHR0cHM6Ly9jYXBzdG9uZTE2MDRnaGEuZmlyZWJhc2Vpby5jb21cIixcbiAgICBcImNvbnRlbnRfc2NyaXB0c1wiOiBbe1xuICAgICAgICBcIm1hdGNoZXNcIjogW1wiaHR0cHM6Ly9tYWlsLmdvb2dsZS5jb20vKlwiLCBcImh0dHBzOi8vaW5ib3guZ29vZ2xlLmNvbS8qXCJdLFxuICAgICAgICBcImpzXCI6IFtcImZpcmViYXNlLmpzXCIsIFwiaW5ib3hzZGsuanNcIiwgXCJidW5kbGUuanNcIl1cbiAgICB9XSxcbiAgICBcImtleVwiOiBcIk1JSUJJakFOQmdrcWhraUc5dzBCQVFFRkFBT0NBUThBTUlJQkNnS0NBUUVBeUYyUDVCN3ZpK1o2dkVPb0w3VGxaWWRUM0NFQkhyaGRwODMvOXB6VHVBKzlacmhnR1FHQzBpeCt1NzVEeHBvelB6QitST3pXdlRIeExnZHZ0VnZIOTdaYWJvY2FiVThSbXlaRlA3WlFuUmc5Rng5MVRjWWNCaStpK3Q0SHpoLzRxTzF0c093aTg3V01iVVJGM3B3TW1qaVJYVnR0b0hRVmE0MmhjRHlIb1N6YnVTSXRWMlV1RVVuR0wybHJXZHozRzlCQm9yZUV0eEpjajVaTzRxTTcrYVZuMEdHNVdXeDVZbWpoVDlYODFSZFNyNnFoaWlPL0hPSlZicVpWNWQ5VWJZOFlvNG16aFFoUGpWdUNva2k2Y3ZzQ005V0RJMitWVXdxaUpYNk1RQ2lVRjZBR2ZoU2cyQ2FwZzFaWkR6RzJNdm84b3pYUnl3U1pQQ2dUK0JiR3pRSURBUUFCXCJcbn0iXX0=
