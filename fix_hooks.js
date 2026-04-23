#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const targetDirs = process.argv.slice(2);

function fixHooks(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    if (!content.includes("from 'react-i18next'")) return;
    if (content.includes('const { t } = useTranslation();')) {
        // Double check if it's inside a function
        return;
    }

    const funcRegex = /function (\w+)\(\) {/;
    if (funcRegex.test(content)) {
        content = content.replace(funcRegex, "$&\n  const { t } = useTranslation();");
        fs.writeFileSync(filePath, content);
    }
}

targetDirs.forEach(baseDir => {
    const pagesDir = path.join(baseDir, 'src/pages');
    if (fs.existsSync(pagesDir)) {
        fs.readdirSync(pagesDir).forEach(file => {
            if (file.endsWith('.tsx')) fixHooks(path.join(pagesDir, file));
        });
    }
});
