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
button.addEventListener('click', function(event){
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

require('./taskhistory.js');
require('./comment.js');
},{"../manifest.json":4,"./comment.js":2,"./taskhistory.js":3}],2:[function(require,module,exports){

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
                // 	senderName = jsonresp.payload.headers[i].value.match(/[^<]*/)[0];
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3Vzci9sb2NhbC9saWIvbm9kZV9tb2R1bGVzL3dhdGNoaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJnYXBpL2JhY2tncm91bmQtdHdvLmpzIiwiZ2FwaS9jb21tZW50LmpzIiwiZ2FwaS90YXNraGlzdG9yeS5qcyIsIm1hbmlmZXN0Lmpzb24iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzSEE7O0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwidmFyIGhlYWQgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnaGVhZCcpWzBdO1xudmFyIGF1dGhTY3JpcHQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzY3JpcHQnKTtcbmF1dGhTY3JpcHQudHlwZSA9ICd0ZXh0L2phdmFzY3JpcHQnO1xuYXV0aFNjcmlwdC5zcmMgPSBcImh0dHBzOi8vYXBpcy5nb29nbGUuY29tL2pzL2NsaWVudC5qcz9vbmxvYWQ9Y2hlY2tBdXRoXCI7IFxuZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChhdXRoU2NyaXB0KTtcbmNvbnNvbGUubG9nKGRvY3VtZW50LmJvZHkpXG5cbnZhciBib2R5ID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2JvZHknKVswXTtcbnZhciBkaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbmRpdi5pZCA9IFwiYXV0aG9yaXplLWRpdlwiO1xuZGl2LnN0eWxlID0gXCJkaXNwYXk6IG5vbmVcIjtcbnZhciBzcGFuID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpO1xuc3Bhbi5pbm5lckhUTUwgPSBcIkF1dGhvcml6ZSBhY2Nlc3MgdG8gR21haWwgQVBJXCI7XG52YXIgYnV0dG9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYnV0dG9uJyk7XG5idXR0b24uaWQgPSBcImF1dGhvcml6ZS1idXR0b25cIjtcbmJ1dHRvbi5pbm5lckhUTUwgPSBcIkF1dGhvcml6ZVwiO1xuYnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24oZXZlbnQpe1xuICBoYW5kbGVBdXRoQ2xpY2soZXZlbnQpO1xufSlcbnZhciBwcmUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdwcmUnKTtcbnByZS5pZCA9IFwib3V0cHV0XCJcbnZhciBESVYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbmRpdi5hcHBlbmRDaGlsZChzcGFuKTtcbmRpdi5hcHBlbmRDaGlsZChidXR0b24pO1xuRElWLmFwcGVuZENoaWxkKGRpdik7XG5ESVYuYXBwZW5kQ2hpbGQocHJlKTtcbmJvZHkuYXBwZW5kQ2hpbGQoRElWKTtcblxuLy8gWW91ciBDbGllbnQgSUQgY2FuIGJlIHJldHJpZXZlZCBmcm9tIHlvdXIgcHJvamVjdCBpbiB0aGUgR29vZ2xlXG4vLyBEZXZlbG9wZXIgQ29uc29sZSwgaHR0cHM6Ly9jb25zb2xlLmRldmVsb3BlcnMuZ29vZ2xlLmNvbVxudmFyIENMSUVOVF9JRCA9IHJlcXVpcmUoJy4uL21hbmlmZXN0Lmpzb24nKS5vYXV0aDIuY2xpZW50X2lkXG5cbnZhciBTQ09QRVMgPSBbJ2h0dHBzOi8vd3d3Lmdvb2dsZWFwaXMuY29tL2F1dGgvZ21haWwucmVhZG9ubHknXTtcblxuLyoqXG4gKiBDaGVjayBpZiBjdXJyZW50IHVzZXIgaGFzIGF1dGhvcml6ZWQgdGhpcyBhcHBsaWNhdGlvbi5cbiAqL1xud2luZG93LmNoZWNrQXV0aCA9IGZ1bmN0aW9uIGNoZWNrQXV0aCgpIHtcbiAgY29uc29sZS5sb2coJ2RpZCB5b3UgZ2V0IGluIGhlcmU/Jyk7XG4gICAgZ2FwaS5hdXRoLmF1dGhvcml6ZSh7XG4gICAgICAgICdjbGllbnRfaWQnOiBDTElFTlRfSUQsXG4gICAgICAgICdzY29wZSc6IFNDT1BFUyxcbiAgICAgICAgJ2ltbWVkaWF0ZSc6IHRydWVcbiAgICB9LCBoYW5kbGVBdXRoUmVzdWx0KTtcbn1cblxuLyoqXG4gKiBIYW5kbGUgcmVzcG9uc2UgZnJvbSBhdXRob3JpemF0aW9uIHNlcnZlci5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gYXV0aFJlc3VsdCBBdXRob3JpemF0aW9uIHJlc3VsdC5cbiAqL1xuZnVuY3Rpb24gaGFuZGxlQXV0aFJlc3VsdChhdXRoUmVzdWx0KSB7XG4gIGNvbnNvbGUubG9nKCdhdXRoUmVzdWx0OiAnLCBhdXRoUmVzdWx0KTtcbiAgICB2YXIgYXV0aG9yaXplRGl2ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2F1dGhvcml6ZS1kaXYnKTtcbiAgICBpZiAoYXV0aFJlc3VsdCAmJiAhYXV0aFJlc3VsdC5lcnJvcikge1xuICAgICAgICAvLyBIaWRlIGF1dGggVUksIHRoZW4gbG9hZCBjbGllbnQgbGlicmFyeS5cbiAgICAgICAgYXV0aG9yaXplRGl2LnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gICAgICAgIGxvYWRHbWFpbEFwaSgpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIFNob3cgYXV0aCBVSSwgYWxsb3dpbmcgdGhlIHVzZXIgdG8gaW5pdGlhdGUgYXV0aG9yaXphdGlvbiBieVxuICAgICAgICAvLyBjbGlja2luZyBhdXRob3JpemUgYnV0dG9uLlxuICAgICAgICBhdXRob3JpemVEaXYuc3R5bGUuZGlzcGxheSA9ICdpbmxpbmUnO1xuICAgIH1cbn1cblxuLyoqXG4gKiBJbml0aWF0ZSBhdXRoIGZsb3cgaW4gcmVzcG9uc2UgdG8gdXNlciBjbGlja2luZyBhdXRob3JpemUgYnV0dG9uLlxuICpcbiAqIEBwYXJhbSB7RXZlbnR9IGV2ZW50IEJ1dHRvbiBjbGljayBldmVudC5cbiAqL1xuZnVuY3Rpb24gaGFuZGxlQXV0aENsaWNrKGV2ZW50KSB7XG4gIGNvbnNvbGUubG9nKCdldmVudDogJywgZXZlbnQpO1xuICAgIGdhcGkuYXV0aC5hdXRob3JpemUoeyBjbGllbnRfaWQ6IENMSUVOVF9JRCwgc2NvcGU6IFNDT1BFUywgaW1tZWRpYXRlOiBmYWxzZSB9LFxuICAgICAgICBoYW5kbGVBdXRoUmVzdWx0KTtcbiAgICByZXR1cm4gZmFsc2U7XG59XG5cbi8qKlxuICogTG9hZCBHbWFpbCBBUEkgY2xpZW50IGxpYnJhcnkuIExpc3QgbGFiZWxzIG9uY2UgY2xpZW50IGxpYnJhcnlcbiAqIGlzIGxvYWRlZC5cbiAqL1xuZnVuY3Rpb24gbG9hZEdtYWlsQXBpKCkge1xuICAgIGdhcGkuY2xpZW50LmxvYWQoJ2dtYWlsJywgJ3YxJywgbGlzdExhYmVscyk7XG59XG5cbi8qKlxuICogUHJpbnQgYWxsIExhYmVscyBpbiB0aGUgYXV0aG9yaXplZCB1c2VyJ3MgaW5ib3guIElmIG5vIGxhYmVsc1xuICogYXJlIGZvdW5kIGFuIGFwcHJvcHJpYXRlIG1lc3NhZ2UgaXMgcHJpbnRlZC5cbiAqL1xuZnVuY3Rpb24gbGlzdExhYmVscygpIHtcbiAgICB2YXIgcmVxdWVzdCA9IGdhcGkuY2xpZW50LmdtYWlsLnVzZXJzLmxhYmVscy5saXN0KHtcbiAgICAgICAgJ3VzZXJJZCc6ICdtZSdcbiAgICB9KTtcblxuICAgIHJlcXVlc3QuZXhlY3V0ZShmdW5jdGlvbihyZXNwKSB7XG4gICAgICBjb25zb2xlLmxvZygncmVzcDogJywgcmVzcCk7XG4gICAgICAgIHZhciBsYWJlbHMgPSByZXNwLmxhYmVscztcbiAgICAgICAgYXBwZW5kUHJlKCdMYWJlbHM6Jyk7XG5cbiAgICAgICAgaWYgKGxhYmVscyAmJiBsYWJlbHMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IGxhYmVscy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIHZhciBsYWJlbCA9IGxhYmVsc1tpXTtcbiAgICAgICAgICAgICAgICBhcHBlbmRQcmUobGFiZWwubmFtZSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGFwcGVuZFByZSgnTm8gTGFiZWxzIGZvdW5kLicpO1xuICAgICAgICB9XG4gICAgfSk7XG59XG5cbi8qKlxuICogQXBwZW5kIGEgcHJlIGVsZW1lbnQgdG8gdGhlIGJvZHkgY29udGFpbmluZyB0aGUgZ2l2ZW4gbWVzc2FnZVxuICogYXMgaXRzIHRleHQgbm9kZS5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gbWVzc2FnZSBUZXh0IHRvIGJlIHBsYWNlZCBpbiBwcmUgZWxlbWVudC5cbiAqL1xuZnVuY3Rpb24gYXBwZW5kUHJlKG1lc3NhZ2UpIHtcbiAgICB2YXIgcHJlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ291dHB1dCcpO1xuICAgIHZhciB0ZXh0Q29udGVudCA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKG1lc3NhZ2UgKyAnXFxuJyk7XG4gICAgcHJlLmFwcGVuZENoaWxkKHRleHRDb250ZW50KTtcbn1cblxucmVxdWlyZSgnLi90YXNraGlzdG9yeS5qcycpO1xucmVxdWlyZSgnLi9jb21tZW50LmpzJyk7IiwiIiwiY2hyb21lLnJ1bnRpbWUub25NZXNzYWdlLmFkZExpc3RlbmVyKGZ1bmN0aW9uKHJlcXVlc3QsIHNlbmRlciwgc2VuZFJlc3BvbnNlKSB7XG4gICAgaWYgKHJlcXVlc3QudHlwZSA9PT0gJ3JlYWQgbWVzc2FnZScpIHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEdldCBUaHJlYWQgd2l0aCBnaXZlbiBJRC5cbiAgICAgICAgICpcbiAgICAgICAgICogQHBhcmFtICB7U3RyaW5nfSB1c2VySWQgVXNlcidzIGVtYWlsIGFkZHJlc3MuIFRoZSBzcGVjaWFsIHZhbHVlICdtZSdcbiAgICAgICAgICogY2FuIGJlIHVzZWQgdG8gaW5kaWNhdGUgdGhlIGF1dGhlbnRpY2F0ZWQgdXNlci5cbiAgICAgICAgICogQHBhcmFtICB7U3RyaW5nfSB0aHJlYWRJZCBJRCBvZiBUaHJlYWQgdG8gZ2V0LlxuICAgICAgICAgKiBAcGFyYW0gIHtGdW5jdGlvbn0gY2FsbGJhY2sgRnVuY3Rpb24gdG8gY2FsbCB3aGVuIHRoZSByZXF1ZXN0IGlzIGNvbXBsZXRlLlxuICAgICAgICAgKi9cbiAgICAgICAgZnVuY3Rpb24gZ2V0VGhyZWFkKHVzZXJJZCwgdGhyZWFkSWQsIGNhbGxiYWNrKSB7XG4gICAgICAgICAgICB2YXIgcmVxID0gZ2FwaS5jbGllbnQuZ21haWwudXNlcnMubWVzc2FnZXMuZ2V0KHtcbiAgICAgICAgICAgICAgICAnaWQnOiB0aHJlYWRJZCxcblxuICAgICAgICAgICAgICAgICd1c2VySWQnOiB1c2VySWQsXG4gICAgICAgICAgICAgICAgJ2Zvcm1hdCc6ICdtZXRhZGF0YSdcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICByZXR1cm4gcmVxLmV4ZWN1dGUoY2FsbGJhY2spO1xuICAgICAgICB9XG5cbiAgICAgICAgZ2V0VGhyZWFkKCdtZScsIHJlcXVlc3QudGhyZWFkSWQsIGZ1bmN0aW9uKGpzb25yZXNwLCByYXdyZXNwKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnanNvbnJlc3AnLCBqc29ucmVzcClcbiAgICAgICAgICAgIHZhciBtc2dJZCA9IFwiXCI7XG4gICAgICAgICAgICB2YXIgc2VuZGVyTmFtZSA9IFwiXCI7XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGpzb25yZXNwLnBheWxvYWQuaGVhZGVycy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIGlmIChqc29ucmVzcC5wYXlsb2FkLmhlYWRlcnNbaV0ubmFtZSA9PT0gXCJNZXNzYWdlLUlEXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgbXNnSWQgPSBqc29ucmVzcC5wYXlsb2FkLmhlYWRlcnNbaV0udmFsdWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vIGlmIChqc29ucmVzcC5wYXlsb2FkLmhlYWRlcnNbaV0ubmFtZSA9PT0gXCJGcm9tXCIpe1xuICAgICAgICAgICAgICAgIC8vIFx0c2VuZGVyTmFtZSA9IGpzb25yZXNwLnBheWxvYWQuaGVhZGVyc1tpXS52YWx1ZS5tYXRjaCgvW148XSovKVswXTtcbiAgICAgICAgICAgICAgICAvLyB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgbXNnSGFzaCA9IGhhc2hDb2RlKG1zZ0lkKTtcblxuICAgICAgICAgICAgLy8gY29uc29sZS5sb2coJ3Jhd1Jlc3AnLCByYXdyZXNwKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiYXJlIHdlIGluIGhlcmVcIilcbiAgICAgICAgICAgIHNlbmRSZXNwb25zZShtc2dIYXNoKTtcbiAgICAgICAgXHRjb25zb2xlLmxvZygnanNvbnJlc3AnLCBqc29ucmVzcCk7XG4gICAgICAgIFx0Ly8gY29uc29sZS5sb2coJ3Jhd1Jlc3AnLCByYXdyZXNwKTtcbiAgICAgICAgICAgIC8vIHNlbmRSZXNwb25zZShqc29ucmVzcCk7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICByZXR1cm4gdHJ1ZTtcbn0pO1xuXG5mdW5jdGlvbiBoYXNoQ29kZShzKSB7XG4gICAgcmV0dXJuIHMuc3BsaXQoXCJcIikucmVkdWNlKGZ1bmN0aW9uKGEsIGIpIHsgYSA9ICgoYSA8PCA1KSAtIGEpICsgYi5jaGFyQ29kZUF0KDApO1xuICAgICAgICByZXR1cm4gYSAmIGEgfSwgMCk7XG59XG4iLCJtb2R1bGUuZXhwb3J0cz17XG4gICAgXCJtYW5pZmVzdF92ZXJzaW9uXCI6IDIsXG4gICAgXCJuYW1lXCI6IFwiSGVsbG8gV29ybGQgRXh0ZW5zaW9uXCIsXG4gICAgXCJ2ZXJzaW9uXCI6IFwiMS4wXCIsXG4gICAgXCJwZXJtaXNzaW9uc1wiOiBbXG4gICAgICAgIFwiaHR0cHM6Ly9tYWlsLmdvb2dsZS5jb20vXCIsXG4gICAgICAgIFwiaHR0cHM6Ly9pbmJveC5nb29nbGUuY29tL1wiLFxuICAgICAgICBcImlkZW50aXR5XCJcbiAgICBdLFxuICAgIC8vIFwiYnJvd3Nlcl9hY3Rpb25cIjoge1xuICAgIC8vICAgXCJkZWZhdWx0X2ljb25cIjogeyAgICAgICAgICAgICAgICAgICAgLy8gb3B0aW9uYWxcbiAgICAvLyAgICAgXCIxOVwiOiBcImltYWdlcy9pY29uMTkucG5nXCIsICAgICAgICAgICAvLyBvcHRpb25hbFxuICAgIC8vICAgICBcIjM4XCI6IFwiaW1hZ2VzL2ljb24zOC5wbmdcIiAgICAgICAgICAgIC8vIG9wdGlvbmFsXG4gICAgLy8gICB9LFxuICAgIC8vICAgXCJkZWZhdWx0X3RpdGxlXCI6IFwiR29vZ2xlIE1haWxcIiwgICAgICAvLyBvcHRpb25hbDsgc2hvd24gaW4gdG9vbHRpcFxuICAgIC8vICAgXCJkZWZhdWx0X3BvcHVwXCI6IFwicG9wdXAuaHRtbFwiICAgICAgICAvLyBvcHRpb25hbFxuICAgIC8vIH0sIFxuICAgIFwid2ViX2FjY2Vzc2libGVfcmVzb3VyY2VzXCI6IFtcbiAgICAgICAgXCJub2RlX21vZHVsZXMvKlwiLFxuICAgICAgICBcInRlbXBsYXRlcy8qXCJcbiAgICBdLFxuICAgIFwiYmFja2dyb3VuZFwiOiB7XG4gICAgICAgIFwic2NyaXB0c1wiOiBbXCJiYWNrZ3JvdW5kLmJ1bmRsZS5qc1wiXVxuICAgIH0sXG4gICAgXCJvYXV0aDJcIjoge1xuICAgICAgICBcImNsaWVudF9pZFwiOiBcIjEyNDgzNDI0NDk0OS1zbG5obzZibzlmYnRhOWY0Z21jNWNxaW9ycGthaGptNi5hcHBzLmdvb2dsZXVzZXJjb250ZW50LmNvbVwiLFxuICAgICAgICBcInNjb3Blc1wiOiBbXG4gICAgICAgICAgXCJlbWFpbFwiLCBcIm9wZW5pZFwiLCBcInByb2ZpbGVcIiwgXCJodHRwczovL3d3dy5nb29nbGVhcGlzLmNvbS9hdXRoL2dtYWlsLnJlYWRvbmx5XCJcbiAgICAgICAgXVxuICAgIH0sXG4gICAgXCJjb250ZW50X3NlY3VyaXR5X3BvbGljeVwiOiBcInNjcmlwdC1zcmMgJ3NlbGYnICd1bnNhZmUtZXZhbCcgaHR0cHM6Ly8qLmdvb2dsZS5jb20gaHR0cHM6Ly9jYXBzdG9uZTE2MDRnaGEuZmlyZWJhc2Vpby5jb207IG9iamVjdC1zcmMgJ3NlbGYnIGh0dHBzOi8vKi5nb29nbGUuY29tIGh0dHBzOi8vY2Fwc3RvbmUxNjA0Z2hhLmZpcmViYXNlaW8uY29tXCIsXG4gICAgXCJjb250ZW50X3NjcmlwdHNcIjogW3tcbiAgICAgICAgXCJtYXRjaGVzXCI6IFtcImh0dHBzOi8vbWFpbC5nb29nbGUuY29tLypcIiwgXCJodHRwczovL2luYm94Lmdvb2dsZS5jb20vKlwiXSxcbiAgICAgICAgXCJqc1wiOiBbXCJmaXJlYmFzZS5qc1wiLCBcImluYm94c2RrLmpzXCIsIFwiYnVuZGxlLmpzXCJdXG4gICAgfV0sXG4gICAgXCJrZXlcIjogXCJNSUlCSWpBTkJna3Foa2lHOXcwQkFRRUZBQU9DQVE4QU1JSUJDZ0tDQVFFQXlGMlA1Qjd2aStaNnZFT29MN1RsWllkVDNDRUJIcmhkcDgzLzlwelR1QSs5WnJoZ0dRR0MwaXgrdTc1RHhwb3pQekIrUk96V3ZUSHhMZ2R2dFZ2SDk3WmFib2NhYlU4Um15WkZQN1pRblJnOUZ4OTFUY1ljQmkraSt0NEh6aC80cU8xdHNPd2k4N1dNYlVSRjNwd01tamlSWFZ0dG9IUVZhNDJoY0R5SG9TemJ1U0l0VjJVdUVVbkdMMmxyV2R6M0c5QkJvcmVFdHhKY2o1Wk80cU03K2FWbjBHRzVXV3g1WW1qaFQ5WDgxUmRTcjZxaGlpTy9IT0pWYnFaVjVkOVViWThZbzRtemhRaFBqVnVDb2tpNmN2c0NNOVdESTIrVlV3cWlKWDZNUUNpVUY2QUdmaFNnMkNhcGcxWlpEekcyTXZvOG96WFJ5d1NaUENnVCtCYkd6UUlEQVFBQlwiXG59Il19
