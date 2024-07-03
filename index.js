const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const cors = require('cors');

const token = '6783937369:AAHACVP1RY1zTNGGkWCkzuPi1MR5y3WFGco';
const bot = new TelegramBot(token, { polling: true });

const webAppUrl = 'https://timely-druid-2432c2.netlify.app/';
const app = express();

app.use(express.json());
app.use(cors());

bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    if (text === '/start') {
        await bot.sendMessage(chatId, 'Fill out the form', {
            reply_markup: {
                inline_keyboard: [
                    [{ text: 'Fill in the form', web_app: { url: webAppUrl + '/form' } }]
                ]
            }
        })

        await bot.sendMessage(chatId, 'Fill out the form', {
            reply_markup: {
                inline_keyboard: [
                    [{ text: 'Make in order', web_app: { url: webAppUrl } }]
                ]
            }
        })
    }

    if (msg?.web_app_data?.data) {
        try {
            const data = JSON.parse(msg.web_app_data.data);

            await bot.sendMessage(chatId, `Thanks for your feetback!`);
            await bot.sendMessage(chatId, `Your country: ${data?.country}`);
            await bot.sendMessage(chatId, `Your street: ${data?.street}`);

            setTimeout(async () => {
                await bot.sendMessage(chatId, `You will get all the information in this chat`);
            }, 3000);

        } catch (error) {
            console.log(error);
        }
    }
});

app.post('/web-data', async (req, res) => {
    const {queryId, products, totalPrice} = req.body;
    try {
        await bot.answerWebAppQuery(queryId, {
            type: 'article',
            id: queryId,
            title: 'Succsess buy',
            input_message_content: {message_text: `Congratulations! You spent ${totalPrice} $`},
        });
        return res.status(200).json({});
    } catch (error) {
        await bot.answerWebAppQuery(queryId, {
            type: 'article',
            id: queryId,
            title: 'Error to buy products :(',
            input_message_content: {message_text: `Congratulations! You spent ${totalPrice} $`},
        }); 
        console.log(error);
        return res.status(500).json({});
    }
})

const PORT = '8080';

app.listen(PORT, () => console.log('Server active on PORT ' + PORT));