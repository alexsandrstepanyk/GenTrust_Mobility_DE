"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var telegraf_1 = require("telegraf");
var dotenv_1 = require("dotenv");
dotenv_1.default.config();
var bot = new telegraf_1.Telegraf(process.env.BOT_TOKEN);
console.log("Testing token and deleting webhook...");
bot.telegram.deleteWebhook().then(function () {
    console.log("Webhook deleted.");
    bot.on('text', function (ctx) {
        console.log("Received text:", ctx.message.text);
        return ctx.reply("You said: ".concat(ctx.message.text));
    });
    return bot.launch().then(function () { return console.log("Test Bot launched!"); });
});
process.once('SIGINT', function () { return bot.stop('SIGINT'); });
process.once('SIGTERM', function () { return bot.stop('SIGTERM'); });
