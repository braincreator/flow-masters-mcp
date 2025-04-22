#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

// Path to the problematic file
const reactCropCssPath = path.join(rootDir, 'node_modules/react-image-crop/dist/ReactCrop.css');
const reactCropCssJsPath = path.join(rootDir, 'node_modules/react-image-crop/dist/ReactCrop.css.js');

// Check if the CSS file exists
if (fs.existsSync(reactCropCssPath)) {
  console.log('Found ReactCrop.css, creating JS wrapper...');
  
  // Read the CSS content
  const cssContent = fs.readFileSync(reactCropCssPath, 'utf8');
  
  // Create a JS module that exports the CSS as a string
  const jsContent = `export default \`${cssContent}\`;\n`;
  
  // Write the JS module
  fs.writeFileSync(reactCropCssJsPath, jsContent);
  
  console.log('Created ReactCrop.css.js successfully!');
  
  // Update the import in the package
  const indexPath = path.join(rootDir, 'node_modules/react-image-crop/dist/esm/ReactCrop.mjs');
  
  if (fs.existsSync(indexPath)) {
    console.log('Updating import in ReactCrop.mjs...');
    
    let content = fs.readFileSync(indexPath, 'utf8');
    
    // Replace the CSS import with the JS import
    content = content.replace(
      "import '../ReactCrop.css';",
      "import '../ReactCrop.css.js';"
    );
    
    fs.writeFileSync(indexPath, content);
    console.log('Updated import successfully!');
  }
} else {
  console.log('ReactCrop.css not found, skipping...');
}

console.log('CSS import fix completed!');
