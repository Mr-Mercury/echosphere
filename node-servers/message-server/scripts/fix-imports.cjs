const fs = require('fs');
const path = require('path');

function fixImportsInFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Fix relative imports to add .js extension
    content = content.replace(/from ["']\.\/openrouter["']/g, 'from "./openrouter.js"');
    content = content.replace(/from ["']\.\.\/\.\.\/lib\/entities\/ai-model["']/g, 'from "@lib/entities/ai-model.js"');
    
    fs.writeFileSync(filePath, content);
    console.log(`Fixed imports in ${filePath}`);
}

function processDirectory(dir) {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
            processDirectory(filePath);
        } else if (file.endsWith('.ts')) {
            fixImportsInFile(filePath);
        }
    }
}

const sharedTypesDir = path.join(__dirname, '..', 'src', 'shared-types');
if (fs.existsSync(sharedTypesDir)) {
    processDirectory(sharedTypesDir);
    console.log('Import fixing completed');
} else {
    console.log('shared-types directory not found');
} 