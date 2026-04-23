import { Markup } from "telegraf";

export const getMainMenu = (lang: string = 'de') => {
    if (lang === 'uk') {
        return Markup.keyboard([
            ["📸 Звіт", "🎒 Квести"],
            ["🏆 Рейтинг", "👤 Профіль"]
        ]).resize();
    }
    return Markup.keyboard([
        ["📸 Problem melden", "🎒 Aufgaben"],
        ["🏆 Bewertung", "👤 Profil"]
    ]).resize();
};

export const mainMenu = getMainMenu('de');

export const getAdminMenu = (lang: string = 'de') => {
    if (lang === 'uk') {
        return Markup.keyboard([
            ["🟢 Категорія А", "🔴 Категорія Б"],
            ["📊 Статистика", "🏢 Мої налаштування"]
        ]).resize();
    }
    return Markup.keyboard([
        ["🟢 Kategorie A", "🔴 Kategorie B"],
        ["📊 Statistik", "🏢 Meine Einstellungen"]
    ]).resize();
};

export const adminMenu = getAdminMenu('de');

export const getCategoryFilterMenu = (lang: string = 'de') => {
    const labels = lang === 'uk' ? {
        roads: "🛣️ Дороги", lighting: "💡 Освітлення", waste: "🗑️ Сміття",
        parks: "🌳 Парки", vandalism: "🎨 Вандалізм", water: "🚰 Вода",
        vehicles: "🚗 Авто", other: "❓ Інше", back: "⬅️ Назад"
    } : {
        roads: "🛣️ Straßen", lighting: "💡 Beleuchtung", waste: "🗑️ Müll",
        parks: "🌳 Parks", vandalism: "🎨 Vandalismus", water: "🚰 Wasser",
        vehicles: "🚗 Fahrzeuge", other: "❓ Sonstiges", back: "⬅️ Zurück"
    };

    return Markup.inlineKeyboard([
        [Markup.button.callback(labels.roads, "filter_Roads"), Markup.button.callback(labels.lighting, "filter_Lighting")],
        [Markup.button.callback(labels.waste, "filter_Waste"), Markup.button.callback(labels.parks, "filter_Parks")],
        [Markup.button.callback(labels.vandalism, "filter_Vandalism"), Markup.button.callback(labels.water, "filter_Water")],
        [Markup.button.callback(labels.vehicles, "filter_Vehicles"), Markup.button.callback(labels.other, "filter_Other")],
        [Markup.button.callback(labels.back, "filter_back")]
    ]);
};

export const categoryFilterMenu = getCategoryFilterMenu('de');
