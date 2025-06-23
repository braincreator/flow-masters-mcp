#!/bin/bash

# FlowMasters AI Agents - Dependencies Installation
# Generated with AI assistance for rapid development

echo "🚀 Installing FlowMasters AI Agents dependencies..."

# Navigate to project directory
cd /Users/braincreator/Projects/flow-masters/flow-masters

# Install AI and agent dependencies
echo "📦 Installing AI SDK and OpenAI..."
npm install openai @ai-sdk/openai ai

echo "📦 Installing vector database clients..."
npm install @qdrant/js-client-rest

echo "📦 Installing utility libraries..."
npm install uuid
npm install -D @types/uuid

echo "📦 Installing UI components..."
npm install lucide-react class-variance-authority clsx tailwind-merge

echo "📦 Installing development dependencies..."
npm install -D eslint-plugin-ai-generated

echo "✅ All dependencies installed successfully!"

echo "🔧 Next steps:"
echo "1. Add environment variables to .env.local"
echo "2. Update navigation to include agents"
echo "3. Test the agents in development mode"
echo "4. Deploy to production"

echo ""
echo "🌟 FlowMasters AI Agents are ready to use!"
echo "Visit: http://localhost:3000/agents"