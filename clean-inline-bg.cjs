const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // Remove background: 'var(--input-bg)', from inline styles of inputs since it's already in the CSS class
    content = content.replace(/background:\s*['"]var\(--input-bg\)['"],\s*/g, "");
    // Just in case it's the last property
    content = content.replace(/,\s*background:\s*['"]var\(--input-bg\)['"]/g, "");

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Cleaned up inline backgrounds: ${filePath}`);
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
