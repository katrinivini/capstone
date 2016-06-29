var head = document.getElementsByTagName('head')[0];
var script = document.createElement('script');
script.type = 'text/javascript';
script.src = "https://apis.google.com/js/client.js?onload=gapiWasLoaded";

head.appendChild(script);

function gapiWasLoaded() {
    console.log('gapi loaded: ', arguments);
}

function login(ok) {
 return chrome.identity.getAuthToken({
        interactive: true
    }, function(token) {
        console.log('hi im here now');
        if (chrome.runtime.lastError) {
            alert(chrome.runtime.lastError.message);
            return;
        }
        ok(token)
        console.log('token: ', token);
        var x = new XMLHttpRequest();
        x.open('GET', 'https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=' + token); //i think this is where the page is supposed to pop up
        x.onload = function() {
            alert(x.response);
        };
        x.send(); 
    });

}

function hello(){
    console.log("saying hello from background.js");
}
chrome.runtime.onMessage.addListener(function(request, sender, callback){
    console.log('request: ', request);
    console.log('sender: ', sender);
    login(callback)
    //callback(getAuthToken());
})
// module.exports = getAuthToken;

