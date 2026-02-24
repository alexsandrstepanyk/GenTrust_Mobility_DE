import { Markup } from "telegraf";

export const mainMenu = Markup.keyboard([
    ["📸 Звіт", "🎒 Квести"],
    ["🏆 Рейтинг", "👤 Профіль"]
]).resize();

export const adminMenu = Markup.keyboard([
    ["🟢 Категорія А", "🔴 Категорія Б"],
    ["📊 Статистика", "🏢 Мої налаштування"]
]).resize();

export const categoryFilterMenu = Markup.inlineKeyboard([
    [Markup.button.callback("🛣️ Дороги", "filter_Roads"), Markup.button.callback("💡 Освітлення", "filter_Lighting")],
    [Markup.button.callback("🗑️ Сміття", "filter_Waste"), Markup.button.callback("🌳 Парки", "filter_Parks")],
    [Markup.button.callback("🎨 Вандалізм", "filter_Vandalism"), Markup.button.callback("🚰 Вода", "filter_Water")],
    [Markup.button.callback("🚗 Авто", "filter_Vehicles"), Markup.button.callback("❓ Інше", "filter_Other")],
    [Markup.button.callback("⬅️ Назад", "filter_back")]
]);
