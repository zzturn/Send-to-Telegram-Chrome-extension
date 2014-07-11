var $ = function (id) {
    return document.getElementById(id);
},
show_message = function (message, hide) {
    $('message').innerHTML = message;
    if (hide) {
        setTimeout(function () {
            $('message').innerHTML = '&nbsp;';
        }, 5000);
    }

},
validate = function () {
    var token = localStorage.token || '',
        userkey = localStorage.userkey || '',
        device = localStorage.device || '';

    if (device === '(all devices)' || device.split(',').length > 1) {
        device = '';
    }
    if (!userkey || !token) {
        show_message('Please fill both fields!');
        return;
    }

    var req = new XMLHttpRequest();
    req.open('POST', 'https://api.pushover.net/1/users/validate.json', true);
    var params = 'token=' + encodeURIComponent(token) +
        '&user=' + encodeURIComponent(userkey) +
        '&device=' + encodeURIComponent(device);

    req.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    req.send(params);

    req.onreadystatechange = function () {
        if (req.readyState === 4) {
            if (req.status === 200) {
                localStorage.valid = token + userkey;
                if (device === '') {
                    show_message('OK, seems legit! Pushing to ' + JSON.parse(req.responseText).devices, 3);
                    localStorage.device = JSON.parse(req.responseText).devices;
                } else {
                    show_message('OK, seems legit! Pushing to ' + device, 3);
                }
                chrome.runtime.sendMessage({
                    action: 'reload_contextMenus'
                });

            } else {
                localStorage.valid = '';
                show_message('Something is fishy: ' + req.responseText);
            }
        }
    };
},
save = function () {
    localStorage.userkey = $('userkey').value;
    localStorage.token = $('token').value;
    localStorage.device = $('device').value;
    show_message('Saved!');
    validate();
},
load = function () {
    $('userkey').value = localStorage.userkey || '';
    $('token').value = localStorage.token || '';
    $('device').value = localStorage.device || '(all devices)';
};


$('save').addEventListener('click', save);
window.addEventListener("load", load);
