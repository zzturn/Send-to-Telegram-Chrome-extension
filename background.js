var open_options = function(msg) {
    if(msg) {
        localStorage._options_msg = msg;
    }
    if (chrome.runtime.openOptionsPage) {
        return chrome.runtime.openOptionsPage();
    }
    return chrome.tabs.create({
        url: chrome.runtime.getURL('options.html')
    });
},
combo_valid = function() {
    var valid = localStorage.valid || '',
        token = localStorage.token || '',
        userkey = localStorage.userkey || '';

    if (!valid || valid !== token + userkey) {
        open_options('Please check your configuration!');
        return false;
    }
    return true;
},
show_badge_text = function(color, text, timeout) {
    chrome.browserAction.setBadgeBackgroundColor({
        'color': color
    });
    chrome.browserAction.setBadgeText({
        'text': text
    });
    setTimeout(function() {
        chrome.browserAction.setBadgeText({
            'text': ''
        });
    }, timeout * 1000);
},
push_message = function(source, tab, selection, device) {
    if (!combo_valid()) {
        return false;
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
                show_badge_text('#006400', 'OK', 2);
            } else {
                var response = JSON.parse(req.responseText);
                if(response.errors) {
                    alert('Error: ' + response.errors);
                } else {
                    // Lets blast the user with the response :)
                    alert('Error: ' + req.responseText);
                }
                show_badge_text('#ff0000', 'FAIL', 5);
            }
        }
    };
    return false;
},
split_by_comma_list = function(value) {
    if (!value) {
        return [];
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
setup_context_menus = function() {
    var devices = get_menu_devices(),
        ctxs = ['page', 'link', 'image', 'selection'];
    chrome.contextMenus.removeAll();
    if (devices.length) {
        for(var j = 0; j < ctxs.length; j++) {
            for (var i = 0; i < devices.length; i++) {
                chrome.contextMenus.create({
                    'title': 'Push this ' + ctxs[j] + ' to ' + devices[i],
                    'contexts': [ctxs[j]],
                    'id': 'ctx:' + ctxs[j] + ':' + devices[i]
                });
            }
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
    if (request && request.action == "reload-contextmenus") {
        setup_context_menus();
    }
});

chrome.contextMenus.onClicked.addListener(function(info, tab) {
    var devices = get_menu_devices();
    if (devices.length) {
        for (var i = 0; i < devices.length; i++) {
            if (info.menuItemId === 'ctx:page:' + devices[i]) {
                return push_message('menu', tab, '', devices[i]);
            } else if (info.menuItemId === 'ctx:link:' + devices[i]) {
                return push_message('menu', tab, info.linkUrl, devices[i]);
            } else if (info.menuItemId === 'ctx:image:' + devices[i]) {
                return push_message('menu', tab, info.srcUrl, devices[i]);
            } else if (info.menuItemId === 'ctx:selection:' + devices[i]) {
                return push_message('menu', tab, info.selectionText, devices[i]);
            }
        }
    }
});

if (!localStorage.devices_all && localStorage.device) {
    localStorage.devices_all = localStorage.device;
    localStorage.removeItem('device');
}

if (combo_valid()) {
    setup_context_menus();
}
