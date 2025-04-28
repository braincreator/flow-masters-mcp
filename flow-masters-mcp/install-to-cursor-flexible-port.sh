#!/bin/bash

# Set variables
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CURSOR_DIR="$HOME/.cursor"
EXTENSIONS_DIR="$CURSOR_DIR/extensions"
MCP_DIR="$EXTENSIONS_DIR/flow-masters-mcp"

# Default port
DEFAULT_PORT=3030
# Ask for port if not specified
if [ -z "$1" ]; then
    # Check if default port is in use
    if lsof -Pi :$DEFAULT_PORT -sTCP:LISTEN -t >/dev/null ; then
        echo "Port $DEFAULT_PORT is already in use."
        echo "Please enter an alternative port number (e.g., 3031, 3032, etc.):"
        read PORT
    else
        PORT=$DEFAULT_PORT
    fi
else
    PORT=$1
fi

echo "Installing Flow Masters MCP to Cursor (using port $PORT)..."
echo "Script directory: $SCRIPT_DIR"
echo "Target directory: $MCP_DIR"

# Create directories if they don't exist
mkdir -p "$MCP_DIR"
echo "Created directory: $MCP_DIR"

# Create docker-compose.yml file
echo "Creating docker-compose.yml file..."
cat > "$MCP_DIR/docker-compose.yml" << EOL
version: '3.8'

services:
  mcp:
    image: flow-masters-mcp:latest
    container_name: cursor-flow-masters-mcp
    ports:
      - '$PORT:3030'
    environment:
      - PORT=3030
      - HOST=0.0.0.0
      - API_URL=http://host.docker.internal:3000
      - API_KEY=\${PAYLOAD_SECRET:-08c93b8544167b018efded89}
      - AUTO_UPDATE=true
      - UPDATE_CHECK_INTERVAL=60
      - API_BASE_PATH=/api
      - API_VERSION=v1
      - MODEL_CONTEXT_ENABLED=true
      - ALLOWED_MODELS=*
      - MAX_TOKENS=8192
      - CONTEXT_WINDOW=4096
      - CACHE_ENABLED=true
      - CACHE_TTL=3600
    volumes:
      - cursor_mcp_data:/app/data
    restart: always
    extra_hosts:
      - "host.docker.internal:host-gateway"

volumes:
  cursor_mcp_data:
    driver: local
EOL

# Create config.json file
echo "Creating config.json file..."
cat > "$MCP_DIR/config.json" << 'EOL'
{
  "port": 3030,
  "host": "0.0.0.0",
  "apiConfig": {
    "apiUrl": "http://host.docker.internal:3000",
    "apiKey": "08c93b8544167b018efded89",
    "autoUpdate": true,
    "updateCheckInterval": 60,
    "basePath": "/api",
    "apiVersion": "v1"
  },
  "llm": {
    "modelContextEnabled": true,
    "allowedModels": ["*"],
    "maxTokens": 8192,
    "contextWindow": 4096,
    "caching": {
      "enabled": true,
      "ttl": 3600
    }
  }
}
EOL

# Create start script
echo "Creating start-mcp.sh script..."
cat > "$MCP_DIR/start-mcp.sh" << EOL
#!/bin/bash

# Navigate to the MCP directory
cd "\$(dirname "\$0")"

# Default port
DEFAULT_PORT=$PORT
# Ask for port if not specified
if [ -z "\$1" ]; then
    # Check if default port is in use
    if lsof -Pi :\$DEFAULT_PORT -sTCP:LISTEN -t >/dev/null ; then
        echo "Port \$DEFAULT_PORT is already in use."
        echo "Please enter an alternative port number (e.g., 3031, 3032, etc.):"
        read PORT
    else
        PORT=\$DEFAULT_PORT
    fi
else
    PORT=\$1
fi

# Update docker-compose.yml with the new port
sed -i.bak "s/- '[0-9]*:3030'/- '\$PORT:3030'/g" docker-compose.yml

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "Docker is not running. Please start Docker Desktop and try again."
    exit 1
fi

# Check if the MCP image exists
if ! docker image inspect flow-masters-mcp:latest > /dev/null 2>&1; then
    echo "MCP image not found. Building it now..."
    
    # Create a temporary Dockerfile
    cat > Dockerfile.temp << 'DOCKERFILE'
FROM node:20-alpine

# Create app directory
WORKDIR /app

# Create package.json
RUN echo '{"name":"flow-masters-mcp","version":"2.0.0","scripts":{"start":"node index.js"}}' > package.json

# Create a simple MCP server
RUN mkdir -p /app/data
RUN echo 'const http = require("http"); \
const fs = require("fs"); \
const path = require("path"); \
const config = require("./config.json"); \
const server = http.createServer((req, res) => { \
  res.setHeader("Content-Type", "application/json"); \
  res.setHeader("Access-Control-Allow-Origin", "*"); \
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS"); \
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization"); \
  if (req.method === "OPTIONS") { res.statusCode = 200; res.end(); return; } \
  const url = new URL(req.url, `http://\${req.headers.host}`); \
  const pathname = url.pathname; \
  if (pathname === "/") { \
    res.statusCode = 200; \
    res.end(JSON.stringify({ \
      name: "Flow Masters MCP Server", \
      description: "Model Context Protocol server for Flow Masters API", \
      version: "2.0.0", \
      endpoints: ["/mcp/health", "/mcp/version", "/mcp/endpoints"] \
    })); \
  } else if (pathname === "/mcp/health") { \
    res.statusCode = 200; \
    res.end(JSON.stringify({ success: true, version: "2.0.0", message: "MCP server is running" })); \
  } else if (pathname === "/mcp/endpoints") { \
    res.statusCode = 200; \
    res.end(JSON.stringify({ \
      success: true, \
      endpoints: [ \
        { path: "/api/users", method: "GET", description: "Get users" }, \
        { path: "/api/products", method: "GET", description: "Get products" } \
      ] \
    })); \
  } else { \
    res.statusCode = 404; \
    res.end(JSON.stringify({ success: false, error: "Not found" })); \
  } \
}); \
server.listen(process.env.PORT || 3030, process.env.HOST || "0.0.0.0", () => { \
  console.log(`MCP server running at http://\${process.env.HOST || "0.0.0.0"}:\${process.env.PORT || 3030}`); \
});' > index.js

# Copy config file
COPY config.json /app/config.json

# Environment variables
ENV PORT=3030 \
    HOST=0.0.0.0 \
    API_URL=http://host.docker.internal:3000 \
    API_KEY=08c93b8544167b018efded89

# Expose port
EXPOSE 3030

# Start the server
CMD ["node", "index.js"]
DOCKERFILE

    # Build the image
    docker build -t flow-masters-mcp:latest -f Dockerfile.temp .
    rm Dockerfile.temp
    
    echo "MCP image built successfully!"
fi

# Create .env file to avoid warnings
cat > .env << 'ENV'
# MCP Configuration
PORT=3030
HOST=0.0.0.0
API_URL=http://host.docker.internal:3000
API_KEY=08c93b8544167b018efded89
AUTO_UPDATE=true
UPDATE_CHECK_INTERVAL=60
API_BASE_PATH=/api
API_VERSION=v1
MODEL_CONTEXT_ENABLED=true
ALLOWED_MODELS=*
MAX_TOKENS=8192
CONTEXT_WINDOW=4096
CACHE_ENABLED=true
CACHE_TTL=3600
ENV

# Stop any existing container
docker-compose down 2>/dev/null

# Start the MCP server
docker-compose up -d

echo "MCP server started! Access it at http://localhost:\$PORT"
EOL

# Create stop script
echo "Creating stop-mcp.sh script..."
cat > "$MCP_DIR/stop-mcp.sh" << 'EOL'
#!/bin/bash

# Navigate to the MCP directory
cd "$(dirname "$0")"

# Stop the MCP server
docker-compose down

echo "MCP server stopped."
EOL

# Make scripts executable
chmod +x "$MCP_DIR/start-mcp.sh"
chmod +x "$MCP_DIR/stop-mcp.sh"

# Create README
echo "Creating README.md file..."
cat > "$MCP_DIR/README.md" << 'EOL'
# Flow Masters MCP for Cursor

This is the Flow Masters MCP (Model Context Protocol) server integration for Cursor.

## Usage

1. Start the MCP server:
   ```bash
   ./start-mcp.sh [port]
   ```
   If no port is specified, the script will use the default port (3030) or prompt for an alternative if that port is already in use.

2. Stop the MCP server:
   ```bash
   ./stop-mcp.sh
   ```

3. Access the MCP server at http://localhost:[port]

## Configuration

You can edit the `config.json` file to customize the MCP server configuration.

## Troubleshooting

If you encounter issues:

1. Make sure Docker Desktop is running
2. Check that the MCP image has been built
3. Check the Docker logs:
   ```bash
   docker logs cursor-flow-masters-mcp
   ```
4. If you get a "port is already allocated" error, try specifying a different port:
   ```bash
   ./start-mcp.sh 3031
   ```
EOL

echo "Flow Masters MCP integration installed for Cursor!"
echo "To start the MCP server, run: $MCP_DIR/start-mcp.sh [port]"
echo "If no port is specified, the script will use port $PORT or prompt for an alternative if that port is already in use."
