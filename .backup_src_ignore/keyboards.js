"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.categoryFilterMenu = exports.adminMenu = exports.mainMenu = void 0;
var telegraf_1 = require("telegraf");
exports.mainMenu = telegraf_1.Markup.keyboard([
    ["📸 Звіт", "🎒 Квести"],
    ["🏆 Рейтинг", "👤 Профіль"]
]).resize();
exports.adminMenu = telegraf_1.Markup.keyboard([
    ["🟢 Категорія А", "🔴 Категорія Б"],
    ["📊 Статистика", "🏢 Мої налаштування"]
]).resize();
exports.categoryFilterMenu = telegraf_1.Markup.inlineKeyboard([
    [telegraf_1.Markup.button.callback("🛣️ Дороги", "filter_Roads"), telegraf_1.Markup.button.callback("💡 Освітлення", "filter_Lighting")],
    [telegraf_1.Markup.button.callback("🗑️ Сміття", "filter_Waste"), telegraf_1.Markup.button.callback("🌳 Парки", "filter_Parks")],
    [telegraf_1.Markup.button.callback("🎨 Вандалізм", "filter_Vandalism"), telegraf_1.Markup.button.callback("🚰 Вода", "filter_Water")],
    [telegraf_1.Markup.button.callback("🚗 Авто", "filter_Vehicles"), telegraf_1.Markup.button.callback("❓ Інше", "filter_Other")],
    [telegraf_1.Markup.button.callback("⬅️ Назад", "filter_back")]
]);
