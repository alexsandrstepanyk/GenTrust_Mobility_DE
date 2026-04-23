#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const targetDirs = process.argv.slice(2);

function patchFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Layout.tsx patches
    if (filePath.endsWith('Layout.tsx')) {
        content = content.replace(/name: t\(['"]['"]\), href: ['"]\/reports['"]/, "name: t('reports'), href: '/reports'");
        content = content.replace(/name: t\(['"]['"]\), href: ['"]\/users['"]/, "name: t('users'), href: '/users'");
        content = content.replace(/name: t\(['"]['"]\), href: ['"]\/settings['"]/, "name: t('settings'), href: '/settings'");
        content = content.replace(/\{connected \? t\(['"]['"]\) : t\(['"]['"]\)\}/, "{connected ? t('connected') : t('disconnected')}");
        content = content.replace(/<LogOut[^>]*\/>\{t\(['"]['"]\)\}/, "<LogOut className=\"h-4 w-4\" />{t('logout')}");
        content = content.replace(/<h3[^>]*>\{t\(['"]['"]\)\}<\/h3>/, "<h3 className=\"font-semibold text-gray-900 dark:text-white\">{t('notifications')}</h3>");
        content = content.replace(/className=\"text-xs text-blue-600[^>]*>\{t\(['"]['"]\)\}/, "className=\"text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400\">{t('mark_as_read')}");
        content = content.replace(/<p>\{t\(['"]['"]\)\}<\/p>/, "<p>{t('no_notifications')}</p>");
    }

    // Dashboard.tsx patches
    if (filePath.endsWith('Dashboard.tsx')) {
        // Stat cards (order matters)
        let titles = ['total_reports', 'active_users', 'approved', 'pending'];
        content = content.replace(/title: t\(['"]_?['"]\)/g, () => `title: t('${titles.shift() || 'stats'}')`);

        content = content.replace(/<p[^>]*>\{t\(['"]dashboard_?['"]\)\}<\/p>/, "<p className=\"mt-2 text-sm text-gray-600 dark:text-gray-400\">{t('department_dashboard')}</p>");
        content = content.replace(/animate-spin' : ''\}` \/>\{t\(['"]['"]\)\}/, "animate-spin' : ''\}` />{t('refresh')}");
        
        // Charts
        content = content.replace(/<CardTitle>\{t\(['"]_?_?['"]\)\}<\/CardTitle>\s*<CardDescription>\{t\(['"]_30_['"]\)\}/, "<CardTitle>{t('reports_over_time')}</CardTitle>\n            <CardDescription>{t('last_30_days')}");
        content = content.replace(/<CardTitle>\{t\(['"]_?_?['"]\)\}<\/CardTitle>\s*<CardDescription>\{t\(['"]_?['"]\)\}/g, (match) => {
            if (match.includes('distribution')) return match; 
            return "<CardTitle>{t('status_distribution')}</CardTitle>\n            <CardDescription>{t('current_state')}";
        });
        content = content.replace(/<CardTitle>\{t\(['"]_?_?['"]\)\}<\/CardTitle>\s*<CardDescription>\{t\(['"]_?_?_?['"]\)\}/, "<CardTitle>{t('reports_by_category')}</CardTitle>\n            <CardDescription>{t('problem_type_distribution')}");
        
        content = content.replace(/name=\{t\(['"]['"]\)\}/g, (match, offset, full) => {
            if (full.indexOf('resolved') > offset) return "name={t('all')}";
            return "name={t('resolved')}";
        });

        content = content.replace(/<ThumbsUp[^>]*\/>\{t\(['"]['"]\)\}/, "<ThumbsUp className=\"h-4 w-4\" />{t('approve_btn')}");
        content = content.replace(/<Trash2[^>]*\/>\{t\(['"]['"]\)\}/, "<Trash2 className=\"h-4 w-4\" />{t('reject_btn')}");
        
        content = content.replace(/<CardTitle>\{t\(['"]_?['"]\)\}<\/CardTitle>\s*<CardDescription>\{t\(['"]_?_?_?['"]\)\}/, "<CardTitle>{t('recent_activity')}</CardTitle>\n          <CardDescription>{t('recent_system_actions')}");
    }

    fs.writeFileSync(filePath, content);
}

targetDirs.forEach(baseDir => {
    const pagesDir = path.join(baseDir, 'src/pages');
    const componentsDir = path.join(baseDir, 'src/components');
    [pagesDir, componentsDir].forEach(dir => {
        if (fs.existsSync(dir)) {
            fs.readdirSync(dir).forEach(file => {
                if (file.endsWith('.tsx')) patchFile(path.join(dir, file));
            });
        }
    });
});
