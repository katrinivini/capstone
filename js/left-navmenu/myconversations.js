var assignedHistory = require('../myapp.js').assignedHistory;

InboxSDK.load('1.0', 'sdk_CapstoneIDK_aa9966850e').then(function(sdk) {

    sdk.NavMenu.addNavItem({
        name: 'Assigned To Me',
        routeID: 'assignedtome',
        accessory: {
            type: 'ICON_BUTTON',
            iconUrl: 'http://www.clker.com/cliparts/M/D/T/Q/D/I/white-email-envelope-hi.png',
            onClick: function() {

            }
        }
    })
    var assignedHist;
    sdk.Lists.registerThreadRowViewHandler(function(threadRowView) {
        assignedHistory.on('child_added', function(snapshot) {
            var newassign = snapshot.val();
            console.log('new assign child_added threadrowview: ', snapshot.val());
            // assignedHist.forEach(function(a) {
            if (newassign.threadId === threadRowView.getThreadID()) {
                threadRowView.addLabel({
                    title: newassign.assignee,
                    foregroundColor: 'white',
                    backgroundColor: 'pink',
                    iconUrl: 'http://1klb.com/projects/assign/icon.png'
                })
            }
            // })	
        })
        // assignedHistory.once('value', function(snapshot) {
        //         assignedHist = snapshot.val();
        //     })
        //     .then(function() {
        //         if (assignedHist) {
        //             assignedHist.forEach(function(a) {
        //                 if (a.threadId === threadRowView.getThreadID()) {
        //                     threadRowView.addLabel({
        //                         title: a.assignee,
        //                         foregroundColor: 'white',
        //                         backgroundColor: 'pink',
        //                         iconUrl: 'http://1klb.com/projects/assign/icon.png'
        //                     })
        //                 }
        //             })

        //         }

        //     })

    });
});
