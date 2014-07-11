var push_message = function (tab, selection) {
    var token = localStorage.token,
        userkey = localStorage.userkey,
        device = localStorage.device,
        valid = localStorage.valid || '-';

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
setup_contextMenus = function() {
    var context_click_handler = function(info, tab) {
        if(info.menuItemId === 'context-page') {
            push_message(tab);
        } else if(info.menuItemId === 'context-link') {
            push_message(tab, info.linkUrl);
        } else if(info.menuItemId === 'context-selection') {
            push_message(tab, info.selectionText);
        }
    };
    chrome.contextMenus.removeAll();
    // ["page","link","editable","image","video", "audio"];
    chrome.contextMenus.create({
        'title': 'Push this page',
        'contexts': ['page'],
        'id': 'context-page'
    });
    chrome.contextMenus.create({
        'title': 'Push this link',
        'contexts': ['link'],
        'id': 'context-link'
    });
    chrome.contextMenus.create({
        'title': 'Push this text',
        'contexts': ['selection'],
        'id': 'context-selection'
    });
    chrome.contextMenus.onClicked.addListener(context_click_handler);
};

chrome.browserAction.onClicked.addListener(function (tab) {
    chrome.tabs.sendRequest(tab.id, {
        method: 'selection'
    }, function (text) {
        push_message(tab, text);
    });
});
setup_contextMenus();