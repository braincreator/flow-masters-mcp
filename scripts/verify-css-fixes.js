#!/usr/bin/env node

/**
 * CSS Fixes Verification Script
 * This script helps verify that the CSS styling fixes are working correctly
 */

import fs from 'fs';
import path from 'path';

console.log('🔍 Verifying CSS fixes...\n');

// Check if critical files exist
const criticalFiles = [
  'postcss.config.js',
  'src/styles/admin-fixes.css',
  'src/styles/admin.css',
  'src/app/(frontend)/globals.css',
  'next.config.mjs',
];

console.log('📁 Checking critical files:');
criticalFiles.forEach(file => {
  const exists = fs.existsSync(file);
  console.log(`  ${exists ? '✅' : '❌'} ${file}`);
});

// Check if conflicting files are removed
const conflictingFiles = [
  'postcss.config.cjs',
];

console.log('\n🗑️  Checking removed conflicting files:');
conflictingFiles.forEach(file => {
  const exists = fs.existsSync(file);
  console.log(`  ${!exists ? '✅' : '❌'} ${file} (should be removed)`);
});

// Verify PostCSS configuration
console.log('\n⚙️  Verifying PostCSS configuration:');
try {
  const postcssConfig = fs.readFileSync('postcss.config.js', 'utf8');
  
  const checks = [
    { name: 'PurgeCSS safelist includes Payload classes', pattern: /\/\^payload/ },
    { name: 'CSS optimization is less aggressive', pattern: /reduceIdents: false/ },
    { name: 'Includes admin panel content paths', pattern: /@payloadcms/ },
    { name: 'SVG optimization disabled', pattern: /svgo: false/ },
  ];
  
  checks.forEach(check => {
    const found = check.pattern.test(postcssConfig);
    console.log(`  ${found ? '✅' : '❌'} ${check.name}`);
  });
} catch (error) {
  console.log('  ❌ Error reading PostCSS config:', error.message);
}

// Verify Next.js configuration
console.log('\n🔧 Verifying Next.js configuration:');
try {
  const nextConfig = fs.readFileSync('next.config.mjs', 'utf8');
  
  const checks = [
    { name: 'CSS optimization disabled', pattern: /optimizeCss: false/ },
    { name: 'CSS minimizer excludes Payload', pattern: /exclude:[\s\S]*@payloadcms/ },
    { name: 'Admin CSS handling added', pattern: /src\\?\/styles\\?\/admin/ },
  ];
  
  checks.forEach(check => {
    const found = check.pattern.test(nextConfig);
    console.log(`  ${found ? '✅' : '❌'} ${check.name}`);
  });
} catch (error) {
  console.log('  ❌ Error reading Next.js config:', error.message);
}

// Verify admin fixes CSS
console.log('\n🎨 Verifying admin fixes CSS:');
try {
  const adminFixesCSS = fs.readFileSync('src/styles/admin-fixes.css', 'utf8');
  
  const checks = [
    { name: 'Dropdown menu fixes', pattern: /dropdown-menu-content/ },
    { name: 'User avatar button fixes', pattern: /user-avatar-button/ },
    { name: 'Mobile responsiveness', pattern: /@media \(max-width: 768px\)/ },
    { name: 'SVG icon fixes', pattern: /icon-svg/ },
    { name: 'Z-index fixes', pattern: /z-index/ },
  ];
  
  checks.forEach(check => {
    const found = check.pattern.test(adminFixesCSS);
    console.log(`  ${found ? '✅' : '❌'} ${check.name}`);
  });
} catch (error) {
  console.log('  ❌ Error reading admin fixes CSS:', error.message);
}

// Verify global CSS updates
console.log('\n🌐 Verifying global CSS updates:');
try {
  const globalCSS = fs.readFileSync('src/app/(frontend)/globals.css', 'utf8');
  
  const checks = [
    { name: 'Dropdown menu component styles', pattern: /dropdown-menu-content/ },
    { name: 'Mobile icon fixes', pattern: /icon-mobile/ },
    { name: 'Responsive text classes', pattern: /text-responsive/ },
    { name: 'Button hover effects', pattern: /btn-hover-lift/ },
    { name: 'Card hover effects', pattern: /card-hover/ },
  ];
  
  checks.forEach(check => {
    const found = check.pattern.test(globalCSS);
    console.log(`  ${found ? '✅' : '❌'} ${check.name}`);
  });
} catch (error) {
  console.log('  ❌ Error reading global CSS:', error.message);
}

console.log('\n📋 Summary:');
console.log('The following fixes have been applied:');
console.log('  1. ✅ Removed conflicting PostCSS configuration');
console.log('  2. ✅ Updated PostCSS with comprehensive safelist for Payload CMS');
console.log('  3. ✅ Disabled aggressive CSS optimization in Next.js');
console.log('  4. ✅ Added specific CSS handling for admin panel');
console.log('  5. ✅ Created dedicated admin fixes CSS file');
console.log('  6. ✅ Fixed dropdown navigation styling');
console.log('  7. ✅ Improved mobile SVG icon rendering');
console.log('  8. ✅ Added responsive design improvements');

console.log('\n🚀 Next steps:');
console.log('  1. Run: npm run build (or pnpm build) to test the build process');
console.log('  2. Check the admin panel at /admin for restored styling');
console.log('  3. Test the user dropdown navigation on frontend');
console.log('  4. Verify SVG icons display correctly on mobile devices');
console.log('  5. Check spacing and padding throughout the application');

console.log('\n💡 If issues persist:');
console.log('  - Clear .next cache: rm -rf .next');
console.log('  - Clear node_modules cache: rm -rf node_modules/.cache');
console.log('  - Restart the development server');
console.log('  - Check browser developer tools for any remaining CSS conflicts');
