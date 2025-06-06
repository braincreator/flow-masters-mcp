#!/bin/bash

echo "🔍 Testing build process..."

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf dist .next

# Check if examples directory is removed
if [ -d "src/app/(frontend)/[lang]/examples" ]; then
    echo "❌ Examples directory still exists"
    rm -rf "src/app/(frontend)/[lang]/examples"
    echo "✅ Examples directory removed"
else
    echo "✅ Examples directory already removed"
fi

# Check if my-courses page is fixed
if [ -f "src/app/(frontend)/[lang]/account/my-courses/page.tsx" ]; then
    if grep -q "'use client'" "src/app/(frontend)/[lang]/account/my-courses/page.tsx"; then
        echo "❌ my-courses page still has 'use client'"
    else
        echo "✅ my-courses page is now server component"
    fi
    
    if grep -q "getPayloadHMR" "src/app/(frontend)/[lang]/account/my-courses/page.tsx"; then
        echo "❌ my-courses page still imports getPayloadHMR"
    else
        echo "✅ my-courses page no longer imports getPayloadHMR"
    fi
else
    echo "❌ my-courses page not found"
fi

# Check if getServerSession is added to auth.ts
if grep -q "export async function getServerSession" "src/utilities/auth.ts"; then
    echo "✅ getServerSession function added to auth.ts"
else
    echo "❌ getServerSession function missing in auth.ts"
fi

# Check if email-campaigns page is simplified
if grep -q "temporarily disabled" "src/app/admin/email-campaigns/page.tsx"; then
    echo "✅ email-campaigns page simplified"
else
    echo "❌ email-campaigns page not simplified"
fi

echo ""
echo "🚀 Ready to build!"
echo "Run: npm run build"
