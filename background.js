var head = document.getElementsByTagName('head')[0];
var script = document.createElement('script');
script.type = 'text/javascript';
script.src = "https://apis.google.com/js/client.js?onload=gapiWasLoaded";
console.log('am i getting in here');
head.appendChild(script);
function gapiWasLoaded() {
    console.log('gapi loaded: ', arguments);
}
