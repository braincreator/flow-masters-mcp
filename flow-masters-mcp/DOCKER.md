# Flow Masters MCP Docker Guide

This guide explains how to run the Flow Masters MCP (Model Context Protocol) server using Docker.

## Quick Start

The easiest way to run the MCP server is using Docker Desktop:

1. Build the Docker image:
   ```bash
   chmod +x build-docker-image.sh
   ./build-docker-image.sh
   ```

2. Run the MCP server:
   ```bash
   docker run -p 3030:3030 -e API_URL=http://host.docker.internal:3000 -e API_KEY=your-payload-secret flow-masters-mcp:latest
   ```

3. Access the MCP server at http://localhost:3030

## Using Docker Compose

You can also use Docker Compose to run the MCP server:

1. Navigate to the flow-masters-mcp directory:
   ```bash
   cd flow-masters-mcp
   ```

2. Run the MCP server using Docker Compose:
   ```bash
   docker-compose -f docker-compose.standalone.yml up -d
   ```

3. Access the MCP server at http://localhost:3030

## Configuration

You can configure the MCP server using environment variables:

| Environment Variable | Description | Default Value |
|----------------------|-------------|---------------|
| PORT | The port on which the MCP server will listen | 3030 |
| HOST | The host address to bind to | 0.0.0.0 |
| API_URL | The URL of your Payload CMS API | http://host.docker.internal:3000 |
| API_KEY | Your Payload secret key | 08c93b8544167b018efded89 |
| AUTO_UPDATE | Whether to automatically check for API updates | true |
| UPDATE_CHECK_INTERVAL | How often to check for updates (in minutes) | 60 |
| API_BASE_PATH | The base path for API endpoints | /api |
| API_VERSION | The API version to use | v1 |
| MODEL_CONTEXT_ENABLED | Whether to enable LLM context generation | true |
| ALLOWED_MODELS | Which LLM models are allowed (comma-separated) | * |
| MAX_TOKENS | Maximum number of tokens for LLM responses | 8192 |
| CONTEXT_WINDOW | Size of the context window for LLM requests | 4096 |
| CACHE_ENABLED | Whether caching is enabled | true |
| CACHE_TTL | Time-to-live for cached responses (in seconds) | 3600 |

Example:
```bash
docker run -p 3030:3030 \
  -e API_URL=https://your-api-url.com \
  -e API_KEY=your-secret-key \
  -e MODEL_CONTEXT_ENABLED=true \
  -e ALLOWED_MODELS=gpt-4,gpt-3.5-turbo \
  flow-masters-mcp:latest
```

## Persistent Data

The MCP server stores data in the `/app/data` directory inside the container. To persist this data, you can mount a volume:

```bash
docker run -p 3030:3030 \
  -v mcp_data:/app/data \
  flow-masters-mcp:latest
```

## Connecting to Your Application

When running in Docker, the MCP server needs to connect to your Payload CMS API. By default, it uses `host.docker.internal` to connect to services running on your host machine.

If your Payload CMS API is running in a different Docker container or on a different machine, you'll need to update the `API_URL` environment variable accordingly.

## Pushing to Docker Hub

To push the MCP server image to Docker Hub:

```bash
./build-docker-image.sh --push your-docker-hub-username
```

This will build the image, tag it with your Docker Hub username, and push it to Docker Hub.

## Troubleshooting

If you encounter issues:

1. **Connection Problems**: Make sure your Payload CMS API is running and accessible from the Docker container
2. **Authentication Issues**: Verify that you're using the correct Payload secret key
3. **Port Conflicts**: If port 3030 is already in use, you can map to a different port:
   ```bash
   docker run -p 8080:3030 flow-masters-mcp:latest
   ```
4. **Logs**: Check the Docker logs for more information:
   ```bash
   docker logs flow-masters-mcp
   ```
