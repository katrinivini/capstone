// var messages = require('../myapp.js').messages;

// InboxSDK.load('1.0', 'sdk_CapstoneIDK_aa9966850e').then(function(sdk) {
//     // the SDK has been loaded, now do something with it!
//     sdk.Compose.registerComposeViewHandler(function(composeView) {

//         /* link with info about intervals in inactive windows
//          http://stackoverflow.com/questions/5927284/how-can-i-make-setinterval-also-work-when-a-tab-is-inactive-in-chrome */
//         console.log('in compose view now whee');
//         //see if user has changed their text input
//         var interval = 1000/30; //30fps
//         var oldtext = '';
//         // setInterval(applyChanges, interval);
//         // var statusbar = composeView.addStatusBar();

//         // function applyChanges() {
//         //     try {
//         //         // this will always fire on page load if there is a draft with text in it
//         //         // if (oldtext !== composeView.getTextContent()) {
//         //         //     oldtext = composeView.getTextContent();
//         //         //     messages.update({ isChanging: true });
//         //         //     messages.update({ sender: composeView.getFromContact().name })

//         //         //     //should not be using 'value' to update this - but child_changed doesn't work? 
//         //         //     messages.on('value', function(data) {
//         //         //         statusbar.el.innerHTML = data.val().sender + "<b> is typing right now.</b>"

//         //         //     })

//         //         // } else {
//         //         //     messages.update({ isChanging: false });
//         //         //     messages.update({ sender: "" })
//         //         // }
//         //     } catch (err) {}
//         // }

//     });    
// });

var templates = require('../myapp.js').templates;

InboxSDK.load('1.0', 'sdk_CapstoneIDK_aa9966850e').then(function(sdk){

	sdk.Compose.registerComposeViewHandler(function(composeView){

		composeView.addButton({
			title: "Use a template",
			// iconUrl: '../../templates/paper_icon.png',
			iconUrl: 'chrome-extension://nnbcemhofefipmhikmmkofondhdbjlje/templates/paper_icon.png',
			hasDropdown: true,
			onClick: function(event) {
				var buttonEvent = event;
				var temps = [];
				// console.log('event: ', event);

				templates.once('value', function(snapshot){
					var data = snapshot.val();
					// console.log('data here', data);
					var properties = Object.getOwnPropertyNames(data);
					properties.map(function(prop){
						// console.log('firebase id of template', prop)
						var obj = {title: data[prop].title, body: data[prop].body };
						// console.log('what is obj', obj)
						temps.push(obj);
						return temps; 
					});
				})
				.then(function(){
					//make the div for the whole popup
					event.dropdown.el.className = "template-popup";

					var popupTitle = document.createElement('div');
					popupTitle.innerHTML = "Use an Email Template";
					popupTitle.className = "template-popup-title";
					event.dropdown.el.appendChild(popupTitle)

					temps.forEach(function(template){

						//make each template item 
						var list = document.createElement('div');
						list.className = "template-popup-item";
						var tempTitle = document.createElement('p');
						tempTitle.className = "template-title"
						var tempBody = document.createElement('p');
						tempBody.className = "template-body"
						tempTitle.innerHTML = template.title;
						tempBody.innerHTML = template.body.slice(0, 35) + "...";

						list.appendChild(tempTitle);
						list.appendChild(tempBody);

						event.dropdown.el.appendChild(list);

						list.addEventListener('click', function(event){
							buttonEvent.composeView.insertTextIntoBodyAtCursor(template.body);
						})
					})
				});

			},
		});

	});

});