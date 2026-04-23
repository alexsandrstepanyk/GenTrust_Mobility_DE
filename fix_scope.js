#!/opt/homebrew/bin/node
import fs from 'fs';
import path from 'path';

const targetDirs = process.argv.slice(2);

function fixLayout(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    if (!content.includes('const navigation = [')) return;

    // Detect if navigation is outside
    const navRegex = /const navigation = \[\s*([\s\S]*?)\s*\];/;
    const match = content.match(navRegex);
    
    if (match && content.indexOf(match[0]) < content.indexOf('export default function')) {
        let navContent = match[0];
        // Remove from global scope
        content = content.replace(navRegex, '');
        // Insert into component scope
        content = content.replace(/export default function \w+\(\) {/, "$&\n  " + navContent);
        
        fs.writeFileSync(filePath, content);
        console.log(`✅ Fixed navigation scope in: ${filePath}`);
    }
}

targetDirs.forEach(baseDir => {
    const layoutPath = path.join(baseDir, 'src/components/Layout.tsx');
    if (fs.existsSync(layoutPath)) {
        fixLayout(layoutPath);
    }
});
