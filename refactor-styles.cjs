const fs = require('fs');
const path = require('path');

function replaceColors(content) {
    let newContent = content
        .replace(/#f59e0b/gi, 'var(--primary)')
        .replace(/#7c3aed/gi, 'var(--accent)')
        .replace(/#10b981|#059669/gi, 'var(--success)')
        .replace(/#dc2626|#B91C1C/gi, 'var(--danger)')
        .replace(/#3b82f6/gi, 'var(--info)')
        .replace(/#e5e7eb/gi, 'var(--gray-200)')
        .replace(/#6b7280|#9ca3af/gi, 'var(--text-muted)')
        .replace(/#374151|#1f2937|#92400e|#78350F/gi, 'var(--text-main)')
        .replace(/#fef3c7|#fffbeb|#fde68a|#f0fdf4|#eff6ff|#bfdbfe|#f9fafb|#f5f3ff|#f3f4f6/gi, 'var(--primary-light)')
        .replace(/#d1fae5/gi, 'var(--success-bg)')
        .replace(/#fee2e2/gi, 'var(--danger-bg)')
        .replace(/#d97706/gi, 'var(--warning)')
        .replace(/#065f46/gi, 'var(--success)');

    return newContent;
}

function processDir(directory) {
    const files = fs.readdirSync(directory);
    for (const file of files) {
        if (file.endsWith('.jsx')) {
            const filePath = path.join(directory, file);
            let content = fs.readFileSync(filePath, 'utf8');
            content = replaceColors(content);
            
            content = content.replace(/fontFamily:\s*'sans-serif'/g, "fontFamily: 'var(--font-body)'");

            fs.writeFileSync(filePath, content);
            console.log('Updated ' + filePath);
        }
    }
}

processDir('src/pages');
processDir('src/components');
