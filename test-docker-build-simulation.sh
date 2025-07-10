#!/bin/bash

# Simulate Docker build environment to test if the build would work
echo "🐳 Simulating Docker Build Environment..."
echo "========================================"

# Create a temporary directory to simulate Docker build context
TEMP_DIR=$(mktemp -d)
echo "📁 Created temporary build context: $TEMP_DIR"

# Copy files that would be included in Docker build context (respecting .dockerignore)
echo "📋 Copying files to build context..."

# Copy package files
cp package.json "$TEMP_DIR/"
cp pnpm-lock.yaml "$TEMP_DIR/"

# Copy TypeScript config (now that it's not in .dockerignore)
cp tsconfig.json "$TEMP_DIR/"

# Copy source code
cp -r src "$TEMP_DIR/"

# Copy config sample
cp config.sample.json "$TEMP_DIR/"

# Change to temp directory
cd "$TEMP_DIR"

echo "📦 Files in build context:"
ls -la

echo ""
echo "🔍 Checking tsconfig.json presence:"
if [ -f "tsconfig.json" ]; then
    echo "✅ tsconfig.json found"
    cat tsconfig.json
else
    echo "❌ tsconfig.json missing"
    exit 1
fi

echo ""
echo "📂 Source files:"
ls -la src/

echo ""
echo "🏗️  Installing dependencies..."
if command -v pnpm &> /dev/null; then
    pnpm install --frozen-lockfile
else
    echo "⚠️  pnpm not available, using npm"
    npm ci
fi

echo ""
echo "🔨 Testing build process..."
if command -v pnpm &> /dev/null; then
    pnpm run build
else
    npm run build
fi

BUILD_EXIT_CODE=$?

echo ""
echo "📋 Build results:"
if [ $BUILD_EXIT_CODE -eq 0 ]; then
    echo "✅ Build successful"
    echo "📁 Generated files:"
    ls -la dist/
    
    echo ""
    echo "🧪 Testing generated files:"
    if [ -f "dist/index.js" ]; then
        echo "✅ dist/index.js created"
    else
        echo "❌ dist/index.js missing"
    fi
    
    if [ -f "dist/stdio.js" ]; then
        echo "✅ dist/stdio.js created"
    else
        echo "❌ dist/stdio.js missing"
    fi
    
    echo ""
    echo "🎉 Docker build simulation successful!"
    echo "The Docker build should now work correctly."
else
    echo "❌ Build failed with exit code $BUILD_EXIT_CODE"
    echo "Docker build will fail until this is resolved."
fi

# Cleanup
cd - > /dev/null
rm -rf "$TEMP_DIR"
echo "🧹 Cleaned up temporary directory"

exit $BUILD_EXIT_CODE
