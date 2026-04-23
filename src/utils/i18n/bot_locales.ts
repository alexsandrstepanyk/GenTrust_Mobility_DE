export const locales = {
  uk: {
    welcome: "👋 Вітаємо в системі GenTrust Alpha!",
    choose_role: "Оберіть вашу роль:",
    role_citizen: "Громадянин",
    role_guest: "Гість",
    settings: "⚙️ Налаштування",
    language: "🌐 Мова",
    choose_language: "Оберіть мову:",
    lang_updated: "✅ Мову успішно змінено на Українську!",
    main_menu: "🏠 Головне меню",
    report_issue: "📸 Повідомити про проблему",
    my_reports: "📋 Мої звіти",
    quests: "🎯 Завдання (Скаути)",
    balance: "💰 Мій баланс",
    profile: "👤 Профіль",
    back: "⬅️ Назад",
  },
  de: {
    welcome: "👋 Willkommen im GenTrust Alpha System!",
    choose_role: "Wählen Sie Ihre Rolle:",
    role_citizen: "Bürger",
    role_guest: "Gast",
    settings: "⚙️ Einstellungen",
    language: "🌐 Sprache",
    choose_language: "Wählen Sie eine Sprache:",
    lang_updated: "✅ Die Sprache wurde erfolgreich auf Deutsch geändert!",
    main_menu: "🏠 Hauptmenü",
    report_issue: "📸 Problem melden",
    my_reports: "📋 Meine Berichte",
    quests: "🎯 Aufgaben (Scouts)",
    balance: "💰 Mein Guthaben",
    profile: "👤 Profil",
    back: "⬅️ Zurück",
  }
};

export type LangType = 'uk' | 'de';

export function t(lang: LangType | string | null | undefined, key: keyof typeof locales.uk): string {
  const safeLang = (lang === 'de' ? 'de' : 'uk') as LangType;
  return locales[safeLang][key] || locales['uk'][key] || key;
}

export function getPossibleMatches(key: keyof typeof locales.uk): string[] {
  return [locales.uk[key], locales.de[key]];
}
