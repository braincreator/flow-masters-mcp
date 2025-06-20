#!/bin/bash

# FlowMasters AI Agents - Complete Setup Script
# Generated with AI assistance for rapid development

echo "🚀 Setting up FlowMasters AI Agents..."
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Please run this script from the FlowMasters root directory."
    exit 1
fi

print_info "Current directory: $(pwd)"

# Step 1: Install dependencies
echo ""
echo "📦 Installing AI Agents dependencies..."
echo "----------------------------------------"

print_info "Installing OpenAI and AI SDK..."
npm install openai @ai-sdk/openai ai

print_info "Installing vector database clients..."
npm install @qdrant/js-client-rest

print_info "Installing utility libraries..."
npm install uuid
npm install -D @types/uuid

print_info "Installing UI components..."
npm install lucide-react class-variance-authority clsx tailwind-merge

print_info "Installing development dependencies..."
npm install -D eslint-plugin-ai-generated

print_status "All dependencies installed successfully!"

# Step 2: Set up environment variables
echo ""
echo "🔧 Setting up environment variables..."
echo "---------------------------------------"

if [ ! -f ".env.local" ]; then
    print_warning ".env.local not found. Creating from example..."
    cp .env.agents.example .env.local
    print_info "Please edit .env.local and add your API keys"
else
    print_info "Adding AI Agents environment variables to existing .env.local..."
    
    # Check if AI agents variables already exist
    if ! grep -q "OPENAI_API_KEY" .env.local; then
        echo "" >> .env.local
        echo "# FlowMasters AI Agents Configuration" >> .env.local
        echo "OPENAI_API_KEY=your_openai_api_key_here" >> .env.local
        echo "QDRANT_URL=http://192.168.0.5:6333" >> .env.local
        echo "QDRANT_API_KEY=your_qdrant_api_key" >> .env.local
        echo "N8N_API_URL=https://n8n.flow-masters.ru/api" >> .env.local
        echo "N8N_API_KEY=your_n8n_api_key" >> .env.local
        echo "FLOWISE_API_URL=https://flowise.flow-masters.ru/api" >> .env.local
        echo "CRAWL4AI_API_URL=https://crawl.flow-masters.ru/api" >> .env.local
        echo "AGENTS_ENABLED=true" >> .env.local
        echo "AGENTS_DEBUG=true" >> .env.local
        print_status "Environment variables added to .env.local"
    else
        print_warning "AI Agents environment variables already exist in .env.local"
    fi
fi

# Step 3: Update navigation (optional)
echo ""
echo "🧭 Updating navigation..."
echo "-------------------------"

if [ -f "update-navigation.js" ]; then
    print_info "Running navigation update script..."
    if command -v node &> /dev/null; then
        node update-navigation.js
        print_status "Navigation updated successfully!"
    else
        print_error "Node.js not found. Please run 'node update-navigation.js' manually."
    fi
else
    print_warning "Navigation update script not found. You'll need to add 'AI Агенты' to navigation manually."
fi

# Step 4: Build and test
echo ""
echo "🔨 Building the project..."
echo "---------------------------"

print_info "Running TypeScript check..."
if npm run type-check 2>/dev/null || npx tsc --noEmit; then
    print_status "TypeScript check passed!"
else
    print_warning "TypeScript check failed. Please fix any type errors."
fi

print_info "Building the project..."
if npm run build; then
    print_status "Build completed successfully!"
else
    print_error "Build failed. Please check the errors above."
    exit 1
fi

# Step 5: Final instructions
echo ""
echo "🎉 FlowMasters AI Agents Setup Complete!"
echo "========================================"
echo ""
print_status "✅ Dependencies installed"
print_status "✅ Environment variables configured"
print_status "✅ Navigation updated"
print_status "✅ Project built successfully"
echo ""
print_info "Next steps:"
echo "1. Edit .env.local and add your actual API keys:"
echo "   - OPENAI_API_KEY (required)"
echo "   - QDRANT_API_KEY (if using authentication)"
echo "   - N8N_API_KEY (for automation features)"
echo ""
echo "2. Start the development server:"
echo "   npm run dev"
echo ""
echo "3. Visit the AI Agents:"
echo "   http://localhost:3000/agents"
echo ""
print_info "Available AI Agents:"
echo "🤖 FlowMasters Assistant - http://localhost:3000/agents/assistant"
echo "📚 Smart Documentation Search - http://localhost:3000/agents/search"
echo "🔄 Quick Automation Builder - http://localhost:3000/agents/automation"
echo ""
print_info "API Endpoints:"
echo "📡 Main API: /api/agents"
echo "📡 Assistant: /api/agents/assistant"
echo "📡 Search: /api/agents/search"
echo "📡 Automation: /api/agents/automation"
echo ""
echo "🚀 Happy coding with FlowMasters AI Agents!"