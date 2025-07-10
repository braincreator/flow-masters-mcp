#!/bin/bash

# Script to add Flow Masters MCP Server to Cursor IDE
echo "🚀 Adding Flow Masters MCP Server to Cursor IDE"
echo "==============================================="

# Detect operating system
OS="$(uname -s)"
case "${OS}" in
    Linux*)     MACHINE=Linux;;
    Darwin*)    MACHINE=Mac;;
    CYGWIN*)    MACHINE=Cygwin;;
    MINGW*)     MACHINE=MinGw;;
    *)          MACHINE="UNKNOWN:${OS}"
esac

echo "📱 Detected OS: $MACHINE"

# Set Cursor settings path based on OS
if [ "$MACHINE" = "Mac" ]; then
    CURSOR_SETTINGS_DIR="$HOME/Library/Application Support/Cursor/User/globalStorage/rooveterinaryinc.cursor-mcp"
elif [ "$MACHINE" = "Linux" ]; then
    CURSOR_SETTINGS_DIR="$HOME/.config/Cursor/User/globalStorage/rooveterinaryinc.cursor-mcp"
else
    echo "❌ Unsupported operating system: $MACHINE"
    echo "Please manually add the configuration to Cursor."
    exit 1
fi

SETTINGS_FILE="$CURSOR_SETTINGS_DIR/settings.json"

echo "📁 Cursor settings directory: $CURSOR_SETTINGS_DIR"
echo "📄 Settings file: $SETTINGS_FILE"

# Create directory if it doesn't exist
if [ ! -d "$CURSOR_SETTINGS_DIR" ]; then
    echo "📁 Creating Cursor settings directory..."
    mkdir -p "$CURSOR_SETTINGS_DIR"
fi

# Check if settings file exists
if [ -f "$SETTINGS_FILE" ]; then
    echo "📋 Existing settings file found"
    echo "🔍 Current content:"
    cat "$SETTINGS_FILE"
    echo ""
    
    # Backup existing settings
    BACKUP_FILE="${SETTINGS_FILE}.backup.$(date +%Y%m%d_%H%M%S)"
    echo "💾 Creating backup: $BACKUP_FILE"
    cp "$SETTINGS_FILE" "$BACKUP_FILE"
else
    echo "📄 No existing settings file found, creating new one"
fi

# Copy our configuration
echo "📋 Adding Flow Masters MCP configuration..."
cp cursor-mcp-config.json "$SETTINGS_FILE"

echo "✅ Configuration added successfully!"
echo ""
echo "📋 New settings content:"
cat "$SETTINGS_FILE"

echo ""
echo "🎉 Flow Masters MCP Server has been added to Cursor!"
echo ""
echo "📝 Next steps:"
echo "1. Restart Cursor IDE"
echo "2. Open a new chat or conversation"
echo "3. Test the integration by asking about Flow Masters API"
echo ""
echo "🧪 Test commands you can try:"
echo "- 'What tools are available from Flow Masters?'"
echo "- 'Check the health of the Flow Masters API'"
echo "- 'Show me the available Flow Masters API endpoints'"
echo ""
echo "🔧 If you encounter issues:"
echo "- Check that the MCP server is built: npm run build"
echo "- Verify the path in the configuration is correct"
echo "- Check Cursor's developer console for error messages"
