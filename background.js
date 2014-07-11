var push_message = function (tab, selection, device) {
    var token = localStorage.token,
        userkey = localStorage.userkey,
        valid = localStorage.valid || '-',
        device = device || '';
    if (valid !== token + userkey) {
        alert('Please check your settings!');
        chrome.tabs.create({
            url: 'options.html'
        });
        return false;
    }

    var params = 'token=' + encodeURIComponent(token) +
        '&user=' + encodeURIComponent(userkey) +
        '&device=' + encodeURIComponent(device) +
        '&title=' + encodeURIComponent(tab.title);
    if (selection) {
        params += '&message=' + encodeURIComponent(selection.substring(0, 512));
        params += '&url=' + encodeURIComponent(tab.url.substring(0, 500));
    } else {
        params += '&message=' + encodeURIComponent(tab.url.substring(0, 500));
    }

    var req = new XMLHttpRequest();
    req.open('POST', 'https://api.pushover.net/1/messages.json', true);
    req.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    req.send(params);

    req.onreadystatechange = function () {
        if (req.readyState === 4) {
            if (req.status === 200) {
                chrome.browserAction.setBadgeBackgroundColor({
                    'color': '#006400'
                });
                chrome.browserAction.setBadgeText({
                    'text': 'OK'
                });
                setTimeout(function () {
                    chrome.browserAction.setBadgeText({
                        'text': ''
                    });
                }, 2000);
            } else {
                chrome.browserAction.setBadgeText({
                    'text': 'FAIL'
                });
                chrome.browserAction.setBadgeBackgroundColor({
                    'color': '#ff0000'
                });
                setTimeout(function () {
                    chrome.browserAction.setBadgeText({
                        'text': ''
                    });
                }, 2000);
                // Lets blast the user with the response :)
                alert('ERROR: ' + req.responseText);
            }
        }
    };
    return false;
},
setup_contextMenus = function () {
    var devices = (localStorage.device || '-').split(',');
    var context_click_handler = function (info, tab) {
        for (var i in devices) {
            if (info.menuItemId === 'context-page' + devices[i]) {
                push_message(tab, '', devices[i]);
            } else if (info.menuItemId === 'context-link' + devices[i]) {
                push_message(tab, info.linkUrl, devices[i]);
            } else if (info.menuItemId === 'context-image' + devices[i]) {
                push_message(tab, info.srcUrl, devices[i]);
            } else if (info.menuItemId === 'context-selection' + devices[i]) {
                push_message(tab, info.selectionText, devices[i]);
            }
        }
    };
    // ["page","link","editable","image","video", "audio"];
    chrome.contextMenus.removeAll();
    for (var i in devices) {
        chrome.contextMenus.create({
            'title': 'Push this page to ' + devices[i],
                'contexts': ['page'],
                'id': 'context-page' + devices[i]
        });
        chrome.contextMenus.create({
            'title': 'Push this link to ' + devices[i],
                'contexts': ['link'],
                'id': 'context-link' + devices[i]
        });
        chrome.contextMenus.create({
            'title': 'Push this image to ' + devices[i],
                'contexts': ['image'],
                'id': 'context-image' + devices[i]
        });
        chrome.contextMenus.create({
            'title': 'Push this text to ' + devices[i],
                'contexts': ['selection'],
                'id': 'context-selection' + devices[i]
        });
    }
    chrome.contextMenus.onClicked.addListener(context_click_handler);
};

chrome.browserAction.onClicked.addListener(function (tab) {
    chrome.tabs.sendRequest(tab.id, {
        method: 'selection'
    }, function (text) {
        push_message(tab, text, '');
    });
});

chrome.runtime.onMessage.addListener(function (request) {
    if (request && request.action == "reload_contextMenus")  {
        setup_contextMenus();
    }
});

var token = localStorage.token,
    userkey = localStorage.userkey,
    valid = localStorage.valid || '-';
if (valid !== token + userkey) {
    chrome.tabs.create({
        url: 'options.html'
    });
} else {
    setup_contextMenus();
}
