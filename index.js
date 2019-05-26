


// // This informs the Telegram servers of the new webhook.
// // Note: we do not need to pass in the cert, as it already provided
// bot.setWebHook(`${url}/bot${TOKEN}`);
//
//
// // Just to ping!
// bot.on('message', function onMessage(msg) {
//     bot.sendMessage(msg.chat.id, 'I am alive on Zeit Now!');
// });
//
module.exports = (req, res) => {
    let m = "OK => ";
    try {

        const options = {
            // webHook: {
            //     port: 8443,
                // port: 0,
                // you do NOT need to set up certificates since OpenShift provides
                // the SSL certs already (https://<app-name>.rhcloud.com)
            // },
        };

        const TOKEN = "868060908:AAExL4mV3gfQGD-Lnukk0TV43rmtuBduxUs";
        const TelegramBot = require('node-telegram-bot-api');
        const bot = new TelegramBot(TOKEN);

        bot.on('message', (msg) => {
            const chatId = msg.chat.id;

            // send a message to the chat acknowledging receipt of their message
            bot.sendMessage(chatId, 'Received your message');
        });
        console.log(req.json);
        console.log(req.message);
        console.log(req.body);
        console.log(req.headers);
        console.log(req.url);
        console.log(req.method);
        m += req.body;
        // bot.processUpdate(req.body);

    } catch (e) {
        console.log("CUSTOM_______, o_______");
        console.log(e);
        m += " => NOT --" + e.toString();
    }

    res.end(m);
};