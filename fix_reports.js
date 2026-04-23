#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const targetDirs = process.argv.slice(2);

function fixStatusLabels(filePath) {
    if (!filePath.endsWith('Reports.tsx')) return;
    let content = fs.readFileSync(filePath, 'utf8');

    content = content.replace(/RESOLVED: '✓ Вирішено'/, "RESOLVED: t('resolved')");
    content = content.replace(/IN_PROGRESS: '⟳ В процесі'/, "IN_PROGRESS: t('in_progress')");
    content = content.replace(/PENDING: '⏳ На розгляді'/, "PENDING: t('pending')");
    content = content.replace(/REJECTED: '✗ Відхилено'/, "REJECTED: t('rejected')");
    
    // Fallback labels in getAIConfidenceLabel
    content = content.replace(/'✅ Висока'/, "t('high_confidence')");
    content = content.replace(/'⚠️ Середня'/, "t('medium_confidence')");
    content = content.replace(/'❌ Низька'/, "t('low_confidence')");

    fs.writeFileSync(filePath, content);
}

targetDirs.forEach(baseDir => {
    const reportsPath = path.join(baseDir, 'src/pages/Reports.tsx');
    if (fs.existsSync(reportsPath)) fixStatusLabels(reportsPath);
});
