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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3Vzci9sb2NhbC9saWIvbm9kZV9tb2R1bGVzL3dhdGNoaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJnYXBpL2JhY2tncm91bmQtdHdvLmpzIiwiZ2FwaS9jb21tZW50LmpzIiwiZ2FwaS90YXNraGlzdG9yeS5qcyIsIm1hbmlmZXN0Lmpzb24iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3SUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwidmFyIGhlYWQgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnaGVhZCcpWzBdO1xudmFyIGF1dGhTY3JpcHQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzY3JpcHQnKTtcbmF1dGhTY3JpcHQudHlwZSA9ICd0ZXh0L2phdmFzY3JpcHQnO1xuYXV0aFNjcmlwdC5zcmMgPSBcImh0dHBzOi8vYXBpcy5nb29nbGUuY29tL2pzL2NsaWVudC5qcz9vbmxvYWQ9Y2hlY2tBdXRoXCI7XG5kb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGF1dGhTY3JpcHQpO1xuY29uc29sZS5sb2coZG9jdW1lbnQuYm9keSlcblxudmFyIGJvZHkgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnYm9keScpWzBdO1xudmFyIGRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuZGl2LmlkID0gXCJhdXRob3JpemUtZGl2XCI7XG5kaXYuc3R5bGUgPSBcImRpc3BheTogbm9uZVwiO1xudmFyIHNwYW4gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJyk7XG5zcGFuLmlubmVySFRNTCA9IFwiQXV0aG9yaXplIGFjY2VzcyB0byBHbWFpbCBBUElcIjtcbnZhciBidXR0b24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdidXR0b24nKTtcbmJ1dHRvbi5pZCA9IFwiYXV0aG9yaXplLWJ1dHRvblwiO1xuYnV0dG9uLmlubmVySFRNTCA9IFwiQXV0aG9yaXplXCI7XG5idXR0b24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbihldmVudCkge1xuICAgIGhhbmRsZUF1dGhDbGljayhldmVudCk7XG59KVxudmFyIHByZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3ByZScpO1xucHJlLmlkID0gXCJvdXRwdXRcIlxudmFyIERJViA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuZGl2LmFwcGVuZENoaWxkKHNwYW4pO1xuZGl2LmFwcGVuZENoaWxkKGJ1dHRvbik7XG5ESVYuYXBwZW5kQ2hpbGQoZGl2KTtcbkRJVi5hcHBlbmRDaGlsZChwcmUpO1xuYm9keS5hcHBlbmRDaGlsZChESVYpO1xuXG4vLyBZb3VyIENsaWVudCBJRCBjYW4gYmUgcmV0cmlldmVkIGZyb20geW91ciBwcm9qZWN0IGluIHRoZSBHb29nbGVcbi8vIERldmVsb3BlciBDb25zb2xlLCBodHRwczovL2NvbnNvbGUuZGV2ZWxvcGVycy5nb29nbGUuY29tXG52YXIgQ0xJRU5UX0lEID0gcmVxdWlyZSgnLi4vbWFuaWZlc3QuanNvbicpLm9hdXRoMi5jbGllbnRfaWRcblxudmFyIFNDT1BFUyA9IFsnaHR0cHM6Ly93d3cuZ29vZ2xlYXBpcy5jb20vYXV0aC9nbWFpbC5yZWFkb25seSddO1xuXG4vKipcbiAqIENoZWNrIGlmIGN1cnJlbnQgdXNlciBoYXMgYXV0aG9yaXplZCB0aGlzIGFwcGxpY2F0aW9uLlxuICovXG53aW5kb3cuY2hlY2tBdXRoID0gZnVuY3Rpb24gY2hlY2tBdXRoKCkge1xuICAgIGNvbnNvbGUubG9nKCdkaWQgeW91IGdldCBpbiBoZXJlPycpO1xuICAgIGdhcGkuYXV0aC5hdXRob3JpemUoe1xuICAgICAgICAnY2xpZW50X2lkJzogQ0xJRU5UX0lELFxuICAgICAgICAnc2NvcGUnOiBTQ09QRVMsXG4gICAgICAgICdpbW1lZGlhdGUnOiB0cnVlXG4gICAgfSwgaGFuZGxlQXV0aFJlc3VsdCk7XG59XG5cbi8qKlxuICogSGFuZGxlIHJlc3BvbnNlIGZyb20gYXV0aG9yaXphdGlvbiBzZXJ2ZXIuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGF1dGhSZXN1bHQgQXV0aG9yaXphdGlvbiByZXN1bHQuXG4gKi9cbmZ1bmN0aW9uIGhhbmRsZUF1dGhSZXN1bHQoYXV0aFJlc3VsdCkge1xuICAgIGNvbnNvbGUubG9nKCdhdXRoUmVzdWx0OiAnLCBhdXRoUmVzdWx0KTtcbiAgICB2YXIgYXV0aG9yaXplRGl2ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2F1dGhvcml6ZS1kaXYnKTtcbiAgICBpZiAoYXV0aFJlc3VsdCAmJiAhYXV0aFJlc3VsdC5lcnJvcikge1xuICAgICAgICAvLyBIaWRlIGF1dGggVUksIHRoZW4gbG9hZCBjbGllbnQgbGlicmFyeS5cbiAgICAgICAgYXV0aG9yaXplRGl2LnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gICAgICAgIGxvYWRHbWFpbEFwaSgpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIFNob3cgYXV0aCBVSSwgYWxsb3dpbmcgdGhlIHVzZXIgdG8gaW5pdGlhdGUgYXV0aG9yaXphdGlvbiBieVxuICAgICAgICAvLyBjbGlja2luZyBhdXRob3JpemUgYnV0dG9uLlxuICAgICAgICBhdXRob3JpemVEaXYuc3R5bGUuZGlzcGxheSA9ICdpbmxpbmUnO1xuICAgIH1cbn1cblxuLyoqXG4gKiBJbml0aWF0ZSBhdXRoIGZsb3cgaW4gcmVzcG9uc2UgdG8gdXNlciBjbGlja2luZyBhdXRob3JpemUgYnV0dG9uLlxuICpcbiAqIEBwYXJhbSB7RXZlbnR9IGV2ZW50IEJ1dHRvbiBjbGljayBldmVudC5cbiAqL1xuZnVuY3Rpb24gaGFuZGxlQXV0aENsaWNrKGV2ZW50KSB7XG4gICAgY29uc29sZS5sb2coJ2V2ZW50OiAnLCBldmVudCk7XG4gICAgZ2FwaS5hdXRoLmF1dGhvcml6ZSh7IGNsaWVudF9pZDogQ0xJRU5UX0lELCBzY29wZTogU0NPUEVTLCBpbW1lZGlhdGU6IGZhbHNlIH0sXG4gICAgICAgIGhhbmRsZUF1dGhSZXN1bHQpO1xuICAgIHJldHVybiBmYWxzZTtcbn1cblxuLyoqXG4gKiBMb2FkIEdtYWlsIEFQSSBjbGllbnQgbGlicmFyeS4gTGlzdCBsYWJlbHMgb25jZSBjbGllbnQgbGlicmFyeVxuICogaXMgbG9hZGVkLlxuICovXG5mdW5jdGlvbiBsb2FkR21haWxBcGkoKSB7XG4gICAgZ2FwaS5jbGllbnQubG9hZCgnZ21haWwnLCAndjEnLCBsaXN0TGFiZWxzKTtcbn1cblxuLyoqXG4gKiBQcmludCBhbGwgTGFiZWxzIGluIHRoZSBhdXRob3JpemVkIHVzZXIncyBpbmJveC4gSWYgbm8gbGFiZWxzXG4gKiBhcmUgZm91bmQgYW4gYXBwcm9wcmlhdGUgbWVzc2FnZSBpcyBwcmludGVkLlxuICovXG5mdW5jdGlvbiBsaXN0TGFiZWxzKCkge1xuICAgIHZhciByZXF1ZXN0ID0gZ2FwaS5jbGllbnQuZ21haWwudXNlcnMubGFiZWxzLmxpc3Qoe1xuICAgICAgICAndXNlcklkJzogJ21lJ1xuICAgIH0pO1xuXG4gICAgcmVxdWVzdC5leGVjdXRlKGZ1bmN0aW9uKHJlc3ApIHtcbiAgICAgICAgY29uc29sZS5sb2coJ3Jlc3A6ICcsIHJlc3ApO1xuICAgICAgICB2YXIgbGFiZWxzID0gcmVzcC5sYWJlbHM7XG4gICAgICAgIGFwcGVuZFByZSgnTGFiZWxzOicpO1xuXG4gICAgICAgIGlmIChsYWJlbHMgJiYgbGFiZWxzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCBsYWJlbHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICB2YXIgbGFiZWwgPSBsYWJlbHNbaV07XG4gICAgICAgICAgICAgICAgYXBwZW5kUHJlKGxhYmVsLm5hbWUpXG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBhcHBlbmRQcmUoJ05vIExhYmVscyBmb3VuZC4nKTtcbiAgICAgICAgfVxuICAgIH0pO1xufVxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgZ2V0VGhyZWFkOiBnZXRUaHJlYWRcbn1cblxuLyoqXG4gKiBBcHBlbmQgYSBwcmUgZWxlbWVudCB0byB0aGUgYm9keSBjb250YWluaW5nIHRoZSBnaXZlbiBtZXNzYWdlXG4gKiBhcyBpdHMgdGV4dCBub2RlLlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBtZXNzYWdlIFRleHQgdG8gYmUgcGxhY2VkIGluIHByZSBlbGVtZW50LlxuICovXG5mdW5jdGlvbiBhcHBlbmRQcmUobWVzc2FnZSkge1xuICAgIHZhciBwcmUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnb3V0cHV0Jyk7XG4gICAgdmFyIHRleHRDb250ZW50ID0gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUobWVzc2FnZSArICdcXG4nKTtcbiAgICBwcmUuYXBwZW5kQ2hpbGQodGV4dENvbnRlbnQpO1xufVxuXG5cbnZhciBnZXRUaHJlYWQgPSBmdW5jdGlvbih1c2VySWQsIHRocmVhZElkLCBjYWxsYmFjaykge1xuICAgIHJldHVybiBnYXBpLmNsaWVudC5nbWFpbC51c2Vycy5tZXNzYWdlcy5nZXQoe1xuICAgICAgICAnaWQnOiB0aHJlYWRJZCxcbiAgICAgICAgJ3VzZXJJZCc6IHVzZXJJZCxcbiAgICAgICAgJ2Zvcm1hdCc6ICdtZXRhZGF0YSdcbiAgICB9KVxuICAgIC50aGVuKGZ1bmN0aW9uKHJlc3Ape1xuICAgICAgICByZXR1cm4gcmVzcDtcbiAgICB9KVxuICAgIC8vIHJldHVybiByZXEuZXhlY3V0ZShjYWxsYmFjayk7XG59XG5cbnJlcXVpcmUoJy4vdGFza2hpc3RvcnkuanMnKTtcbnJlcXVpcmUoJy4vY29tbWVudC5qcycpO1xuXG4iLCIvLyB2YXIgZ2V0VGhyZWFkID0gZnVuY3Rpb24odXNlcklkLCB0aHJlYWRJZCwgY2FsbGJhY2spIHtcbi8vICAgICB2YXIgIHJlcSA9IGdhcGkuY2xpZW50LmdtYWlsLnVzZXJzLm1lc3NhZ2VzLmdldCh7XG4vLyAgICAgICAgICAgICAnaWQnOiB0aHJlYWRJZCxcbi8vICAgICAgICAgICAgICd1c2VySWQnOiB1c2VySWQsXG4vLyAgICAgICAgICAgICAnZm9ybWF0JzogJ21ldGFkYXRhJ1xuLy8gICAgICAgICB9KVxuLy8gICAgICAgICByZXR1cm4gcmVxLmV4ZWN1dGUoY2FsbGJhY2spO1xuLy8gfVxuXG4vLyBjaHJvbWUucnVudGltZS5vbk1lc3NhZ2UuYWRkTGlzdGVuZXIoZnVuY3Rpb24ocmVxdWVzdCwgc2VuZGVyLCBzZW5kUmVzcG9uc2UpIHtcbi8vIFx0cmVxdWVzdC51c2VyLm5hbWU7XG4vLyAgICAgaWYgKHJlcXVlc3QudHlwZSA9PT0gJ2FkZCBjb21tZW50Jykge1xuLy8gICAgICAgICBnZXRUaHJlYWQoJ21lJywgcmVxdWVzdC50aHJlYWRJZCwgZnVuY3Rpb24oanNvbnJlc3ApIHtcbi8vICAgICAgICAgICAgIGpzb25yZXNwLnBheWxvYWQuaGVhZGVycy5mb3JFYWNoKGZ1bmN0aW9uKGhlYWRlcil7XG4vLyAgICAgICAgICAgICBcdGlmIChoZWFkZXIubmFtZSA9PT0gJ01lc3NhZ2UtSUQnKSB7XG4gICAgICAgICAgICBcdFx0XG4vLyAgICAgICAgICAgICBcdH1cbi8vICAgICAgICAgICAgIH0pXG4vLyAgICAgICAgIH0pXG4vLyAgICAgfVxuLy8gfSlcbiIsImNocm9tZS5ydW50aW1lLm9uTWVzc2FnZS5hZGRMaXN0ZW5lcihmdW5jdGlvbihyZXF1ZXN0LCBzZW5kZXIsIHNlbmRSZXNwb25zZSkge1xuICAgIGlmIChyZXF1ZXN0LnR5cGUgPT09ICdyZWFkIG1lc3NhZ2UnKSB7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBHZXQgVGhyZWFkIHdpdGggZ2l2ZW4gSUQuXG4gICAgICAgICAqXG4gICAgICAgICAqIEBwYXJhbSAge1N0cmluZ30gdXNlcklkIFVzZXIncyBlbWFpbCBhZGRyZXNzLiBUaGUgc3BlY2lhbCB2YWx1ZSAnbWUnXG4gICAgICAgICAqIGNhbiBiZSB1c2VkIHRvIGluZGljYXRlIHRoZSBhdXRoZW50aWNhdGVkIHVzZXIuXG4gICAgICAgICAqIEBwYXJhbSAge1N0cmluZ30gdGhyZWFkSWQgSUQgb2YgVGhyZWFkIHRvIGdldC5cbiAgICAgICAgICogQHBhcmFtICB7RnVuY3Rpb259IGNhbGxiYWNrIEZ1bmN0aW9uIHRvIGNhbGwgd2hlbiB0aGUgcmVxdWVzdCBpcyBjb21wbGV0ZS5cbiAgICAgICAgICovXG4gICAgICAgIGZ1bmN0aW9uIGdldFRocmVhZCh1c2VySWQsIHRocmVhZElkLCBjYWxsYmFjaykge1xuICAgICAgICAgICAgdmFyIHJlcSA9IGdhcGkuY2xpZW50LmdtYWlsLnVzZXJzLm1lc3NhZ2VzLmdldCh7XG4gICAgICAgICAgICAgICAgJ2lkJzogdGhyZWFkSWQsXG5cbiAgICAgICAgICAgICAgICAndXNlcklkJzogdXNlcklkLFxuICAgICAgICAgICAgICAgICdmb3JtYXQnOiAnbWV0YWRhdGEnXG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgcmV0dXJuIHJlcS5leGVjdXRlKGNhbGxiYWNrKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGdldFRocmVhZCgnbWUnLCByZXF1ZXN0LnRocmVhZElkLCBmdW5jdGlvbihqc29ucmVzcCwgcmF3cmVzcCkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ2pzb25yZXNwJywganNvbnJlc3ApXG4gICAgICAgICAgICB2YXIgbXNnSWQgPSBcIlwiO1xuICAgICAgICAgICAgdmFyIHNlbmRlck5hbWUgPSBcIlwiO1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBqc29ucmVzcC5wYXlsb2FkLmhlYWRlcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBpZiAoanNvbnJlc3AucGF5bG9hZC5oZWFkZXJzW2ldLm5hbWUudG9VcHBlckNhc2UoKSA9PT0gXCJNRVNTQUdFLUlEXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgbXNnSWQgPSBqc29ucmVzcC5wYXlsb2FkLmhlYWRlcnNbaV0udmFsdWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vIGlmIChqc29ucmVzcC5wYXlsb2FkLmhlYWRlcnNbaV0ubmFtZSA9PT0gXCJGcm9tXCIpe1xuICAgICAgICAgICAgICAgIC8vICBzZW5kZXJOYW1lID0ganNvbnJlc3AucGF5bG9hZC5oZWFkZXJzW2ldLnZhbHVlLm1hdGNoKC9bXjxdKi8pWzBdO1xuICAgICAgICAgICAgICAgIC8vIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBtc2dIYXNoID0gaGFzaENvZGUobXNnSWQpO1xuXG4gICAgICAgICAgICAvLyBjb25zb2xlLmxvZygncmF3UmVzcCcsIHJhd3Jlc3ApO1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJhcmUgd2UgaW4gaGVyZT8/ISEhIT8/P1wiKVxuICAgICAgICAgICAgc2VuZFJlc3BvbnNlKG1zZ0hhc2gpO1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ2pzb25yZXNwJywganNvbnJlc3ApO1xuICAgICAgICAgICAgLy8gY29uc29sZS5sb2coJ3Jhd1Jlc3AnLCByYXdyZXNwKTtcbiAgICAgICAgICAgIC8vIHNlbmRSZXNwb25zZShqc29ucmVzcCk7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICByZXR1cm4gdHJ1ZTtcbn0pO1xuXG5cbi8vIGFsdGVybmF0aXZlbHksIG1heWJlIGEgZnVuY3Rpb24gdGhhdCByZW1vdmVzIHRoZSBub24gbGV0dGVyIGNoYXJhY3RlcnM/XG5mdW5jdGlvbiBoYXNoQ29kZShzKSB7XG4gICAgY29uc29sZS5sb2coXCJyaW5hIG9tZ1wiKVxuICAgIGNvbnNvbGUubG9nKHMpXG4gICAgY29uc29sZS5sb2cocy5yZXBsYWNlKC9bXlxcd1xcc10vZ2ksICcnKSlcbiAgICAvLyByZXR1cm4gcy5zcGxpdChcIlwiKS5yZWR1Y2UoZnVuY3Rpb24oYSwgYikgeyBhID0gKChhIDw8IDUpIC0gYSkgKyBiLmNoYXJDb2RlQXQoMCk7XG4gICAgLy8gICAgIHJldHVybiBhICYgYSB9LCAwKTtcbiAgICByZXR1cm4gcy5yZXBsYWNlKC9bXlxcd1xcc10vZ2ksICcnKTtcbn1cblxuIiwibW9kdWxlLmV4cG9ydHM9e1xuICAgIFwibWFuaWZlc3RfdmVyc2lvblwiOiAyLFxuICAgIFwibmFtZVwiOiBcIkhlbGxvIFdvcmxkIEV4dGVuc2lvblwiLFxuICAgIFwidmVyc2lvblwiOiBcIjEuMFwiLFxuICAgIFwicGVybWlzc2lvbnNcIjogW1xuICAgICAgICBcImh0dHBzOi8vbWFpbC5nb29nbGUuY29tL1wiLFxuICAgICAgICBcImh0dHBzOi8vaW5ib3guZ29vZ2xlLmNvbS9cIixcbiAgICAgICAgXCJpZGVudGl0eVwiXG4gICAgXSxcbiAgICAvLyBcImJyb3dzZXJfYWN0aW9uXCI6IHtcbiAgICAvLyAgIFwiZGVmYXVsdF9pY29uXCI6IHsgICAgICAgICAgICAgICAgICAgIC8vIG9wdGlvbmFsXG4gICAgLy8gICAgIFwiMTlcIjogXCJpbWFnZXMvaWNvbjE5LnBuZ1wiLCAgICAgICAgICAgLy8gb3B0aW9uYWxcbiAgICAvLyAgICAgXCIzOFwiOiBcImltYWdlcy9pY29uMzgucG5nXCIgICAgICAgICAgICAvLyBvcHRpb25hbFxuICAgIC8vICAgfSxcbiAgICAvLyAgIFwiZGVmYXVsdF90aXRsZVwiOiBcIkdvb2dsZSBNYWlsXCIsICAgICAgLy8gb3B0aW9uYWw7IHNob3duIGluIHRvb2x0aXBcbiAgICAvLyAgIFwiZGVmYXVsdF9wb3B1cFwiOiBcInBvcHVwLmh0bWxcIiAgICAgICAgLy8gb3B0aW9uYWxcbiAgICAvLyB9LCBcbiAgICBcIndlYl9hY2Nlc3NpYmxlX3Jlc291cmNlc1wiOiBbXG4gICAgICAgIFwibm9kZV9tb2R1bGVzLypcIixcbiAgICAgICAgXCJ0ZW1wbGF0ZXMvKlwiXG4gICAgXSxcbiAgICBcImJhY2tncm91bmRcIjoge1xuICAgICAgICBcInNjcmlwdHNcIjogW1wiYmFja2dyb3VuZC5idW5kbGUuanNcIl1cbiAgICB9LFxuICAgIFwib2F1dGgyXCI6IHtcbiAgICAgICAgXCJjbGllbnRfaWRcIjogXCIxMjQ4MzQyNDQ5NDktc2xuaG82Ym85ZmJ0YTlmNGdtYzVjcWlvcnBrYWhqbTYuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb21cIixcbiAgICAgICAgXCJzY29wZXNcIjogW1xuICAgICAgICAgIFwiZW1haWxcIiwgXCJvcGVuaWRcIiwgXCJwcm9maWxlXCIsIFwiaHR0cHM6Ly93d3cuZ29vZ2xlYXBpcy5jb20vYXV0aC9nbWFpbC5yZWFkb25seVwiXG4gICAgICAgIF1cbiAgICB9LFxuICAgIFwiY29udGVudF9zZWN1cml0eV9wb2xpY3lcIjogXCJzY3JpcHQtc3JjICdzZWxmJyAndW5zYWZlLWV2YWwnIGh0dHBzOi8vKi5nb29nbGUuY29tIGh0dHBzOi8vY2Fwc3RvbmUxNjA0Z2hhLmZpcmViYXNlaW8uY29tOyBvYmplY3Qtc3JjICdzZWxmJyBodHRwczovLyouZ29vZ2xlLmNvbSBodHRwczovL2NhcHN0b25lMTYwNGdoYS5maXJlYmFzZWlvLmNvbVwiLFxuICAgIFwiY29udGVudF9zY3JpcHRzXCI6IFt7XG4gICAgICAgIFwibWF0Y2hlc1wiOiBbXCJodHRwczovL21haWwuZ29vZ2xlLmNvbS8qXCIsIFwiaHR0cHM6Ly9pbmJveC5nb29nbGUuY29tLypcIl0sXG4gICAgICAgIFwianNcIjogW1wiZmlyZWJhc2UuanNcIiwgXCJpbmJveHNkay5qc1wiLCBcImJ1bmRsZS5qc1wiXVxuICAgIH1dLFxuICAgIFwia2V5XCI6IFwiTUlJQklqQU5CZ2txaGtpRzl3MEJBUUVGQUFPQ0FROEFNSUlCQ2dLQ0FRRUF5RjJQNUI3dmkrWjZ2RU9vTDdUbFpZZFQzQ0VCSHJoZHA4My85cHpUdUErOVpyaGdHUUdDMGl4K3U3NUR4cG96UHpCK1JPeld2VEh4TGdkdnRWdkg5N1phYm9jYWJVOFJteVpGUDdaUW5SZzlGeDkxVGNZY0JpK2krdDRIemgvNHFPMXRzT3dpODdXTWJVUkYzcHdNbWppUlhWdHRvSFFWYTQyaGNEeUhvU3pidVNJdFYyVXVFVW5HTDJscldkejNHOUJCb3JlRXR4SmNqNVpPNHFNNythVm4wR0c1V1d4NVltamhUOVg4MVJkU3I2cWhpaU8vSE9KVmJxWlY1ZDlVYlk4WW80bXpoUWhQalZ1Q29raTZjdnNDTTlXREkyK1ZVd3FpSlg2TVFDaVVGNkFHZmhTZzJDYXBnMVpaRHpHMk12bzhvelhSeXdTWlBDZ1QrQmJHelFJREFRQUJcIlxufSJdfQ==
