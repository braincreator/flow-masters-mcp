# Docker Setup for Flow Masters

This document provides instructions for running the Flow Masters application using Docker.

## Prerequisites

- Docker and Docker Compose installed on your machine
- Git repository cloned locally

## Getting Started with Docker

### 1. Start the Docker Environment

```bash
# Start the Docker containers
docker compose up -d
```

This command will:

- Start a MongoDB container
- Start the Flow Masters application container
- Start the MongoDB Express (web-based admin interface) container
- Start the Flow Masters MCP server container
- Set up the necessary network between them

### 2. Verify the Containers are Running

```bash
# Check the status of the containers
docker compose ps
```

### 3. Access the Application

Once the containers are running, you can access the application at:

- Web application: http://localhost:3000
- Admin panel: http://localhost:3000/admin
- MongoDB Express (database management): http://localhost:8081
  - Username: admin
  - Password: password
- Flow Masters MCP server: http://localhost:3030

### 4. Stop the Docker Environment

```bash
# Stop the Docker containers
docker compose down
```

## Environment Configuration

The Docker setup uses the following environment variables:

- `DATABASE_URI`: Set to `mongodb://mongodb:27017/flow-masters` to connect to the MongoDB container
- `PAYLOAD_SECRET`: Secret key for Payload CMS
- `NEXT_PUBLIC_SERVER_URL`: URL for the server

These are configured in the `.env` file and the `docker-compose.yml` file.

## MongoDB Express

MongoDB Express is a web-based MongoDB admin interface that allows you to:

- View, add, and delete databases
- Create, edit, and delete collections
- View and modify documents
- Execute MongoDB commands

To access MongoDB Express, go to http://localhost:8081 in your browser and log in with:

- Username: admin
- Password: password

## Flow Masters MCP Server

The Flow Masters MCP (Model Context Protocol) server provides integration between Flow Masters API and LLMs (Large Language Models) for automation. It offers:

- Easy integration with Flow Masters API for LLMs
- Structured context for AI models
- Webhook support for automated workflows
- Integration state monitoring

To access the MCP server, go to http://localhost:3030 in your browser.

The MCP server is configured with the following environment variables:

- `PORT`: The port the MCP server runs on (default: 3030)
- `HOST`: The host the MCP server binds to (default: 0.0.0.0)
- `API_URL`: The URL of the Flow Masters API (default: http://payload:3000)
- `API_KEY`: The API key for authentication
- `AUTO_UPDATE`: Whether to enable automatic updates (default: true)
- `UPDATE_CHECK_INTERVAL`: The interval in minutes to check for updates (default: 60)

## Troubleshooting

### MongoDB Connection Issues

If you experience MongoDB connection issues:

1. Check if the MongoDB container is running:

   ```bash
   docker compose ps
   ```

2. Check the MongoDB logs:

   ```bash
   docker compose logs mongodb
   ```

3. Ensure the `DATABASE_URI` in your `.env` file is set to `mongodb://mongodb:27017/flow-masters`

### Application Issues

If you experience issues with the application:

1. Check the application logs:

   ```bash
   docker compose logs payload
   ```

2. Restart the containers:
   ```bash
   docker compose restart
   ```

### MongoDB Express Issues

If you experience issues with MongoDB Express:

1. Check the MongoDB Express logs:

   ```bash
   docker compose logs mongo-express
   ```

2. Ensure MongoDB is running and healthy before trying to access MongoDB Express

### MCP Server Issues

If you experience issues with the Flow Masters MCP (Model Context Protocol) server:

1. Check the MCP server logs:

   ```bash
   docker compose logs mcp
   ```

2. Ensure the Flow Masters application is running before trying to access the MCP server

3. Verify the API configuration in the MCP server:

   ```bash
   docker compose exec mcp cat config.json
   ```

4. Test the MCP server's health endpoint:

   ```bash
   curl http://localhost:3030/mcp/health
   ```

5. Restart the MCP server:

   ```bash
   docker compose restart mcp
   ```

## Data Persistence

The MongoDB data is stored in a Docker volume named `mongodb_data`. This ensures that your data persists even when the containers are stopped or removed.

To remove the volume and start fresh:

```bash
docker compose down -v
```

Note: This will delete all your data, so use with caution!
