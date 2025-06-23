#!/bin/bash
IMAGE_NAME="book-reviews-app"
docker build -f Dockerfile.dev -t $IMAGE_NAME . 