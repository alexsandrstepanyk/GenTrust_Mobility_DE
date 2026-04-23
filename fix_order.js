#!/opt/homebrew/bin/node
import fs from 'fs';
import path from 'path';

const targetDirs = process.argv.slice(2);

function fixOrder(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    if (!content.includes('const { t } = useTranslation();')) return;
    if (!content.includes('const navigation = [')) return;

    // Remove them both first to be clean
    const tRegex = /\s*const { t } = useTranslation\(\);/;
    const navRegex = /\s*const navigation = \[\s*([\s\S]*?)\s*\];/;
    
    let navMatch = content.match(navRegex);
    if (!navMatch) return;
    
    let navCode = navMatch[0].trim();
    
    // Clean content
    content = content.replace(tRegex, '');
    content = content.replace(navRegex, '');
    
    // Re-insert in correct order at the top of the component
    const componentRegex = /(export default function \w+\([^{]*\) {)/;
    content = content.replace(componentRegex, `$1\n  const { t } = useTranslation();\n  ${navCode}`);
    
    fs.writeFileSync(filePath, content);
    console.log(`✅ Fixed execution order in: ${filePath}`);
}

targetDirs.forEach(baseDir => {
    const layoutPath = path.join(baseDir, 'src/components/Layout.tsx');
    if (fs.existsSync(layoutPath)) {
        fixOrder(layoutPath);
    }
});
