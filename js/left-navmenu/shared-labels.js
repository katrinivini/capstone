var sharedLabels = require('../myapp.js').sharedLabels;
var members = require('../myapp.js').members;
var $ = require('../myapp.js').$;

InboxSDK.load('1.0', 'sdk_CapstoneIDK_aa9966850e').then(function(sdk) {
    var create;
    create = document.createElement('input');
    create.type = 'submit';
    create.value = 'create';

    sdk.NavMenu.addNavItem({
        name: 'Shared Labels',
        accessory: {
            type: 'DROPDOWN_BUTTON',
            buttonBackgroundColor: 'purple',
            buttonForegroundColor: 'white',
            onClick: function(event) {
                var labels = [];
                var list = document.createElement('div');
                // Promise.resolve on a Promise is pointless. ~ ak.
                Promise.resolve(sharedLabels.on('child_added', function(snapshot) {
                        var data = snapshot.val();
                    if (data) {
                        //returns array of enumerable property names
                        // No, it doesn't. Object.getOwnPropertyNames is different from Object.keys
                        // in that it specifically includes non-enumerable properties. ~ ak.
                        var properties = Object.keys(data);
                        properties.forEach(function(prop) {
                            labels.push(data[prop]);
                        })
                    }
                })).then(function() {
                    labels.forEach(function(label) {
                        var lb = document.createElement('div');
                        lb.innerHTML = label;
                        list.appendChild(lb);
                    });
                    
                    list.appendChild(create);
                    event.dropdown.el.appendChild(list);
                });
            }
        }
    })
    
    create.addEventListener('click', function(event) {
        var mainDiv = document.createElement('div');

        //creating the label name
        var labelDiv = document.createElement('div');

        var createLabelHeader = document.createElement('h4');
        createLabelHeader.innerHTML = 'Create Label';

        var labelName = document.createElement('input');
        labelName.type = 'text';
        labelDiv.appendChild(createLabelHeader);
        labelDiv.appendChild(labelName);


        //submit button
        var submit = document.createElement('input');
        submit.type = 'submit';
        submit.value = 'Create Shared Label';
        submit.addEventListener('click', function(event) {
            var checkedMembers = Array.prototype.slice.call(document.getElementsByClassName('checked')).map(function(checkedMembers) {
                console.log('checkedMembers: ', checkedMembers);
                return checkedMembers.innerHTML;
            });
            // var threadId;
            // Promise.resolve(sdk.Conversations.registerThreadViewHandler(function(threadView) {
            //         threadId = threadView.getThreadID();
            //         console.log("threadId inside registerThreadViewHandler: ", threadId);
            //         return threadId;
            //     }))
            //     .then(function(blah) {
            //         console.log('checked members: ', checkedMembers);
            //         console.log("threadId: ", threadId);
            sharedLabels.push({ label: $(labelName).val(), members: checkedMembers });
            // })


            // sharedLabels.push({ label: $(labelName).val(), threadIds: threadId, members: checkedMembers});
            // labels.child('threadIds').set(threadId);
            // labels.child('members').set(checkedMembers);

        })

        //invite people
        var membersDiv = document.createElement('div');
        var membersHeader = document.createElement('h4');
        membersHeader.innerHTML = 'Invite People';
        membersDiv.appendChild(membersHeader);

        var listOfMembers = [];
        Promise.resolve(members.once('value', function(snapshot) {
                var data = snapshot.val();
                if (data) {
                    var properties = Object.getOwnPropertyNames(data); //returns array of enumerable property names
                    properties.forEach(function(prop) {
                        listOfMembers.push(data[prop]);
                    })
                }

            }))
            .then(function() {
                return Promise.resolve(listOfMembers.forEach(function(member) {
                    membersDiv.appendChild(createListItem(member));
                }));
            })
            .then(function() {
                mainDiv.appendChild(labelDiv);
                mainDiv.appendChild(membersDiv);
                mainDiv.appendChild(submit);

                sdk.Widgets.showModalView({
                    el: mainDiv,
                    title: 'Create Shared Label'
                })
            });
    });
});

function createListItem(name) {
    var listItem = document.createElement('li');
    var span = document.createElement('span');
    span.innerHTML = name;
    var checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.addEventListener('click', function(event) {
        span.classList.toggle('checked');
    });

    listItem.appendChild(span);
    listItem.appendChild(checkbox);
    console.log("checkbox checked: ", checkbox);
    return listItem;
}
