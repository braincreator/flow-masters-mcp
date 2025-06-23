#!/bin/bash

# Stop any running containers
echo "Stopping any running containers..."
docker-compose down

# Start the containers in detached mode
echo "Starting MongoDB and Flow Masters app..."
docker-compose up -d

# Wait for MongoDB to be ready
echo "Waiting for MongoDB to be ready..."
sleep 10

# Show the running containers
echo "Running containers:"
docker-compose ps

echo "Docker environment is ready!"
echo "Access your application at: http://localhost:3000"
