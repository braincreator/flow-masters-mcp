#!/bin/bash

# Set variables
IMAGE_NAME="flow-masters-mcp"
CONTAINER_NAME="flow-masters-mcp"
PORT=3030

# Check if the container is already running
if [ "$(docker ps -q -f name=$CONTAINER_NAME)" ]; then
    echo "Container $CONTAINER_NAME is already running."
    echo "To stop it, run: docker stop $CONTAINER_NAME"
    echo "To view logs, run: docker logs $CONTAINER_NAME"
    exit 0
fi

# Check if the container exists but is stopped
if [ "$(docker ps -aq -f name=$CONTAINER_NAME)" ]; then
    echo "Container $CONTAINER_NAME exists but is not running."
    echo "Starting container..."
    docker start $CONTAINER_NAME
    echo "Container started! Access the MCP server at http://localhost:$PORT"
    exit 0
fi

# Get the Payload secret
echo "Enter your Payload secret (press Enter to use default):"
read PAYLOAD_SECRET
PAYLOAD_SECRET=${PAYLOAD_SECRET:-08c93b8544167b018efded89}

# Get the API URL
echo "Enter your Payload API URL (press Enter to use http://host.docker.internal:3000):"
read API_URL
API_URL=${API_URL:-http://host.docker.internal:3000}

# Run the container
echo "Running MCP server in Docker..."
docker run -d \
    --name $CONTAINER_NAME \
    -p $PORT:3030 \
    -e API_URL=$API_URL \
    -e API_KEY=$PAYLOAD_SECRET \
    -v mcp_data:/app/data \
    --restart unless-stopped \
    --add-host=host.docker.internal:host-gateway \
    $IMAGE_NAME:latest

echo "MCP server is now running in Docker!"
echo "Access the server at http://localhost:$PORT"
echo "To stop it, run: docker stop $CONTAINER_NAME"
echo "To view logs, run: docker logs $CONTAINER_NAME"
