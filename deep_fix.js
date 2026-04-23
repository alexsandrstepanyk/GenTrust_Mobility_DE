#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const targetDirs = process.argv.slice(2);

const masterPatch = {
    'Звіти про проблеми': 'problem_reports',
    'На карті': 'on_map',
    'Всі': 'all',
    'На розгляді': 'pending',
    'В процесі': 'in_progress',
    'Вирішено': 'resolved',
    'Відхилено': 'rejected',
    'Завантаження звітів...': 'loading_reports',
    'Немає звітів за обраним фільтром': 'no_reports_filter',
    'Автор': 'author',
    'Дата створення': 'creation_date',
    'Карта проблем': 'problem_map',
    'Активні проблеми': 'active_problems',
    'Вирішені': 'resolved',
    'Рішення:': 'decision',
    'Відділ:': 'department',
    'Категорія:': 'category_label',
    'Впевненість:': 'confidence',
    'Пояснення:': 'explanation',
    'Опис': 'description',
    'Локація': 'location',
    'Відкрити в Google Maps': 'open_in_google_maps',
    'Дії модератора': 'moderator_actions',
    'Скасувати': 'cancel',
    'Вкажіть причину відхилення:': 'reject_reason',
    'Оберіть департамент для відповідального виконання:': 'choose_department_assign',
    'за місяць': 'per_month',
    'Останні 30 днів': 'last_30_days',
    'Поточний стан': 'current_state',
    'Розподіл за статусами': 'status_distribution',
    'Розподіл за типами проблем': 'problem_type_distribution',
    'Звіти за часом': 'reports_over_time',
    'Звіти за категоріями': 'reports_by_category',
    'Звіти на розгляді': 'pending_reports_review',
    'Затвердіть звіти': 'routing_instructions',
};

function deepFix(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // 1. Wrap dynamic Logo in Layout.tsx
    if (filePath.endsWith('Layout.tsx')) {
        if (content.includes('{deptEmoji} {deptName}')) {
            content = content.replace('{deptEmoji} {deptName}', '{deptEmoji} {t(deptName)}');
            modified = true;
        }
    }

    // 2. Replace static Ukrainian strings with t('key')
    for (const [uk, key] of Object.entries(masterPatch)) {
        // Tag content: >Текст<
        const tagRegex = new RegExp(`>\\s*${uk}\\s*<`, 'g');
        if (tagRegex.test(content)) {
            content = content.replace(tagRegex, `>{t('${key}')}<`);
            modified = true;
        }
        
        // Property values: "Текст" or 'Текст' in JS
        const propRegex = new RegExp(`:\\s*['"]${uk}['"]`, 'g');
        if (propRegex.test(content)) {
            content = content.replace(propRegex, `: t('${key}')`);
            modified = true;
        }

        // Just text in brackets: { "Текст" }
        const bracketRegex = new RegExp(`\\{\\s*['"]${uk}['"]\\s*\\}`, 'g');
        if (bracketRegex.test(content)) {
            content = content.replace(bracketRegex, `{t('${key}')}`);
            modified = true;
        }
    }

    if (modified) {
        fs.writeFileSync(filePath, content);
    }
}

targetDirs.forEach(baseDir => {
    const pagesDir = path.join(baseDir, 'src/pages');
    const componentsDir = path.join(baseDir, 'src/components');
    [pagesDir, componentsDir].forEach(dir => {
        if (fs.existsSync(dir)) {
            fs.readdirSync(dir).forEach(file => {
                if (file.endsWith('.tsx')) deepFix(path.join(dir, file));
            });
        }
    });
});
