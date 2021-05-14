# Send-to-Telegram for Google Chrome

This is a Chrome extension that allow you to send web content (tab, text, image) to your own "Telegram Bot" using official Telegram API, such that your can sync instersting things across devices, i.e., your phone, your PC, and your laptop. 

This project is an alternative for [Pushbullet](https://www.pushbullet.com/) which stopped release on iOS ([Not Available on iOS : PushBullet](https://www.reddit.com/r/PushBullet/comments/eirc1m/not_available_on_ios/)). Since third party server is not required for this extension, so you do not need to worry about privacy.

This extension can be installed from [Chrome Web Store - Send to Telegram for Google Chrome](https://chrome.google.com/webstore/detail/send-to-telegram-for-goog/dgblfklicldlbclahclbkeiacpiiancc) (recommended) or the [release page](https://github.com/phguo/Send-to-Telegram-Chrome-extension/releases/latest).

## Getting Start

0. Install "Send to Telegram for Google Chrome" from [Chrome Web Store](https://chrome.google.com/webstore/detail/send-to-telegram-for-goog/dgblfklicldlbclahclbkeiacpiiancc).
1. Create a Telegram Bot following [Telegram official introduction](https://core.telegram.org/bots#6-botfather) and get your bot `<API token>`.
2. Get your `<User ID> ` by visiting `https://api.telegram.org/bot<API token>/getUpdates` after you send arbitrary content to your bot in telegram APP. The field "id" in the HTTP response is your `<User ID>`.
3. Fill your `<API token>` and `<User ID>` in the extension setting page. If everything is going on smoothly, the setting page will show a green "Saved!" and your bot will send your a massage of "Setting for 'Send-to-Telegram' successfully."

## Usage

You can use this extension intuitively:

- Send **tab** to your bot
  - click on the top right extension icon [Telegram icon](https://github.com/phguo/Send-to-Telegram-Chrome-extension/blob/master/tg.png?raw=true){:height="15%" width="15%"}.
- Send **text** to your bot
  - select web content and right click -> `Push this selection to Telegram Bot`.
- Send **image** to your bot
  - right click on an image -> `Send to Telegram for Google Chrome`.
- Send **URL** to yout bot
  - right click on a URL -> `Send to Telegram for Google Chrome`.

## Changelog

- [v0.9](https://github.com/phguo/Send-to-Telegram-Chrome-extension/releases/tag/v0.9) - Mar. 31, 2021
  - The first release.

## TODO

- [ ] Obtain `<API token>` automatically.
- [ ] Open new tab in Chrome when a URL is send to bot from phone.

## License

This project is licensed under the MIT License, see the [LICENSE](https://github.com/phguo/Send-to-Telegram-Chrome-extension/blob/master/LICENSE) file for details.

## Acknowledgments

This project was forked from [rahimnathwani/pushover-for-chrome](https://github.com/rahimnathwani/pushover-for-chrome) for Pushover.
