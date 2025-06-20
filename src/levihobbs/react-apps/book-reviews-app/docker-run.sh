#!/bin/bash

# Docker run script for Book Reviews React App

IMAGE_NAME="book-reviews-app"
CONTAINER_NAME="book-reviews-app-container"
PORT=3000

echo "Building Docker image..."
docker build -t $IMAGE_NAME .

if [ $? -eq 0 ]; then
    echo "Stopping existing container if running..."
    docker stop $CONTAINER_NAME 2>/dev/null || true
    docker rm $CONTAINER_NAME 2>/dev/null || true
    
    echo "Starting container..."
    docker run -d \
        --name $CONTAINER_NAME \
        -p $PORT:80 \
        --restart unless-stopped \
        $IMAGE_NAME
    
    if [ $? -eq 0 ]; then
        echo "✅ Book Reviews app is running!"
        echo "🌐 Access the app at: http://localhost:$PORT"
        echo "🔍 Health check: http://localhost:$PORT/health"
        echo ""
        echo "Container logs:"
        docker logs $CONTAINER_NAME
    else
        echo "❌ Failed to start container"
        exit 1
    fi
else
    echo "❌ Failed to build Docker image"
    exit 1
fi 