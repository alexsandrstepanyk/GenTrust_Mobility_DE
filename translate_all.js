#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const targetDirs = process.argv.slice(2);

const translations = {
    'Dashboard': 'dashboard',
    'Звіти': 'reports',
    'Користувачі': 'users',
    'Налаштування': 'settings',
    'Оновити': 'refresh',
    'Dashboard департаменту': 'department_dashboard',
    'Всього звітів': 'total_reports',
    'Активні користувачі': 'active_users',
    'Підтверджено': 'approved',
    'Очікують': 'pending',
    'Звіти за часом': 'reports_over_time',
    'Останні 30 днів': 'last_30_days',
    'Розподіл за статусами': 'status_distribution',
    'Поточний стан': 'current_state',
    'Звіти за категоріями': 'reports_by_category',
    'Розподіл за типами проблем': 'problem_type_distribution',
    'Звіти на розгляді': 'pending_reports_review',
    'Затвердіть звіти': 'routing_instructions',
    'Підтвердити': 'approve_btn',
    'Відхилити': 'reject_btn',
    'Недавня активність': 'recent_activity',
    'Останні дії в системі': 'recent_system_actions',
    'за місяць': 'per_month',
    'Всього': 'all',
    'Вирішено': 'resolved',
    'Підключено': 'connected',
    'Відключено': 'disconnected',
    'Вихід': 'logout',
    'Сповіщення': 'notifications',
    'Позначити як прочитано': 'mark_as_read',
    'Немає нових сповіщень': 'no_notifications',
};

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Fix t('') from previous broken run
    if (content.includes("t('')")) {
        // We will re-replace them below using the text mappings if possible, 
        // but better to just restore from Ukrainian if we can. 
        // For now, our loops below will target t('') if we can find the source.
        // Actually, let's just do a fresh pass.
    }

    // Replace strings
    for (const [uk, slug] of Object.entries(translations)) {
        // Fix the t('') bug
        const emptyT = new RegExp(`t\\(['"]['"]\\)`, 'g');
        // This is hard because we don't know which t('') is which.
        // Let's replace the whole construction if it matches a known problematic surrounding.
    }

    // Normal replacement logic (refined)
    for (const [uk, slug] of Object.entries(translations)) {
        // JSX Text
        const jsxRegex = new RegExp(`>\\s*${uk}\\s*<`, 'g');
        if (jsxRegex.test(content)) {
            content = content.replace(jsxRegex, `>{t('${slug}')}<`);
            modified = true;
        }
        
        // JS Object property
        const objRegex = new RegExp(`(\\w+):\\s*['"]${uk}['"]`, 'g');
        if (objRegex.test(content)) {
            content = content.replace(objRegex, `$1: t('${slug}')`);
            modified = true;
        }

        // React Prop
        const propRegex = new RegExp(`(\\w+)=(['"])${uk}(['"])`, 'g');
        if (propRegex.test(content)) {
            content = content.replace(propRegex, `$1={t('${slug}')}`);
            modified = true;
        }
    }
    
    // SPECIFIC FIX for the t('') mess:
    // If we find t('') and it's in a known place, we fix it manually.
    content = content.replace(/name: t\(['"]['"]\), href: ['"]\/reports['"]/, "name: t('reports'), href: '/reports'");
    content = content.replace(/name: t\(['"]['"]\), href: ['"]\/users['"]/, "name: t('users'), href: '/users'");
    content = content.replace(/name: t\(['"]['"]\), href: ['"]\/settings['"]/, "name: t('settings'), href: '/settings'");

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
                if (file.endsWith('.tsx')) processFile(path.join(dir, file));
            });
        }
    });
});
