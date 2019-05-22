const moment = require('moment');
moment.locale('uk');

const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const TelegramBot = require('node-telegram-bot-api');
const token = '868060908:AAExL4mV3gfQGD-Lnukk0TV43rmtuBduxUs';

const MY_USER_ID = 386033446;

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, {polling: true});

const notes = [];
function addReminder(userId, time, text) {
    if (time.isBefore(moment().format("YYYY-MM-DD"))) {
        console.warn(`-Can not add reminder, because date is in the past ${time}`);
        return false;
    }
    notes.push({
        userId,
        time,
        text,
    });
    console.log(`+Reminder added for ${time}`);

    return true;
}

bot.onText(/remind (.+) at (.+)/, function (msg, match) {
    const userId = msg.from.id;
    const text = match[1];
    const time = moment(match[2], "L LT");
    if (time.isBefore()) {
        bot.sendMessage(userId, 'Too late, looser! Ha-ha!');
    } else {
        addReminder(userId, time, text);
        bot.sendMessage(userId, 'Roger that!:)');
    }
});

bot.onText(/thank you/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, "np");
});

const SECOND = 1000;
setInterval(function () {
    notes.forEach(function (item, index) {
        const timeFormat = 'YYYY-MM-DD HH:mm';
        if (item.time && item.time.isBefore() && item.time.format(timeFormat) === moment().format(timeFormat)) {
            try {
                bot.sendMessage(item.userId, item.text);
                notes.splice(index, 1);
            } catch (e) {
                console.error(e);
            }

        }
    });
}, SECOND * 5);

function sendAllNotes(userId) {
    for (let nodeItem of notes) {
        if (userId === nodeItem.userId) {
            bot.sendMessage(userId, `Text: ${nodeItem.text} \nDateTime: ${nodeItem.time}`);
        }
    }
}

bot.onText(/all/, (msg) => {
    const userId = msg.from.id;
    sendAllNotes(userId);
});

function parseSchedule() {
    JSDOM.fromURL("http://rozklad.kpi.ua/Schedules/ViewSchedule.aspx?g=607599b2-3369-4bda-8320-803f33aac337")
        .then(dom => {
            const rows = dom.window.document.getElementById('ctl00_MainContent_FirstScheduleTable').getElementsByTagName('tr');
            let currentDay;
            for (let item of rows) {
                const firstColumn = item.querySelector("td:nth-child(1)");
                const secondColumn = item.querySelector("td:nth-child(2)");

                // Head line for day
                if (!firstColumn.innerHTML
                    && secondColumn.innerHTML
                    && secondColumn.innerHTML.match(/[0123]\.[01][0-9]/)) {
                    currentDay = moment(secondColumn.innerHTML, "DD.MM");
                } else {
                    const firstColumnChildNodes = firstColumn.childNodes;
                    if (secondColumn.innerHTML
                        && firstColumnChildNodes.length
                        && firstColumnChildNodes.length === 3) {

                        let timeTokens = firstColumnChildNodes[2].textContent.split(":");

                        let className = secondColumn.childNodes[0].textContent;
                        let classTeacher = secondColumn.childNodes[2].textContent;
                        let classRoom = secondColumn.childNodes[4].textContent;

                        let classDateTime = currentDay.hours(parseInt(timeTokens[0]))
                            .minutes(parseInt(timeTokens[1]));

                        let classDescription = `\nSubject: ${className} \nTeacher: ${classTeacher} \nRoom: ${classRoom}`;
                        addReminder(MY_USER_ID, classDateTime, classDescription);
                    }
                }
            }
    });
}
parseSchedule();

