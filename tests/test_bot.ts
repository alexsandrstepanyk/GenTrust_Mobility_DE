
import { Telegraf } from 'telegraf';
import dotenv from 'dotenv';
dotenv.config();
const bot = new Telegraf(process.env.BOT_TOKEN!);
console.log("Testing token and deleting webhook...");
bot.telegram.deleteWebhook().then(() => {
    console.log("Webhook deleted.");
    bot.on('text', (ctx) => {
        console.log("Received text:", ctx.message.text);
        return ctx.reply(`You said: ${ctx.message.text}`);
    });
    return bot.launch().then(() => console.log("Test Bot launched!"));
});
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
