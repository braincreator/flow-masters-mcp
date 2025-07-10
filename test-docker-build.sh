#!/bin/bash

# Test script to verify Docker build readiness
# This script checks if all required files are present and properly configured

echo "🐳 Testing Docker Build Readiness..."
echo "=================================="

# Check if required files exist
echo "📁 Checking required files..."

files_to_check=(
    "Dockerfile"
    "package.json"
    "pnpm-lock.yaml"
    "tsconfig.json"
    "src/index.ts"
    "src/stdio.ts"
    "config.sample.json"
    ".dockerignore"
)

missing_files=()
for file in "${files_to_check[@]}"; do
    if [[ -f "$file" ]]; then
        echo "✅ $file exists"
    else
        echo "❌ $file missing"
        missing_files+=("$file")
    fi
done

if [[ ${#missing_files[@]} -gt 0 ]]; then
    echo ""
    echo "❌ Missing files detected:"
    for file in "${missing_files[@]}"; do
        echo "   - $file"
    done
    exit 1
fi

echo ""
echo "📦 Checking package.json dependencies..."

# Check if package.json has required scripts
if grep -q '"build"' package.json; then
    echo "✅ Build script found"
else
    echo "❌ Build script missing"
    exit 1
fi

if grep -q '"dev"' package.json; then
    echo "✅ Dev script found"
else
    echo "❌ Dev script missing"
    exit 1
fi

echo ""
echo "🔒 Checking pnpm-lock.yaml consistency..."

# Check if pnpm-lock.yaml is consistent with package.json
if pnpm install --frozen-lockfile > /dev/null 2>&1; then
    echo "✅ pnpm-lock.yaml is consistent with package.json"
else
    echo "❌ pnpm-lock.yaml is inconsistent with package.json"
    echo "   Run 'pnpm install' to fix this"
    exit 1
fi

echo ""
echo "🏗️  Testing build process..."

# Test if the build process works
if pnpm run build > /dev/null 2>&1; then
    echo "✅ Build process successful"
else
    echo "❌ Build process failed"
    echo "   Check TypeScript compilation errors"
    exit 1
fi

echo ""
echo "📋 Checking Dockerfile syntax..."

# Basic Dockerfile syntax checks
if grep -q "FROM node:" Dockerfile; then
    echo "✅ Base image specified"
else
    echo "❌ No Node.js base image found"
    exit 1
fi

if grep -q "pnpm install" Dockerfile; then
    echo "✅ pnpm commands found in Dockerfile"
else
    echo "❌ npm commands found instead of pnpm"
    exit 1
fi

if grep -q "EXPOSE 3030" Dockerfile; then
    echo "✅ Port 3030 exposed"
else
    echo "❌ Port 3030 not exposed"
    exit 1
fi

echo ""
echo "🎉 Docker Build Readiness Test Results:"
echo "======================================"
echo "✅ All required files present"
echo "✅ Package configuration valid"
echo "✅ Dependencies consistent"
echo "✅ Build process working"
echo "✅ Dockerfile properly configured"
echo ""
echo "🚀 Ready for Docker build!"
echo ""
echo "To build the Docker image, run:"
echo "  docker build -t flow-masters-mcp ."
echo ""
echo "To run in development mode:"
echo "  docker build --target development -t flow-masters-mcp:dev ."
echo "  docker run -p 3030:3030 flow-masters-mcp:dev"
echo ""
echo "To run in production mode:"
echo "  docker build --target production -t flow-masters-mcp:prod ."
echo "  docker run -p 3030:3030 -e API_KEY=your-key flow-masters-mcp:prod"
