var $ = function (id) {
    return document.getElementById(id);
},
sounds = [
    {value: "pushover", text: "Pushover (default)"},
    {value: "bike", text: "Bike"},
    {value: "bugle", text: "Bugle"},
    {value: "cashregister", text: "Cash Register"},
    {value: "classical", text: "Classical"},
    {value: "cosmic", text: "Cosmic"},
    {value: "falling", text: "Falling"},
    {value: "gamelan", text: "Gamelan"},
    {value: "incoming", text: "Incoming"},
    {value: "intermission", text: "Intermission"},
    {value: "magic", text: "Magic"},
    {value: "mechanical", text: "Mechanical"},
    {value: "pianobar", text: "Piano Bar"},
    {value: "siren", text: "Siren"},
    {value: "spacealarm", text: "Space Alarm"},
    {value: "tugboat", text: "Tug Boat"},
    {value: "alien", text: "Alien Alarm (long)"},
    {value: "climb", text: "Climb (long)"},
    {value: "persistent", text: "Persistent (long)"},
    {value: "echo", text: "Pushover Echo (long)"},
    {value: "updown", text: "Up Down (long)"},
    {value: "none", text: "None (silent)"}
],
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
    req.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    req.send(
        'token=' + encodeURIComponent(token) +
        '&user=' + encodeURIComponent(userkey) +
        '&device=' + encodeURIComponent(device)
    );

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
    var sound = sounds[$('sounds').selectedIndex];
    if(sound) {
        localStorage.sound = sounds[$('sounds').selectedIndex].value;
    }
    show_message('Saved!');
    validate();
},
load = function () {
    $('userkey').value = localStorage.userkey || '';
    $('token').value = localStorage.token || '';
    $('device').value = localStorage.device || '(all devices)';

    for (var i = 0; i < sounds.length; i++) {
        var sound = sounds[i],
            option = document.createElement('option');
        option.value = sound.value;
        option.innerText = sound.text;
        if (option.value === localStorage.sound) {
            option.selected = true;
        }
        $('sounds').appendChild(option);
    }
};

$('save').addEventListener('click', save);
window.addEventListener("load", load);
