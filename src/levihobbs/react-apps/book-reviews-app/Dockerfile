# Build stage
FROM python:3.10-slim AS builder

# Install Docker CLI inside the container (already in base image, but keeping for clarity)
RUN apt-get update && apt-get install -y \
    docker.io \
    && rm -rf /var/lib/apt/lists/*

# Install Node.js and npm
RUN apt-get update && apt-get install -y \
    curl \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Set environment for Docker build
ENV DOCKER_BUILD=true

# Build the application
RUN npm run build

# Production stage with Node.js for running tests
FROM python:3.10-slim AS production

# Install Docker CLI inside the container (already in base image, but keeping for clarity)
RUN apt-get update && apt-get install -y \
    docker.io \
    && rm -rf /var/lib/apt/lists/*

# Install Node.js and npm
RUN apt-get update && apt-get install -y \
    curl \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

# Install nginx
RUN apt-get update && apt-get install -y \
    nginx \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files and install dependencies for running tests
COPY package*.json ./
RUN npm ci --only=production

# Copy source code for running tests
COPY . .

# Copy built files from builder stage
COPY --from=builder /app/dist ./dist

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Copy test scripts to root for validation tool
COPY run_tests.sh /run_tests.sh
COPY run_tests.sh /app/run_tests.sh
COPY run_tests.sh ./run_tests.sh

# Make scripts executable
RUN chmod +x /run_tests.sh /app/run_tests.sh ./run_tests.sh

# Expose port 80
EXPOSE 80

# Default command starts nginx
CMD ["nginx", "-g", "daemon off;"] 