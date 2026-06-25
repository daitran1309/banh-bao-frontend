const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // Replace background: 'var(--gray-200)' with background: 'var(--input-bg)'
    content = content.replace(/background:\s*['"]var\(--gray-200\)['"]/g, "background: 'var(--input-bg)'");
    
    // Also replace background: 'rgba(0,0,0,0.2)' and rgba(0,0,0,0.3) if used as backgrounds for cards
    content = content.replace(/background:\s*['"]rgba\(0,0,0,0\.2\)['"]/g, "background: 'var(--input-bg)'");
    content = content.replace(/background:\s*['"]rgba\(0,0,0,0\.3\)['"]/g, "background: 'var(--input-bg)'");

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated: ${filePath}`);
    }
}

function traverseDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            traverseDir(fullPath);
        } else if (fullPath.endsWith('.jsx')) {
            processFile(fullPath);
        }
    }
}

traverseDir(srcDir);
console.log('Done replacing grey backgrounds.');
