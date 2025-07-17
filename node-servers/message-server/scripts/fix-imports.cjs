const fs = require('fs');
const path = require('path');

function fixImportsInFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Fix relative imports to add .js extension for NodeNext module resolution
    // This regex matches relative imports that don't already have .js extension
    content = content.replace(
        /from ["'](\.\/[^"']*?)(?<!\.js)["']/g, 
        (match, importPath) => {
            // Skip if it's already a .js import or if it's a package import
            if (importPath.endsWith('.js') || !importPath.startsWith('./')) {
                return match;
            }
            return `from "${importPath}.js"`;
        }
    );
    
    // Fix specific shared-types imports
    content = content.replace(/from ["']\.\/openrouter["']/g, 'from "./openrouter.js"');
    content = content.replace(/from ["']\.\.\/\.\.\/lib\/entities\/ai-model["']/g, 'from "../ai-model.js"');
    
    fs.writeFileSync(filePath, content);
    console.log(`Fixed imports in ${filePath}`);
}

function processDirectory(dir) {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
            // Skip node_modules and dist directories
            if (file !== 'node_modules' && file !== 'dist') {
                processDirectory(filePath);
            }
        } else if (file.endsWith('.ts')) {
            fixImportsInFile(filePath);
        }
    }
}

// Process all TypeScript files in src directory
const srcDir = path.join(__dirname, '..', 'src');
if (fs.existsSync(srcDir)) {
    processDirectory(srcDir);
    console.log('Import fixing completed for all TypeScript files');
} else {
    console.log('src directory not found');
} 