#!/bin/bash
DOCKER_TAG=${1:-book-reviews-app}
DOCKER_DEFAULT_PLATFORM=${2:-linux/amd64}

docker build --platform $DOCKER_DEFAULT_PLATFORM -f Dockerfile.dev -t $DOCKER_TAG . 