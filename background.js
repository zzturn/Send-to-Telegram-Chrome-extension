var combo_valid = function(do_alert) {
    var valid = localStorage.valid || '',
        token = localStorage.token || '',
        userkey = localStorage.userkey || '';

    if (valid !== token + userkey) {
        if (do_alert) {
            alert(do_alert);
        }
        chrome.tabs.create({
            url: 'options.html'
        });
        return false;
    }
    return true;
},
push_message = function(source, tab, selection, device) {
    if (!combo_valid('Please check your settings!')) {
        return false
    }

    var params = 'token=' + encodeURIComponent(localStorage.token) +
                 '&user=' + encodeURIComponent(localStorage.userkey) +
                 '&title=' + encodeURIComponent(tab.title);

    if (source === 'badge' && localStorage.devices_badge) {
        device = localStorage.devices_badge;
    }

    if (device) {
        params += '&device=' + encodeURIComponent(device);
    }

    if (selection) {
        params += '&message=' + encodeURIComponent(selection.substring(0, 512));
        params += '&url=' + encodeURIComponent(tab.url.substring(0, 500));
    } else {
        params += '&message=' + encodeURIComponent(tab.url.substring(0, 500));
    }

    if (localStorage.sound) {
        params += '&sound=' + encodeURIComponent(localStorage.sound);
    }

    var req = new XMLHttpRequest();
    req.open('POST', 'https://api.pushover.net/1/messages.json', true);
    req.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    req.send(params);

    req.onreadystatechange = function() {
        if (req.readyState === 4) {
            if (req.status === 200) {
                chrome.browserAction.setBadgeBackgroundColor({
                    'color': '#006400'
                });
                chrome.browserAction.setBadgeText({
                    'text': 'OK'
                });
                setTimeout(function() {
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
                setTimeout(function() {
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
split_by_comma_list = function(value) {
    if (!value) {
        return []
    }
    return value.split(',');
},
get_menu_devices = function() {
    var devices = split_by_comma_list(localStorage.devices_menu);
    if (!devices.length) {
        devices = split_by_comma_list(localStorage.devices_all);
    }
    return devices;
},
setup_contextMenus = function() {
    var devices = get_menu_devices();
    chrome.contextMenus.removeAll();
    if (devices) {
        for (var i = 0; i < devices.length; i++) {
            chrome.contextMenus.create({
                'title': 'Push this page to ' + devices[i],
                'contexts': ['page'],
                'id': 'context-page:' + devices[i]
            });
            chrome.contextMenus.create({
                'title': 'Push this link to ' + devices[i],
                'contexts': ['link'],
                'id': 'context-link:' + devices[i]
            });
            chrome.contextMenus.create({
                'title': 'Push this image to ' + devices[i],
                'contexts': ['image'],
                'id': 'context-image:' + devices[i]
            });
            chrome.contextMenus.create({
                'title': 'Push this text to ' + devices[i],
                'contexts': ['selection'],
                'id': 'context-selection:' + devices[i]
            });
        }
    }
};

chrome.browserAction.onClicked.addListener(function(tab) {
    chrome.tabs.sendRequest(tab.id, {
        method: 'selection'
    }, function(text) {
        push_message('badge', tab, text);
    });
});

chrome.runtime.onMessage.addListener(function(request) {
    if (request && request.action == "reload_contextMenus") {
        setup_contextMenus();
    }
});

chrome.contextMenus.onClicked.addListener(function(info, tab) {
    var devices = get_menu_devices();
    if (!devices.length) {
        return;
    }
    for (var i = 0; i < devices.length; i++) {
        if (info.menuItemId === 'context-page:' + devices[i]) {
            push_message('menu', tab, '', devices[i]);
        } else if (info.menuItemId === 'context-link:' + devices[i]) {
            push_message('menu', tab, info.linkUrl, devices[i]);
        } else if (info.menuItemId === 'context-image:' + devices[i]) {
            push_message('menu', tab, info.srcUrl, devices[i]);
        } else if (info.menuItemId === 'context-selection:' + devices[i]) {
            push_message('menu', tab, info.selectionText, devices[i]);
        }
    }
});

if (!localStorage.devices_all && localStorage.device) {
    localStorage.devices_all = localStorage.device;
    localStorage.removeItem('device');
}

if (combo_valid()) {
    setup_contextMenus();
}
