InboxSDK.load('1.0', 'sdk_CapstoneIDK_aa9966850e').then(function(sdk) {
	sdk.Conversations.registerThreadViewHandler(function(threadView){
		var taskHistory = document.createElement('div');
		taskHistory.style = "height: 200px; width: 200px";
		threadView.addSidebarContentPanel({
			el : taskHistory,
			title: 'Task History',
			iconUrl: 'https://cdn3.iconfinder.com/data/icons/website-panel-icons/128/test1-13-512.png'
		})
	})
});