#!/bin/bash

# FlowMasters AI Agents - Complete Vertex AI Setup
# Generated with AI assistance for rapid development

echo "🌟 Complete FlowMasters Vertex AI Setup"
echo "======================================="

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m'

print_status() { echo -e "${GREEN}✅ $1${NC}"; }
print_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
print_vertex() { echo -e "${PURPLE}🌟 $1${NC}"; }

# Step 1: Install dependencies
print_vertex "Installing Vertex AI dependencies..."
npm install @google-cloud/aiplatform google-auth-library @ai-sdk/google @google-cloud/storage @google-cloud/translate uuid lucide-react class-variance-authority clsx tailwind-merge
npm install -D @types/uuid

print_status "Dependencies installed!"

# Step 2: Test connection
print_vertex "Testing Vertex AI connection..."
if node test-vertex-ai-connection.js; then
    print_status "Vertex AI connection successful!"
else
    echo "❌ Connection test failed. Please check your setup."
    exit 1
fi

# Step 3: Build project
print_vertex "Building project..."
if npm run build; then
    print_status "Build successful!"
else
    echo "❌ Build failed. Please check for errors."
    exit 1
fi

# Step 4: Final message
echo ""
print_vertex "🎉 FlowMasters Vertex AI Setup Complete!"
echo "========================================"
echo ""
print_status "✅ Google Cloud configured (ancient-figure-462211-t6)"
print_status "✅ Service Account ready (flowmasters@ancient-figure-462211-t6.iam.gserviceaccount.com)"
print_status "✅ Vertex AI dependencies installed"
print_status "✅ Connection tested successfully"
print_status "✅ Project built successfully"
echo ""
print_info "To start FlowMasters with Vertex AI:"
echo "   ./start-with-vertex-ai.sh"
echo ""
print_info "Available AI Agents:"
echo "🤖 Assistant: http://localhost:3000/agents/assistant"
echo "📚 Search: http://localhost:3000/agents/search"
echo "🔄 Automation: http://localhost:3000/agents/automation"
echo "👁️  Multimodal: http://localhost:3000/agents/multimodal"
echo ""
print_vertex "🌟 Powered by Google Vertex AI & Gemini Pro!"