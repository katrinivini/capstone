var sharedLabels = require('../myapp.js').sharedLabels;
var $ = require('jquery');

InboxSDK.load('1.0', 'sdk_CapstoneIDK_aa9966850e').then(function(sdk) {


	sdk.Toolbars.registerToolbarButtonForThreadView({
		title: 'Shared Labels',
		iconUrl: 'https://cdn0.iconfinder.com/data/icons/cosmo-layout/40/share-512.png',
		section: 'METADATA_STATE',
		hasDropdown: true,
		onClick: function(event){
			var labels;
			Promise.resolve(sharedLabels.once('value', function(snapshot){
				var data = snapshot.val();
				var properties = Object.getOwnPropertyNames(data);
				labels = properties.map(function(prop){
					return data[prop].label;
				});
			}))
			.then(function(){
				var list = document.createElement('div');
				labels.forEach(function(label){
					var p  = document.createElement('div');
					p.classList.add(label);
					p.innerHTML = label;
					p.addEventListener('click', function(event){
					})
					list.appendChild(p);
				})
				event.dropdown.el.appendChild(list);
			});
		}
	})
});
