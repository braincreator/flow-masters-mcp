#!/bin/bash

# Set variables
IMAGE_NAME="flow-masters-mcp"
IMAGE_TAG="latest"

# Navigate to the project root directory
cd "$(dirname "$0")/.."

# Build the Docker image
echo "Building Docker image: $IMAGE_NAME:$IMAGE_TAG"
docker build -t $IMAGE_NAME:$IMAGE_TAG -f flow-masters-mcp/Dockerfile.standalone .

echo "Docker image built successfully!"
echo "You can now run the MCP server with:"
echo "docker run -p 3030:3030 -e API_URL=http://host.docker.internal:3000 -e API_KEY=your-payload-secret $IMAGE_NAME:$IMAGE_TAG"

# Optional: Push to Docker Hub
if [ "$1" == "--push" ]; then
  DOCKER_HUB_USERNAME=$2
  
  if [ -z "$DOCKER_HUB_USERNAME" ]; then
    echo "Please provide your Docker Hub username: docker-hub-username"
    read DOCKER_HUB_USERNAME
  fi
  
  # Tag the image for Docker Hub
  DOCKER_HUB_IMAGE="$DOCKER_HUB_USERNAME/$IMAGE_NAME:$IMAGE_TAG"
  docker tag $IMAGE_NAME:$IMAGE_TAG $DOCKER_HUB_IMAGE
  
  # Push to Docker Hub
  echo "Pushing image to Docker Hub: $DOCKER_HUB_IMAGE"
  docker push $DOCKER_HUB_IMAGE
  
  echo "Image pushed to Docker Hub successfully!"
fi
