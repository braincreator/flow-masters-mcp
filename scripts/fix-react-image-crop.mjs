#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

// Find the file that imports the CSS
const findImportingFiles = () => {
  const nodeModulesDir = path.join(rootDir, 'node_modules');
  const reactImageCropDir = path.join(nodeModulesDir, 'react-image-crop');
  
  if (!fs.existsSync(reactImageCropDir)) {
    console.log('react-image-crop directory not found');
    return [];
  }
  
  const results = [];
  
  // Function to recursively search for files
  const searchDir = (dir) => {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        searchDir(filePath);
      } else if (stat.isFile() && (file.endsWith('.js') || file.endsWith('.mjs'))) {
        const content = fs.readFileSync(filePath, 'utf8');
        
        if (content.includes('ReactCrop.css')) {
          results.push(filePath);
        }
      }
    }
  };
  
  searchDir(reactImageCropDir);
  return results;
};

// Main function
const main = () => {
  console.log('Searching for files that import ReactCrop.css...');
  const files = findImportingFiles();
  
  if (files.length === 0) {
    console.log('No files found that import ReactCrop.css');
    return;
  }
  
  console.log(`Found ${files.length} files that import ReactCrop.css:`);
  
  for (const file of files) {
    console.log(`- ${file}`);
    
    // Create a backup of the file
    const backupFile = `${file}.bak`;
    fs.copyFileSync(file, backupFile);
    
    // Read the file content
    let content = fs.readFileSync(file, 'utf8');
    
    // Replace the import statement
    content = content.replace(/import ['"]\.\.\/ReactCrop\.css['"];?/g, '// CSS import removed for ESM compatibility');
    
    // Write the modified content back to the file
    fs.writeFileSync(file, content);
    
    console.log(`  Modified ${file}`);
  }
  
  console.log('All files have been modified successfully!');
};

main();
