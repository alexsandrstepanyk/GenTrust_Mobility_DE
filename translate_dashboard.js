const fs = require('fs');
const path = require('path');

const i18nPath = path.join(__dirname, 'city-hall-dashboard/src/i18n.ts');
const reportsPath = path.join(__dirname, 'city-hall-dashboard/src/pages/Reports.tsx');
const usersPath = path.join(__dirname, 'city-hall-dashboard/src/pages/Users.tsx');
const settingsPath = path.join(__dirname, 'city-hall-dashboard/src/pages/Settings.tsx');

const dictionary = {
  // Reports
  "problem_reports": { uk: "Звіти про проблеми", de: "Problemberichte" },
  "on_map": { uk: "На карті", de: "Auf der Karte" },
  "all": { uk: "Всі", de: "Alle" },
  "in_progress": { uk: "В процесі", de: "In Bearbeitung" },
  "resolved": { uk: "Вирішено", de: "Gelöst" },
  "loading_reports": { uk: "Завантаження звітів...", de: "Berichte werden geladen..." },
  "no_reports_filter": { uk: "Немає звітів за обраним фільтром", de: "Keine Berichte für den ausgewählten Filter" },
  "author": { uk: "Автор", de: "Autor" },
  "creation_date": { uk: "Дата створення", de: "Erstellungsdatum" },
  "problem_map": { uk: "Карта проблем", de: "Problemkarte" },
  "active_problems": { uk: "Активні проблеми", de: "Aktive Probleme" },
  "ai_recommendation": { uk: "🤖 Рекомендація ШІ", de: "🤖 KI-Empfehlung" },
  "is_issue": { uk: "Чи є проблемою:", de: "Ist ein Problem:" },
  "yes": { uk: "Так", de: "Ja" },
  "no": { uk: "Ні", de: "Nein" },
  "confidence": { uk: "Впевненість:", de: "Sicherheit:" },
  "category": { uk: "Категорія:", de: "Kategorie:" },
  "apply_ai": { uk: "🤖 Застосувати рекомендацію ШІ", de: "🤖 KI-Empfehlung anwenden" },
  "description": { uk: "Опис", de: "Beschreibung" },
  "location": { uk: "Локація", de: "Standort" },
  "latitude": { uk: "Широта:", de: "Breitengrad:" },
  "longitude": { uk: "Довгота:", de: "Längengrad:" },
  "moderator_actions": { uk: "Дії модератора", de: "Moderator-Aktionen" },
  "confirm_report": { uk: "✅ Підтвердити звіт", de: "✅ Bericht bestätigen" },
  "choose_department_assign": { uk: "Оберіть департамент для відповідального виконання:", de: "Wählen Sie die verantwortliche Abteilung:" },
  "general_dept": { uk: "📋 Загальний відділ", de: "📋 Allgemeine Abteilung" },
  "processing": { uk: "⏳ Обробка...", de: "⏳ Wird bearbeitet..." },
  "reject_report": { uk: "❌ Відхилити звіт", de: "❌ Bericht ablehnen" },
  "reject_reason": { uk: "Вкажіть причину відхилення:", de: "Grund für Ablehnung angeben:" },
  "reject_placeholder": { uk: "Наприклад: недостатньо інформації, фейкове фото...", de: "Zum Beispiel: nicht genügend Informationen, gefälschtes Foto..." },
  
  // Users
  "users_title": { uk: "Користувачі", de: "Benutzer" },
  "users_desc": { uk: "Управління користувачами системи", de: "Systembenutzer verwalten" },
  "awaiting_confirmation": { uk: "Очікують підтвердження", de: "Ausstehende Bestätigung" },
  "active_plural": { uk: "Активні", de: "Aktiv" },
  "students": { uk: "Учні", de: "Schüler" },
  "parents": { uk: "Батьки", de: "Eltern" },
  "users_list": { uk: "Список користувачів", de: "Benutzerliste" },
  "all_registered_users": { uk: "Всі зареєстровані користувачі", de: "Alle registrierten Benutzer" },
  "user": { uk: "Користувач", de: "Benutzer" },
  "contacts": { uk: "Контакти", de: "Kontakte" },
  "registration": { uk: "Реєстрація", de: "Registrierung" },
  "quests_completed": { uk: "квестів", de: "Quests" },
  "details_btn": { uk: "Деталі", de: "Details" },

  // Settings
  "settings_desc": { uk: "Конфігурація системи City Hall Dashboard", de: "City Hall Dashboard Konfiguration" },
  "notifications": { uk: "Сповіщення", de: "Benachrichtigungen" },
  "notifications_desc": { uk: "Налаштування push-сповіщень", de: "Push-Benachrichtigungseinstellungen" },
  "new_reports": { uk: "Нові звіти", de: "Neue Berichte" },
  "user_registration": { uk: "Реєстрація користувачів", de: "Benutzerregistrierung" },
  "email_notifications": { uk: "Email-сповіщення", de: "E-Mail-Benachrichtigungen" },
  "security": { uk: "Безпека", de: "Sicherheit" },
  "access_settings": { uk: "Налаштування доступу", de: "Zugriffseinstellungen" },
  "session_time": { uk: "Час сесії (хвилин)", de: "Sitzungszeit (Minuten)" },
  "change_password": { uk: "Змінити пароль", de: "Passwort ändern" },
  "database": { uk: "База даних", de: "Datenbank" },
  "sync_backup": { uk: "Синхронізація та backup", de: "Synchronisierung und Backup" },
  "create_backup": { uk: "Створити backup", de: "Backup erstellen" },
  "sync_telegram": { uk: "Синхронізувати з Telegram Bot", de: "Mit Telegram Bot synchronisieren" },
  "integrations": { uk: "Інтеграції", de: "Integrationen" },
  "connect_services": { uk: "Підключення до інших сервісів", de: "Verbindung zu anderen Diensten" },

  // Missing Dashboard keys
  "roads_and_sidewalks": { uk: "🛣️ Дороги та тротуари", de: "🛣️ Straßen & Gehwege" },
  "waste_and_recycling": { uk: "🗑️ Сміття та переробка", de: "🗑️ Müll & Recycling" },
  "parks_and_rec": { uk: "🌳 Парки та зони відпочинку", de: "🌳 Parks & Erholung" },
  "water_supply": { uk: "💧 Водопостачання", de: "💧 Wasserversorgung" },
  "graffiti": { uk: "🎨 Графіті", de: "🎨 Graffiti" }
};

// 1. Update i18n.ts
let i18nContent = fs.readFileSync(i18nPath, 'utf8');

// We will inject new translations into the i18n.ts file correctly.
const deAdditions = Object.entries(dictionary).map(([k, v]) => `"${k}": "${v.de}"`).join(',\n      ');
const ukAdditions = Object.entries(dictionary).map(([k, v]) => `"${k}": "${v.uk}"`).join(',\n      ');

i18nContent = i18nContent.replace(/("rejected": "Abgelehnt",)/, '$1\n      ' + deAdditions + ',');
i18nContent = i18nContent.replace(/("rejected": "Відхилено",)/, '$1\n      ' + ukAdditions + ',');
// Note: Some might be duplicated because of dashboard.tsx additions, but this is fine

fs.writeFileSync(i18nPath, i18nContent);


// 2. Perform replacements in components

function processFile(targetPath, isAppLevel = false) {
  if (!fs.existsSync(targetPath)) return;
  let content = fs.readFileSync(targetPath, 'utf8');
  
  if (!content.includes('useTranslation')) {
    content = content.replace(/(import React.*?;\n|import .*?;\n)/, `$1import { useTranslation } from 'react-i18next';\n`);
  }
  
  // Inject into component
  const componentMatch = content.match(/function [A-Z][a-zA-Z0-9_]*\([^)]*\)\s*{|const [A-Z][a-zA-Z0-9_]* = \([^)]*\) =>\s*{/);
  if (componentMatch && !content.includes('const { t, i18n } = useTranslation();')) {
     content = content.replace(componentMatch[0], `${componentMatch[0]}\n  const { t, i18n } = useTranslation();`);
  } else if (!content.includes('const { t, i18n }') && content.includes('const { t }')) {
     content = content.replace('const { t } = useTranslation();', 'const { t, i18n } = useTranslation();');
  }

  // Common replacements
  const mappings = [
    // Settings mappings
    [/>Налаштування</g, '>{t("settings")}<'],
    [/>Конфігурація системи City Hall Dashboard</g, '>{t("settings_desc")}<'],
    [/>Сповіщення</g, '>{t("notifications")}<'],
    [/>Налаштування push-сповіщень</g, '>{t("notifications_desc")}<'],
    [/>Нові звіти</g, '>{t("new_reports")}<'],
    [/>Реєстрація користувачів</g, '>{t("user_registration")}<'],
    [/>Email-сповіщення</g, '>{t("email_notifications")}<'],
    [/>Безпека</g, '>{t("security")}<'],
    [/>Налаштування доступу</g, '>{t("access_settings")}<'],
    [/>Час сесії \(хвилин\)</g, '>{t("session_time")}<'],
    [/>Змінити пароль</g, '>{t("change_password")}<'],
    [/>База даних</g, '>{t("database")}<'],
    [/>Синхронізація та backup</g, '>{t("sync_backup")}<'],
    [/>Створити backup</g, '>{t("create_backup")}<'],
    [/>Синхронізувати з Telegram Bot</g, '>{t("sync_telegram")}<'],
    [/>Інтеграції</g, '>{t("integrations")}<'],
    [/>Підключення до інших сервісів</g, '>{t("connect_services")}<'],
    [/>Підключено</g, '>{t("connected")}<'],

    // Users mappings
    [/>\s*Користувачі\s*</g, '>{t("users_title")}<'],
    [/>\s*Управління користувачами системи\s*</g, '>{t("users_desc")}<'],
    [/>Очікують підтвердження</g, '>{t("awaiting_confirmation")}<'],
    [/>Активні</g, '>{t("active_plural")}<'],
    [/>Учні</g, '>{t("students")}<'],
    [/>Батьки</g, '>{t("parents")}<'],
    [/>Список користувачів</g, '>{t("users_list")}<'],
    [/>Всі зареєстровані користувачі</g, '>{t("all_registered_users")}<'],
    [/>Користувач</g, '>{t("user")}<'],
    [/>Контакти</g, '>{t("contacts")}<'],
    [/>Роль</g, '>{t("role")}<'],
    [/>Статус</g, '>{t("status")}<'],
    [/>Реєстрація</g, '>{t("registration")}<'],
    [/>Дії</g, '>{t("actions")}<'],
    [/>Деталі</g, '>{t("details_btn")}<'],
    [/квестів/g, "{t('quests_completed')}"],
    [/звітів/g, "{t('reports')}"],

    // Reports mappings
    [/>Звіти про проблеми</g, '>{t("problem_reports")}<'],
    [/>На карті /g, '>{t("on_map")} '],
    [/>Всі \(/g, '>{t("all")} ('],
    [/>На розгляді \(/g, '>{t("pending")} ('],
    [/>В процесі \(/g, '>{t("in_progress")} ('],
    [/>Вирішено \(/g, '>{t("resolved")} ('],
    [/>Завантаження звітів...?</g, '>{t("loading_reports")}<'],
    [/>Немає звітів за обраним фільтром</g, '>{t("no_reports_filter")}<'],
    [/>Автор</g, '>{t("author")}<'],
    [/>Дата створення</g, '>{t("creation_date")}<'],
    [/>Карта проблем</g, '>{t("problem_map")}<'],
    [/>Активні проблеми /g, '>{t("active_problems")} '],
    [/>🤖 Рекомендація ШІ</g, '>{t("ai_recommendation")}<'],
    [/>Чи є проблемою:</g, '>{t("is_issue")}<'],
    [/>Впевненість:</g, '>{t("confidence")}<'],
    [/>Категорія:</g, '>{t("category")}<'],
    [/>🤖 Застосувати рекомендацію ШІ</g, '>{t("apply_ai")}<'],
    [/>Опис</g, '>{t("description")}<'],
    [/>Локація</g, '>{t("location")}<'],
    [/>Широта:/g, '>{t("latitude")}<'],
    [/>Довгота:/g, '>{t("longitude")}<'],
    [/>Дії модератора</g, '>{t("moderator_actions")}<'],
    [/>✅ Підтвердити</g, '>✅ {t("approve_btn")}<'],
    [/>❌ Відхилити</g, '>❌ {t("reject_btn")}<'],
    [/>✅ Підтвердити звіт</g, '>{t("confirm_report")}<'],
    [/>❌ Відхилити звіт</g, '>{t("reject_report")}<'],
    [/>Оберіть департамент для відповідального виконання:</g, '>{t("choose_department_assign")}<'],
    [/>Вкажіть причину відхилення:</g, '>{t("reject_reason")}<'],
    [/placeholder="Наприклад: недостатньо інформації([^"]+)"/, 'placeholder={t("reject_placeholder")}'],
    [/>📋 Загальний відділ</g, '>{t("general_dept")}<'],
    [/>🛣️ Дороги та тротуари</g, '>{t("roads_and_sidewalks")}<'],
    [/>💡 Освітлення</g, '>{t("lighting_dept")}<'],
    [/>🗑️ Сміття та переробка</g, '>{t("waste_and_recycling")}<'],
    [/>🌳 Парки та зони відпочинку</g, '>{t("parks_and_rec")}<'],
    [/>💧 Водопостачання</g, '>{t("water_supply")}<'],
    [/>🚌 Транспорт</g, '>{t("transport_dept")}<'],
    [/>🎨 Графіті</g, '>{t("graffiti")}<'],
    [/>Скасувати</g, '>{t("cancel")}<'],
    [/'⏳ Обробка\.\.\.'/g, 't("processing")']
  ];

  for (const [pattern, replacement] of mappings) {
    content = content.replace(pattern, replacement);
  }

  // Specific dynamic bindings for Reports
  if (targetPath.includes('Reports.tsx')) {
    content = content.replace(/toLocaleDateString\('uk-UA'/g, "toLocaleDateString(i18n.language === 'de' ? 'de-DE' : 'uk-UA'");
    content = content.replace(/toLocaleTimeString\('uk-UA'/g, "toLocaleTimeString(i18n.language === 'de' ? 'de-DE' : 'uk-UA'");
    content = content.replace(/'✓ Вирішено',/g, "t('resolved'),");
    content = content.replace(/'⟳ В процесі',/g, "t('in_progress'),");
    content = content.replace(/'⏳ На розгляді',/g, "t('pending'),");
    content = content.replace(/'✗ Відхилено'/g, "t('rejected')");
  }

  fs.writeFileSync(targetPath, content);
  console.log('Processed', targetPath);
}

processFile(reportsPath);
processFile(usersPath);
processFile(settingsPath);
