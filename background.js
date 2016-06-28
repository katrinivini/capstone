var head = document.getElementsByTagName('head')[0];
var script = document.createElement('script');
script.type = 'text/javascript';
script.src = "https://apis.google.com/js/client.js?onload=gapiWasLoaded";
console.log('am i getting in here');
head.appendChild(script);

function gapiWasLoaded() {
    console.log('gapi loaded: ', arguments);
}

chrome.identity.getAuthToken({
    interactive: true
}, function(token) {
	console.log('hi im here now', token);
    if (chrome.runtime.lastError) {
        alert(chrome.runtime.lastError.message);
        return;
    }
    var x = new XMLHttpRequest();
    x.open('GET', 'https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=' + token);
    x.onload = function() {
        alert(x.response);
    };
    x.send();
});