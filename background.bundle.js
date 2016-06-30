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
        "templates/*",
        "angular/*",
        "angular/app.js"
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
        "js": ["firebase.js", "inboxsdk.js", "bundle.js", "node_modules/*", "angular/app.js"],
        "css": ["css/*"]
    }],
    "key": "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAyF2P5B7vi+Z6vEOoL7TlZYdT3CEBHrhdp83/9pzTuA+9ZrhgGQGC0ix+u75DxpozPzB+ROzWvTHxLgdvtVvH97ZabocabU8RmyZFP7ZQnRg9Fx91TcYcBi+i+t4Hzh/4qO1tsOwi87WMbURF3pwMmjiRXVttoHQVa42hcDyHoSzbuSItV2UuEUnGL2lrWdz3G9BBoreEtxJcj5ZO4qM7+aVn0GG5WWx5YmjhT9X81RdSr6qhiiO/HOJVbqZV5d9UbY8Yo4mzhQhPjVuCoki6cvsCM9WDI2+VUwqiJX6MQCiUF6AGfhSg2Capg1ZZDzG2Mvo8ozXRywSZPCgT+BbGzQIDAQAB"
}
},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3Vzci9sb2NhbC9saWIvbm9kZV9tb2R1bGVzL3dhdGNoaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJnYXBpL2JhY2tncm91bmQtdHdvLmpzIiwiZ2FwaS9jb21tZW50LmpzIiwiZ2FwaS90YXNraGlzdG9yeS5qcyIsIm1hbmlmZXN0Lmpzb24iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVIQTs7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJ2YXIgaGVhZCA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdoZWFkJylbMF07XG52YXIgYXV0aFNjcmlwdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NjcmlwdCcpO1xuYXV0aFNjcmlwdC50eXBlID0gJ3RleHQvamF2YXNjcmlwdCc7XG5hdXRoU2NyaXB0LnNyYyA9IFwiaHR0cHM6Ly9hcGlzLmdvb2dsZS5jb20vanMvY2xpZW50LmpzP29ubG9hZD1jaGVja0F1dGhcIjsgXG5kb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGF1dGhTY3JpcHQpO1xuY29uc29sZS5sb2coZG9jdW1lbnQuYm9keSlcblxudmFyIGJvZHkgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnYm9keScpWzBdO1xudmFyIGRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuZGl2LmlkID0gXCJhdXRob3JpemUtZGl2XCI7XG5kaXYuc3R5bGUgPSBcImRpc3BheTogbm9uZVwiO1xudmFyIHNwYW4gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJyk7XG5zcGFuLmlubmVySFRNTCA9IFwiQXV0aG9yaXplIGFjY2VzcyB0byBHbWFpbCBBUElcIjtcbnZhciBidXR0b24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdidXR0b24nKTtcbmJ1dHRvbi5pZCA9IFwiYXV0aG9yaXplLWJ1dHRvblwiO1xuYnV0dG9uLmlubmVySFRNTCA9IFwiQXV0aG9yaXplXCI7XG5idXR0b24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbihldmVudCl7XG4gIGhhbmRsZUF1dGhDbGljayhldmVudCk7XG59KVxudmFyIHByZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3ByZScpO1xucHJlLmlkID0gXCJvdXRwdXRcIlxudmFyIERJViA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuZGl2LmFwcGVuZENoaWxkKHNwYW4pO1xuZGl2LmFwcGVuZENoaWxkKGJ1dHRvbik7XG5ESVYuYXBwZW5kQ2hpbGQoZGl2KTtcbkRJVi5hcHBlbmRDaGlsZChwcmUpO1xuYm9keS5hcHBlbmRDaGlsZChESVYpO1xuXG4vLyBZb3VyIENsaWVudCBJRCBjYW4gYmUgcmV0cmlldmVkIGZyb20geW91ciBwcm9qZWN0IGluIHRoZSBHb29nbGVcbi8vIERldmVsb3BlciBDb25zb2xlLCBodHRwczovL2NvbnNvbGUuZGV2ZWxvcGVycy5nb29nbGUuY29tXG52YXIgQ0xJRU5UX0lEID0gcmVxdWlyZSgnLi4vbWFuaWZlc3QuanNvbicpLm9hdXRoMi5jbGllbnRfaWRcblxudmFyIFNDT1BFUyA9IFsnaHR0cHM6Ly93d3cuZ29vZ2xlYXBpcy5jb20vYXV0aC9nbWFpbC5yZWFkb25seSddO1xuXG4vKipcbiAqIENoZWNrIGlmIGN1cnJlbnQgdXNlciBoYXMgYXV0aG9yaXplZCB0aGlzIGFwcGxpY2F0aW9uLlxuICovXG53aW5kb3cuY2hlY2tBdXRoID0gZnVuY3Rpb24gY2hlY2tBdXRoKCkge1xuICBjb25zb2xlLmxvZygnZGlkIHlvdSBnZXQgaW4gaGVyZT8nKTtcbiAgICBnYXBpLmF1dGguYXV0aG9yaXplKHtcbiAgICAgICAgJ2NsaWVudF9pZCc6IENMSUVOVF9JRCxcbiAgICAgICAgJ3Njb3BlJzogU0NPUEVTLFxuICAgICAgICAnaW1tZWRpYXRlJzogdHJ1ZVxuICAgIH0sIGhhbmRsZUF1dGhSZXN1bHQpO1xufVxuXG4vKipcbiAqIEhhbmRsZSByZXNwb25zZSBmcm9tIGF1dGhvcml6YXRpb24gc2VydmVyLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBhdXRoUmVzdWx0IEF1dGhvcml6YXRpb24gcmVzdWx0LlxuICovXG5mdW5jdGlvbiBoYW5kbGVBdXRoUmVzdWx0KGF1dGhSZXN1bHQpIHtcbiAgY29uc29sZS5sb2coJ2F1dGhSZXN1bHQ6ICcsIGF1dGhSZXN1bHQpO1xuICAgIHZhciBhdXRob3JpemVEaXYgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYXV0aG9yaXplLWRpdicpO1xuICAgIGlmIChhdXRoUmVzdWx0ICYmICFhdXRoUmVzdWx0LmVycm9yKSB7XG4gICAgICAgIC8vIEhpZGUgYXV0aCBVSSwgdGhlbiBsb2FkIGNsaWVudCBsaWJyYXJ5LlxuICAgICAgICBhdXRob3JpemVEaXYuc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgICAgICAgbG9hZEdtYWlsQXBpKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgLy8gU2hvdyBhdXRoIFVJLCBhbGxvd2luZyB0aGUgdXNlciB0byBpbml0aWF0ZSBhdXRob3JpemF0aW9uIGJ5XG4gICAgICAgIC8vIGNsaWNraW5nIGF1dGhvcml6ZSBidXR0b24uXG4gICAgICAgIGF1dGhvcml6ZURpdi5zdHlsZS5kaXNwbGF5ID0gJ2lubGluZSc7XG4gICAgfVxufVxuXG4vKipcbiAqIEluaXRpYXRlIGF1dGggZmxvdyBpbiByZXNwb25zZSB0byB1c2VyIGNsaWNraW5nIGF1dGhvcml6ZSBidXR0b24uXG4gKlxuICogQHBhcmFtIHtFdmVudH0gZXZlbnQgQnV0dG9uIGNsaWNrIGV2ZW50LlxuICovXG5mdW5jdGlvbiBoYW5kbGVBdXRoQ2xpY2soZXZlbnQpIHtcbiAgY29uc29sZS5sb2coJ2V2ZW50OiAnLCBldmVudCk7XG4gICAgZ2FwaS5hdXRoLmF1dGhvcml6ZSh7IGNsaWVudF9pZDogQ0xJRU5UX0lELCBzY29wZTogU0NPUEVTLCBpbW1lZGlhdGU6IGZhbHNlIH0sXG4gICAgICAgIGhhbmRsZUF1dGhSZXN1bHQpO1xuICAgIHJldHVybiBmYWxzZTtcbn1cblxuLyoqXG4gKiBMb2FkIEdtYWlsIEFQSSBjbGllbnQgbGlicmFyeS4gTGlzdCBsYWJlbHMgb25jZSBjbGllbnQgbGlicmFyeVxuICogaXMgbG9hZGVkLlxuICovXG5mdW5jdGlvbiBsb2FkR21haWxBcGkoKSB7XG4gICAgZ2FwaS5jbGllbnQubG9hZCgnZ21haWwnLCAndjEnLCBsaXN0TGFiZWxzKTtcbn1cblxuLyoqXG4gKiBQcmludCBhbGwgTGFiZWxzIGluIHRoZSBhdXRob3JpemVkIHVzZXIncyBpbmJveC4gSWYgbm8gbGFiZWxzXG4gKiBhcmUgZm91bmQgYW4gYXBwcm9wcmlhdGUgbWVzc2FnZSBpcyBwcmludGVkLlxuICovXG5mdW5jdGlvbiBsaXN0TGFiZWxzKCkge1xuICAgIHZhciByZXF1ZXN0ID0gZ2FwaS5jbGllbnQuZ21haWwudXNlcnMubGFiZWxzLmxpc3Qoe1xuICAgICAgICAndXNlcklkJzogJ21lJ1xuICAgIH0pO1xuXG4gICAgcmVxdWVzdC5leGVjdXRlKGZ1bmN0aW9uKHJlc3ApIHtcbiAgICAgIGNvbnNvbGUubG9nKCdyZXNwOiAnLCByZXNwKTtcbiAgICAgICAgdmFyIGxhYmVscyA9IHJlc3AubGFiZWxzO1xuICAgICAgICBhcHBlbmRQcmUoJ0xhYmVsczonKTtcblxuICAgICAgICBpZiAobGFiZWxzICYmIGxhYmVscy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgbGFiZWxzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgdmFyIGxhYmVsID0gbGFiZWxzW2ldO1xuICAgICAgICAgICAgICAgIGFwcGVuZFByZShsYWJlbC5uYW1lKVxuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgYXBwZW5kUHJlKCdObyBMYWJlbHMgZm91bmQuJyk7XG4gICAgICAgIH1cbiAgICB9KTtcbn1cblxuLyoqXG4gKiBBcHBlbmQgYSBwcmUgZWxlbWVudCB0byB0aGUgYm9keSBjb250YWluaW5nIHRoZSBnaXZlbiBtZXNzYWdlXG4gKiBhcyBpdHMgdGV4dCBub2RlLlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBtZXNzYWdlIFRleHQgdG8gYmUgcGxhY2VkIGluIHByZSBlbGVtZW50LlxuICovXG5mdW5jdGlvbiBhcHBlbmRQcmUobWVzc2FnZSkge1xuICAgIHZhciBwcmUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnb3V0cHV0Jyk7XG4gICAgdmFyIHRleHRDb250ZW50ID0gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUobWVzc2FnZSArICdcXG4nKTtcbiAgICBwcmUuYXBwZW5kQ2hpbGQodGV4dENvbnRlbnQpO1xufVxuXG5yZXF1aXJlKCcuL3Rhc2toaXN0b3J5LmpzJyk7XG5yZXF1aXJlKCcuL2NvbW1lbnQuanMnKTtcbiIsIiIsImNocm9tZS5ydW50aW1lLm9uTWVzc2FnZS5hZGRMaXN0ZW5lcihmdW5jdGlvbihyZXF1ZXN0LCBzZW5kZXIsIHNlbmRSZXNwb25zZSkge1xuICAgIGlmIChyZXF1ZXN0LnR5cGUgPT09ICdyZWFkIG1lc3NhZ2UnKSB7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBHZXQgVGhyZWFkIHdpdGggZ2l2ZW4gSUQuXG4gICAgICAgICAqXG4gICAgICAgICAqIEBwYXJhbSAge1N0cmluZ30gdXNlcklkIFVzZXIncyBlbWFpbCBhZGRyZXNzLiBUaGUgc3BlY2lhbCB2YWx1ZSAnbWUnXG4gICAgICAgICAqIGNhbiBiZSB1c2VkIHRvIGluZGljYXRlIHRoZSBhdXRoZW50aWNhdGVkIHVzZXIuXG4gICAgICAgICAqIEBwYXJhbSAge1N0cmluZ30gdGhyZWFkSWQgSUQgb2YgVGhyZWFkIHRvIGdldC5cbiAgICAgICAgICogQHBhcmFtICB7RnVuY3Rpb259IGNhbGxiYWNrIEZ1bmN0aW9uIHRvIGNhbGwgd2hlbiB0aGUgcmVxdWVzdCBpcyBjb21wbGV0ZS5cbiAgICAgICAgICovXG4gICAgICAgIGZ1bmN0aW9uIGdldFRocmVhZCh1c2VySWQsIHRocmVhZElkLCBjYWxsYmFjaykge1xuICAgICAgICAgICAgdmFyIHJlcSA9IGdhcGkuY2xpZW50LmdtYWlsLnVzZXJzLm1lc3NhZ2VzLmdldCh7XG4gICAgICAgICAgICAgICAgJ2lkJzogdGhyZWFkSWQsXG5cbiAgICAgICAgICAgICAgICAndXNlcklkJzogdXNlcklkLFxuICAgICAgICAgICAgICAgICdmb3JtYXQnOiAnbWV0YWRhdGEnXG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgcmV0dXJuIHJlcS5leGVjdXRlKGNhbGxiYWNrKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGdldFRocmVhZCgnbWUnLCByZXF1ZXN0LnRocmVhZElkLCBmdW5jdGlvbihqc29ucmVzcCwgcmF3cmVzcCkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ2pzb25yZXNwJywganNvbnJlc3ApXG4gICAgICAgICAgICB2YXIgbXNnSWQgPSBcIlwiO1xuICAgICAgICAgICAgdmFyIHNlbmRlck5hbWUgPSBcIlwiO1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBqc29ucmVzcC5wYXlsb2FkLmhlYWRlcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBpZiAoanNvbnJlc3AucGF5bG9hZC5oZWFkZXJzW2ldLm5hbWUgPT09IFwiTWVzc2FnZS1JRFwiKSB7XG4gICAgICAgICAgICAgICAgICAgIG1zZ0lkID0ganNvbnJlc3AucGF5bG9hZC5oZWFkZXJzW2ldLnZhbHVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyBpZiAoanNvbnJlc3AucGF5bG9hZC5oZWFkZXJzW2ldLm5hbWUgPT09IFwiRnJvbVwiKXtcbiAgICAgICAgICAgICAgICAvLyBcdHNlbmRlck5hbWUgPSBqc29ucmVzcC5wYXlsb2FkLmhlYWRlcnNbaV0udmFsdWUubWF0Y2goL1tePF0qLylbMF07XG4gICAgICAgICAgICAgICAgLy8gfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIG1zZ0hhc2ggPSBoYXNoQ29kZShtc2dJZCk7XG5cbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKCdyYXdSZXNwJywgcmF3cmVzcCk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcImFyZSB3ZSBpbiBoZXJlXCIpXG4gICAgICAgICAgICBzZW5kUmVzcG9uc2UobXNnSGFzaCk7XG4gICAgICAgIFx0Y29uc29sZS5sb2coJ2pzb25yZXNwJywganNvbnJlc3ApO1xuICAgICAgICBcdC8vIGNvbnNvbGUubG9nKCdyYXdSZXNwJywgcmF3cmVzcCk7XG4gICAgICAgICAgICAvLyBzZW5kUmVzcG9uc2UoanNvbnJlc3ApO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgcmV0dXJuIHRydWU7XG59KTtcblxuXG4vLyBhbHRlcm5hdGl2ZWx5LCBtYXliZSBhIGZ1bmN0aW9uIHRoYXQgcmVtb3ZlcyB0aGUgbm9uIGxldHRlciBjaGFyYWN0ZXJzP1xuZnVuY3Rpb24gaGFzaENvZGUocykge1xuICAgIHJldHVybiBzLnNwbGl0KFwiXCIpLnJlZHVjZShmdW5jdGlvbihhLCBiKSB7IGEgPSAoKGEgPDwgNSkgLSBhKSArIGIuY2hhckNvZGVBdCgwKTtcbiAgICAgICAgcmV0dXJuIGEgJiBhIH0sIDApO1xufVxuIiwibW9kdWxlLmV4cG9ydHM9e1xuICAgIFwibWFuaWZlc3RfdmVyc2lvblwiOiAyLFxuICAgIFwibmFtZVwiOiBcIkhlbGxvIFdvcmxkIEV4dGVuc2lvblwiLFxuICAgIFwidmVyc2lvblwiOiBcIjEuMFwiLFxuICAgIFwicGVybWlzc2lvbnNcIjogW1xuICAgICAgICBcImh0dHBzOi8vbWFpbC5nb29nbGUuY29tL1wiLFxuICAgICAgICBcImh0dHBzOi8vaW5ib3guZ29vZ2xlLmNvbS9cIixcbiAgICAgICAgXCJpZGVudGl0eVwiXG4gICAgXSxcbiAgICAvLyBcImJyb3dzZXJfYWN0aW9uXCI6IHtcbiAgICAvLyAgIFwiZGVmYXVsdF9pY29uXCI6IHsgICAgICAgICAgICAgICAgICAgIC8vIG9wdGlvbmFsXG4gICAgLy8gICAgIFwiMTlcIjogXCJpbWFnZXMvaWNvbjE5LnBuZ1wiLCAgICAgICAgICAgLy8gb3B0aW9uYWxcbiAgICAvLyAgICAgXCIzOFwiOiBcImltYWdlcy9pY29uMzgucG5nXCIgICAgICAgICAgICAvLyBvcHRpb25hbFxuICAgIC8vICAgfSxcbiAgICAvLyAgIFwiZGVmYXVsdF90aXRsZVwiOiBcIkdvb2dsZSBNYWlsXCIsICAgICAgLy8gb3B0aW9uYWw7IHNob3duIGluIHRvb2x0aXBcbiAgICAvLyAgIFwiZGVmYXVsdF9wb3B1cFwiOiBcInBvcHVwLmh0bWxcIiAgICAgICAgLy8gb3B0aW9uYWxcbiAgICAvLyB9LCBcbiAgICBcIndlYl9hY2Nlc3NpYmxlX3Jlc291cmNlc1wiOiBbXG4gICAgICAgIFwibm9kZV9tb2R1bGVzLypcIiwgXG4gICAgICAgIFwidGVtcGxhdGVzLypcIixcbiAgICAgICAgXCJhbmd1bGFyLypcIixcbiAgICAgICAgXCJhbmd1bGFyL2FwcC5qc1wiXG4gICAgXSxcbiAgICBcImJhY2tncm91bmRcIjoge1xuICAgICAgICBcInNjcmlwdHNcIjogW1wiYmFja2dyb3VuZC5idW5kbGUuanNcIl1cbiAgICB9LFxuICAgIFwib2F1dGgyXCI6IHtcbiAgICAgICAgXCJjbGllbnRfaWRcIjogXCIxMjQ4MzQyNDQ5NDktc2xuaG82Ym85ZmJ0YTlmNGdtYzVjcWlvcnBrYWhqbTYuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb21cIixcbiAgICAgICAgXCJzY29wZXNcIjogW1xuICAgICAgICAgIFwiZW1haWxcIiwgXCJvcGVuaWRcIiwgXCJwcm9maWxlXCIsIFwiaHR0cHM6Ly93d3cuZ29vZ2xlYXBpcy5jb20vYXV0aC9nbWFpbC5yZWFkb25seVwiXG4gICAgICAgIF1cbiAgICB9LFxuICAgIFwiY29udGVudF9zZWN1cml0eV9wb2xpY3lcIjogXCJzY3JpcHQtc3JjICdzZWxmJyAndW5zYWZlLWV2YWwnIGh0dHBzOi8vKi5nb29nbGUuY29tIGh0dHBzOi8vY2Fwc3RvbmUxNjA0Z2hhLmZpcmViYXNlaW8uY29tOyBvYmplY3Qtc3JjICdzZWxmJyBodHRwczovLyouZ29vZ2xlLmNvbSBodHRwczovL2NhcHN0b25lMTYwNGdoYS5maXJlYmFzZWlvLmNvbVwiLFxuXG4gICAgXCJjb250ZW50X3NjcmlwdHNcIjogW3tcbiAgICAgICAgXCJtYXRjaGVzXCI6IFtcImh0dHBzOi8vbWFpbC5nb29nbGUuY29tLypcIiwgXCJodHRwczovL2luYm94Lmdvb2dsZS5jb20vKlwiXSxcbiAgICAgICAgXCJqc1wiOiBbXCJmaXJlYmFzZS5qc1wiLCBcImluYm94c2RrLmpzXCIsIFwiYnVuZGxlLmpzXCIsIFwibm9kZV9tb2R1bGVzLypcIiwgXCJhbmd1bGFyL2FwcC5qc1wiXSxcbiAgICAgICAgXCJjc3NcIjogW1wiY3NzLypcIl1cbiAgICB9XSxcbiAgICBcImtleVwiOiBcIk1JSUJJakFOQmdrcWhraUc5dzBCQVFFRkFBT0NBUThBTUlJQkNnS0NBUUVBeUYyUDVCN3ZpK1o2dkVPb0w3VGxaWWRUM0NFQkhyaGRwODMvOXB6VHVBKzlacmhnR1FHQzBpeCt1NzVEeHBvelB6QitST3pXdlRIeExnZHZ0VnZIOTdaYWJvY2FiVThSbXlaRlA3WlFuUmc5Rng5MVRjWWNCaStpK3Q0SHpoLzRxTzF0c093aTg3V01iVVJGM3B3TW1qaVJYVnR0b0hRVmE0MmhjRHlIb1N6YnVTSXRWMlV1RVVuR0wybHJXZHozRzlCQm9yZUV0eEpjajVaTzRxTTcrYVZuMEdHNVdXeDVZbWpoVDlYODFSZFNyNnFoaWlPL0hPSlZicVpWNWQ5VWJZOFlvNG16aFFoUGpWdUNva2k2Y3ZzQ005V0RJMitWVXdxaUpYNk1RQ2lVRjZBR2ZoU2cyQ2FwZzFaWkR6RzJNdm84b3pYUnl3U1pQQ2dUK0JiR3pRSURBUUFCXCJcbn0iXX0=
