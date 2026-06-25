const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // Replace color: 'var(--white)' with color: 'var(--text-main)'
    content = content.replace(/color:\s*['"]var\(--white\)['"]/g, "color: 'var(--text-main)'");
    
    // Replace text-shadow: '...' for summary cards if they use --white
    content = content.replace(/rgba\(255,\s*255,\s*255,\s*0\.[0-9]+\)/g, "var(--gray-200)");

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
console.log('Done replacing var(--white) with var(--text-main)');
