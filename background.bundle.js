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
        	console.log('jsonresp', jsonresp);
        	// console.log('rawResp', rawresp);
            sendResponse(jsonresp);
        });
    }
    return true;
});

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3Vzci9sb2NhbC9saWIvbm9kZV9tb2R1bGVzL3dhdGNoaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJnYXBpL2JhY2tncm91bmQtdHdvLmpzIiwiZ2FwaS9jb21tZW50LmpzIiwiZ2FwaS90YXNraGlzdG9yeS5qcyIsIm1hbmlmZXN0Lmpzb24iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzSEE7O0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsInZhciBoZWFkID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2hlYWQnKVswXTtcbnZhciBhdXRoU2NyaXB0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc2NyaXB0Jyk7XG5hdXRoU2NyaXB0LnR5cGUgPSAndGV4dC9qYXZhc2NyaXB0JztcbmF1dGhTY3JpcHQuc3JjID0gXCJodHRwczovL2FwaXMuZ29vZ2xlLmNvbS9qcy9jbGllbnQuanM/b25sb2FkPWNoZWNrQXV0aFwiOyBcbmRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoYXV0aFNjcmlwdCk7XG5jb25zb2xlLmxvZyhkb2N1bWVudC5ib2R5KVxuXG52YXIgYm9keSA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdib2R5JylbMF07XG52YXIgZGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG5kaXYuaWQgPSBcImF1dGhvcml6ZS1kaXZcIjtcbmRpdi5zdHlsZSA9IFwiZGlzcGF5OiBub25lXCI7XG52YXIgc3BhbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKTtcbnNwYW4uaW5uZXJIVE1MID0gXCJBdXRob3JpemUgYWNjZXNzIHRvIEdtYWlsIEFQSVwiO1xudmFyIGJ1dHRvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2J1dHRvbicpO1xuYnV0dG9uLmlkID0gXCJhdXRob3JpemUtYnV0dG9uXCI7XG5idXR0b24uaW5uZXJIVE1MID0gXCJBdXRob3JpemVcIjtcbmJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uKGV2ZW50KXtcbiAgaGFuZGxlQXV0aENsaWNrKGV2ZW50KTtcbn0pXG52YXIgcHJlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgncHJlJyk7XG5wcmUuaWQgPSBcIm91dHB1dFwiXG52YXIgRElWID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG5kaXYuYXBwZW5kQ2hpbGQoc3Bhbik7XG5kaXYuYXBwZW5kQ2hpbGQoYnV0dG9uKTtcbkRJVi5hcHBlbmRDaGlsZChkaXYpO1xuRElWLmFwcGVuZENoaWxkKHByZSk7XG5ib2R5LmFwcGVuZENoaWxkKERJVik7XG5cbi8vIFlvdXIgQ2xpZW50IElEIGNhbiBiZSByZXRyaWV2ZWQgZnJvbSB5b3VyIHByb2plY3QgaW4gdGhlIEdvb2dsZVxuLy8gRGV2ZWxvcGVyIENvbnNvbGUsIGh0dHBzOi8vY29uc29sZS5kZXZlbG9wZXJzLmdvb2dsZS5jb21cbnZhciBDTElFTlRfSUQgPSByZXF1aXJlKCcuLi9tYW5pZmVzdC5qc29uJykub2F1dGgyLmNsaWVudF9pZFxuXG52YXIgU0NPUEVTID0gWydodHRwczovL3d3dy5nb29nbGVhcGlzLmNvbS9hdXRoL2dtYWlsLnJlYWRvbmx5J107XG5cbi8qKlxuICogQ2hlY2sgaWYgY3VycmVudCB1c2VyIGhhcyBhdXRob3JpemVkIHRoaXMgYXBwbGljYXRpb24uXG4gKi9cbndpbmRvdy5jaGVja0F1dGggPSBmdW5jdGlvbiBjaGVja0F1dGgoKSB7XG4gIGNvbnNvbGUubG9nKCdkaWQgeW91IGdldCBpbiBoZXJlPycpO1xuICAgIGdhcGkuYXV0aC5hdXRob3JpemUoe1xuICAgICAgICAnY2xpZW50X2lkJzogQ0xJRU5UX0lELFxuICAgICAgICAnc2NvcGUnOiBTQ09QRVMsXG4gICAgICAgICdpbW1lZGlhdGUnOiB0cnVlXG4gICAgfSwgaGFuZGxlQXV0aFJlc3VsdCk7XG59XG5cbi8qKlxuICogSGFuZGxlIHJlc3BvbnNlIGZyb20gYXV0aG9yaXphdGlvbiBzZXJ2ZXIuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGF1dGhSZXN1bHQgQXV0aG9yaXphdGlvbiByZXN1bHQuXG4gKi9cbmZ1bmN0aW9uIGhhbmRsZUF1dGhSZXN1bHQoYXV0aFJlc3VsdCkge1xuICBjb25zb2xlLmxvZygnYXV0aFJlc3VsdDogJywgYXV0aFJlc3VsdCk7XG4gICAgdmFyIGF1dGhvcml6ZURpdiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdhdXRob3JpemUtZGl2Jyk7XG4gICAgaWYgKGF1dGhSZXN1bHQgJiYgIWF1dGhSZXN1bHQuZXJyb3IpIHtcbiAgICAgICAgLy8gSGlkZSBhdXRoIFVJLCB0aGVuIGxvYWQgY2xpZW50IGxpYnJhcnkuXG4gICAgICAgIGF1dGhvcml6ZURpdi5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICAgICAgICBsb2FkR21haWxBcGkoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICAvLyBTaG93IGF1dGggVUksIGFsbG93aW5nIHRoZSB1c2VyIHRvIGluaXRpYXRlIGF1dGhvcml6YXRpb24gYnlcbiAgICAgICAgLy8gY2xpY2tpbmcgYXV0aG9yaXplIGJ1dHRvbi5cbiAgICAgICAgYXV0aG9yaXplRGl2LnN0eWxlLmRpc3BsYXkgPSAnaW5saW5lJztcbiAgICB9XG59XG5cbi8qKlxuICogSW5pdGlhdGUgYXV0aCBmbG93IGluIHJlc3BvbnNlIHRvIHVzZXIgY2xpY2tpbmcgYXV0aG9yaXplIGJ1dHRvbi5cbiAqXG4gKiBAcGFyYW0ge0V2ZW50fSBldmVudCBCdXR0b24gY2xpY2sgZXZlbnQuXG4gKi9cbmZ1bmN0aW9uIGhhbmRsZUF1dGhDbGljayhldmVudCkge1xuICBjb25zb2xlLmxvZygnZXZlbnQ6ICcsIGV2ZW50KTtcbiAgICBnYXBpLmF1dGguYXV0aG9yaXplKHsgY2xpZW50X2lkOiBDTElFTlRfSUQsIHNjb3BlOiBTQ09QRVMsIGltbWVkaWF0ZTogZmFsc2UgfSxcbiAgICAgICAgaGFuZGxlQXV0aFJlc3VsdCk7XG4gICAgcmV0dXJuIGZhbHNlO1xufVxuXG4vKipcbiAqIExvYWQgR21haWwgQVBJIGNsaWVudCBsaWJyYXJ5LiBMaXN0IGxhYmVscyBvbmNlIGNsaWVudCBsaWJyYXJ5XG4gKiBpcyBsb2FkZWQuXG4gKi9cbmZ1bmN0aW9uIGxvYWRHbWFpbEFwaSgpIHtcbiAgICBnYXBpLmNsaWVudC5sb2FkKCdnbWFpbCcsICd2MScsIGxpc3RMYWJlbHMpO1xufVxuXG4vKipcbiAqIFByaW50IGFsbCBMYWJlbHMgaW4gdGhlIGF1dGhvcml6ZWQgdXNlcidzIGluYm94LiBJZiBubyBsYWJlbHNcbiAqIGFyZSBmb3VuZCBhbiBhcHByb3ByaWF0ZSBtZXNzYWdlIGlzIHByaW50ZWQuXG4gKi9cbmZ1bmN0aW9uIGxpc3RMYWJlbHMoKSB7XG4gICAgdmFyIHJlcXVlc3QgPSBnYXBpLmNsaWVudC5nbWFpbC51c2Vycy5sYWJlbHMubGlzdCh7XG4gICAgICAgICd1c2VySWQnOiAnbWUnXG4gICAgfSk7XG5cbiAgICByZXF1ZXN0LmV4ZWN1dGUoZnVuY3Rpb24ocmVzcCkge1xuICAgICAgY29uc29sZS5sb2coJ3Jlc3A6ICcsIHJlc3ApO1xuICAgICAgICB2YXIgbGFiZWxzID0gcmVzcC5sYWJlbHM7XG4gICAgICAgIGFwcGVuZFByZSgnTGFiZWxzOicpO1xuXG4gICAgICAgIGlmIChsYWJlbHMgJiYgbGFiZWxzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCBsYWJlbHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICB2YXIgbGFiZWwgPSBsYWJlbHNbaV07XG4gICAgICAgICAgICAgICAgYXBwZW5kUHJlKGxhYmVsLm5hbWUpXG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBhcHBlbmRQcmUoJ05vIExhYmVscyBmb3VuZC4nKTtcbiAgICAgICAgfVxuICAgIH0pO1xufVxuXG4vKipcbiAqIEFwcGVuZCBhIHByZSBlbGVtZW50IHRvIHRoZSBib2R5IGNvbnRhaW5pbmcgdGhlIGdpdmVuIG1lc3NhZ2VcbiAqIGFzIGl0cyB0ZXh0IG5vZGUuXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IG1lc3NhZ2UgVGV4dCB0byBiZSBwbGFjZWQgaW4gcHJlIGVsZW1lbnQuXG4gKi9cbmZ1bmN0aW9uIGFwcGVuZFByZShtZXNzYWdlKSB7XG4gICAgdmFyIHByZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdvdXRwdXQnKTtcbiAgICB2YXIgdGV4dENvbnRlbnQgPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShtZXNzYWdlICsgJ1xcbicpO1xuICAgIHByZS5hcHBlbmRDaGlsZCh0ZXh0Q29udGVudCk7XG59XG5cbnJlcXVpcmUoJy4vdGFza2hpc3RvcnkuanMnKTtcbnJlcXVpcmUoJy4vY29tbWVudC5qcycpOyIsIiIsImNocm9tZS5ydW50aW1lLm9uTWVzc2FnZS5hZGRMaXN0ZW5lcihmdW5jdGlvbihyZXF1ZXN0LCBzZW5kZXIsIHNlbmRSZXNwb25zZSkge1xuICAgIGlmIChyZXF1ZXN0LnR5cGUgPT09ICdyZWFkIG1lc3NhZ2UnKSB7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBHZXQgVGhyZWFkIHdpdGggZ2l2ZW4gSUQuXG4gICAgICAgICAqXG4gICAgICAgICAqIEBwYXJhbSAge1N0cmluZ30gdXNlcklkIFVzZXIncyBlbWFpbCBhZGRyZXNzLiBUaGUgc3BlY2lhbCB2YWx1ZSAnbWUnXG4gICAgICAgICAqIGNhbiBiZSB1c2VkIHRvIGluZGljYXRlIHRoZSBhdXRoZW50aWNhdGVkIHVzZXIuXG4gICAgICAgICAqIEBwYXJhbSAge1N0cmluZ30gdGhyZWFkSWQgSUQgb2YgVGhyZWFkIHRvIGdldC5cbiAgICAgICAgICogQHBhcmFtICB7RnVuY3Rpb259IGNhbGxiYWNrIEZ1bmN0aW9uIHRvIGNhbGwgd2hlbiB0aGUgcmVxdWVzdCBpcyBjb21wbGV0ZS5cbiAgICAgICAgICovXG4gICAgICAgIGZ1bmN0aW9uIGdldFRocmVhZCh1c2VySWQsIHRocmVhZElkLCBjYWxsYmFjaykge1xuICAgICAgICAgICAgdmFyIHJlcSA9IGdhcGkuY2xpZW50LmdtYWlsLnVzZXJzLm1lc3NhZ2VzLmdldCh7XG4gICAgICAgICAgICAgICAgJ2lkJzogdGhyZWFkSWQsXG4gICAgICAgICAgICAgICAgJ3VzZXJJZCc6IHVzZXJJZCxcbiAgICAgICAgICAgICAgICAnZm9ybWF0JzogJ21ldGFkYXRhJ1xuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIHJldHVybiByZXEuZXhlY3V0ZShjYWxsYmFjayk7XG4gICAgICAgIH1cblxuICAgICAgICBnZXRUaHJlYWQoJ21lJywgcmVxdWVzdC50aHJlYWRJZCwgZnVuY3Rpb24oanNvbnJlc3AsIHJhd3Jlc3ApIHtcbiAgICAgICAgXHRjb25zb2xlLmxvZygnanNvbnJlc3AnLCBqc29ucmVzcCk7XG4gICAgICAgIFx0Ly8gY29uc29sZS5sb2coJ3Jhd1Jlc3AnLCByYXdyZXNwKTtcbiAgICAgICAgICAgIHNlbmRSZXNwb25zZShqc29ucmVzcCk7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICByZXR1cm4gdHJ1ZTtcbn0pO1xuIiwibW9kdWxlLmV4cG9ydHM9e1xuICAgIFwibWFuaWZlc3RfdmVyc2lvblwiOiAyLFxuICAgIFwibmFtZVwiOiBcIkhlbGxvIFdvcmxkIEV4dGVuc2lvblwiLFxuICAgIFwidmVyc2lvblwiOiBcIjEuMFwiLFxuICAgIFwicGVybWlzc2lvbnNcIjogW1xuICAgICAgICBcImh0dHBzOi8vbWFpbC5nb29nbGUuY29tL1wiLFxuICAgICAgICBcImh0dHBzOi8vaW5ib3guZ29vZ2xlLmNvbS9cIixcbiAgICAgICAgXCJpZGVudGl0eVwiXG4gICAgXSxcbiAgICAvLyBcImJyb3dzZXJfYWN0aW9uXCI6IHtcbiAgICAvLyAgIFwiZGVmYXVsdF9pY29uXCI6IHsgICAgICAgICAgICAgICAgICAgIC8vIG9wdGlvbmFsXG4gICAgLy8gICAgIFwiMTlcIjogXCJpbWFnZXMvaWNvbjE5LnBuZ1wiLCAgICAgICAgICAgLy8gb3B0aW9uYWxcbiAgICAvLyAgICAgXCIzOFwiOiBcImltYWdlcy9pY29uMzgucG5nXCIgICAgICAgICAgICAvLyBvcHRpb25hbFxuICAgIC8vICAgfSxcbiAgICAvLyAgIFwiZGVmYXVsdF90aXRsZVwiOiBcIkdvb2dsZSBNYWlsXCIsICAgICAgLy8gb3B0aW9uYWw7IHNob3duIGluIHRvb2x0aXBcbiAgICAvLyAgIFwiZGVmYXVsdF9wb3B1cFwiOiBcInBvcHVwLmh0bWxcIiAgICAgICAgLy8gb3B0aW9uYWxcbiAgICAvLyB9LCBcbiAgICBcIndlYl9hY2Nlc3NpYmxlX3Jlc291cmNlc1wiOiBbXG4gICAgICAgIFwibm9kZV9tb2R1bGVzLypcIixcbiAgICAgICAgXCJ0ZW1wbGF0ZXMvKlwiXG4gICAgXSxcbiAgICBcImJhY2tncm91bmRcIjoge1xuICAgICAgICBcInNjcmlwdHNcIjogW1wiYmFja2dyb3VuZC5idW5kbGUuanNcIl1cbiAgICB9LFxuICAgIFwib2F1dGgyXCI6IHtcbiAgICAgICAgXCJjbGllbnRfaWRcIjogXCIxMjQ4MzQyNDQ5NDktc2xuaG82Ym85ZmJ0YTlmNGdtYzVjcWlvcnBrYWhqbTYuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb21cIixcbiAgICAgICAgXCJzY29wZXNcIjogW1xuICAgICAgICAgIFwiZW1haWxcIiwgXCJvcGVuaWRcIiwgXCJwcm9maWxlXCIsIFwiaHR0cHM6Ly93d3cuZ29vZ2xlYXBpcy5jb20vYXV0aC9nbWFpbC5yZWFkb25seVwiXG4gICAgICAgIF1cbiAgICB9LFxuICAgIFwiY29udGVudF9zZWN1cml0eV9wb2xpY3lcIjogXCJzY3JpcHQtc3JjICdzZWxmJyAndW5zYWZlLWV2YWwnIGh0dHBzOi8vKi5nb29nbGUuY29tIGh0dHBzOi8vY2Fwc3RvbmUxNjA0Z2hhLmZpcmViYXNlaW8uY29tOyBvYmplY3Qtc3JjICdzZWxmJyBodHRwczovLyouZ29vZ2xlLmNvbSBodHRwczovL2NhcHN0b25lMTYwNGdoYS5maXJlYmFzZWlvLmNvbVwiLFxuICAgIFwiY29udGVudF9zY3JpcHRzXCI6IFt7XG4gICAgICAgIFwibWF0Y2hlc1wiOiBbXCJodHRwczovL21haWwuZ29vZ2xlLmNvbS8qXCIsIFwiaHR0cHM6Ly9pbmJveC5nb29nbGUuY29tLypcIl0sXG4gICAgICAgIFwianNcIjogW1wiZmlyZWJhc2UuanNcIiwgXCJpbmJveHNkay5qc1wiLCBcImJ1bmRsZS5qc1wiXVxuICAgIH1dLFxuICAgIFwia2V5XCI6IFwiTUlJQklqQU5CZ2txaGtpRzl3MEJBUUVGQUFPQ0FROEFNSUlCQ2dLQ0FRRUF5RjJQNUI3dmkrWjZ2RU9vTDdUbFpZZFQzQ0VCSHJoZHA4My85cHpUdUErOVpyaGdHUUdDMGl4K3U3NUR4cG96UHpCK1JPeld2VEh4TGdkdnRWdkg5N1phYm9jYWJVOFJteVpGUDdaUW5SZzlGeDkxVGNZY0JpK2krdDRIemgvNHFPMXRzT3dpODdXTWJVUkYzcHdNbWppUlhWdHRvSFFWYTQyaGNEeUhvU3pidVNJdFYyVXVFVW5HTDJscldkejNHOUJCb3JlRXR4SmNqNVpPNHFNNythVm4wR0c1V1d4NVltamhUOVg4MVJkU3I2cWhpaU8vSE9KVmJxWlY1ZDlVYlk4WW80bXpoUWhQalZ1Q29raTZjdnNDTTlXREkyK1ZVd3FpSlg2TVFDaVVGNkFHZmhTZzJDYXBnMVpaRHpHMk12bzhvelhSeXdTWlBDZ1QrQmJHelFJREFRQUJcIlxufSJdfQ==
