#!/usr/bin/env node

/**
 * Turbopack Admin Panel Fix Script
 * This script ensures proper environment setup for Turbopack admin panel styling
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🔧 Turbopack Admin Panel Fix - Setting up environment...\n');

// Check if we're using Turbopack
const isTurbopack = process.argv.includes('--turbopack') || 
                   process.argv.includes('--turbo') ||
                   process.env.TURBOPACK === 'true';

if (isTurbopack) {
  console.log('✅ Turbopack detected - Applying admin panel fixes...');
  
  // Set environment variable for Turbopack
  process.env.TURBOPACK = 'true';
  
  // Create .env.local with Turbopack flag if it doesn't exist
  const envLocalPath = '.env.local';
  let envContent = '';
  
  if (fs.existsSync(envLocalPath)) {
    envContent = fs.readFileSync(envLocalPath, 'utf8');
  }
  
  if (!envContent.includes('TURBOPACK=')) {
    envContent += '\n# Turbopack admin panel fix\nTURBOPACK=true\n';
    fs.writeFileSync(envLocalPath, envContent);
    console.log('✅ Updated .env.local with TURBOPACK=true');
  }
  
  // Check if admin styles are properly configured
  const adminLayoutPath = 'src/app/(payload)/layout.tsx';
  if (fs.existsSync(adminLayoutPath)) {
    const layoutContent = fs.readFileSync(adminLayoutPath, 'utf8');
    if (layoutContent.includes('turbopack-admin-styles')) {
      console.log('✅ Turbopack admin styles are properly configured');
    } else {
      console.log('⚠️  Warning: Turbopack admin styles may not be properly configured');
    }
  }
  
  console.log('\n🎯 Turbopack Admin Panel Configuration:');
  console.log('  - CSS optimization: DISABLED');
  console.log('  - PurgeCSS: DISABLED');
  console.log('  - Admin styles: CSS-in-JS injection');
  console.log('  - PostCSS: Turbopack-compatible mode');
  
} else {
  console.log('ℹ️  Standard webpack mode detected - Using webpack configuration');
  
  // Remove Turbopack flag from .env.local if it exists
  const envLocalPath = '.env.local';
  if (fs.existsSync(envLocalPath)) {
    let envContent = fs.readFileSync(envLocalPath, 'utf8');
    if (envContent.includes('TURBOPACK=true')) {
      envContent = envContent.replace(/\n?# Turbopack admin panel fix\nTURBOPACK=true\n?/g, '');
      fs.writeFileSync(envLocalPath, envContent);
      console.log('✅ Removed TURBOPACK flag from .env.local');
    }
  }
}

console.log('\n🚀 Environment setup complete!');

// Provide usage instructions
console.log('\n📋 Usage Instructions:');
console.log('  Development with Turbopack: pnpm dev:fast');
console.log('  Development with webpack:   pnpm dev');
console.log('  Build with Turbopack:       pnpm build:turbo');
console.log('  Build with webpack:         pnpm build');

console.log('\n💡 Admin Panel Testing:');
console.log('  1. Start the development server');
console.log('  2. Navigate to http://localhost:3000/admin');
console.log('  3. Verify that admin panel styling is correct');
console.log('  4. Test responsive behavior on different screen sizes');

if (isTurbopack) {
  console.log('\n⚡ Turbopack Mode Active:');
  console.log('  - Admin panel styles are injected via CSS-in-JS');
  console.log('  - CSS optimization is completely disabled');
  console.log('  - Styles are guaranteed to load regardless of build optimization');
}
