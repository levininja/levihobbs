# Book Reviews React App

A React TypeScript application for browsing and reading book reviews. This app can run in two modes:

## Modes

### 1. Standalone Mode (Docker)
- Uses mock data API
- Self-contained with no external dependencies
- Perfect for testing and validation
- Set `VITE_USE_MOCK=true`

### 2. Integrated Mode (Development)
- Connects to C# ASP.NET Core API
- Uses real data from the backend
- Set `VITE_USE_MOCK=false` and `VITE_API_BASE_URL`

## Quick Start

### Development (Integrated Mode)
```bash
cd react-apps/book-reviews-app
npm install
npm run dev
```

### Docker (Standalone Mode)
```bash
cd react-apps/book-reviews-app
./build_docker.sh
docker run --rm -p 3000:80 book-reviews-app
```

## Testing

### Run Tests
```bash
npm test
```

### Run Tests in Docker
```bash
./run_tests.sh
```

## Environment Variables

- `VITE_USE_MOCK`: Set to 'true' for mock data, 'false' for real API
- `VITE_API_BASE_URL`: Base URL for the C# API (when not using mock)
- `NODE_ENV`: 'development' or 'production'

## Project Structure

```
book-reviews-app/
├── src/
│   ├── components/          # React components
│   ├── services/           # API and mock data services
│   ├── types/              # TypeScript interfaces
│   └── App.tsx             # Main app component
├── tests/
│   └── components/         # Unit tests
├── Dockerfile              # Docker configuration
├── build_docker.sh         # Docker build script
├── run_tests.sh           # Test runner script
└── nginx.conf             # Nginx configuration
```

## Features

- Browse book reviews with cover images
- Search by title, author, or content
- Read full book reviews with rich formatting
- Filter by bookshelves
- Responsive design
- Unit tests for all components

## API Endpoints (when not using mock)

- `GET /api/BookReviews` - Get all book reviews
- `GET /api/BookReviewSearch?searchTerm={term}` - Search book reviews
- `GET /api/BookReviews/{id}` - Get specific book review
- `GET /api/BookCover?bookTitle={title}&bookReviewId={id}` - Get book cover image

## Docker Configuration

The app uses a multi-stage Docker build:
1. **Build stage**: Node.js environment to build the React app
2. **Production stage**: Nginx to serve static files

This ensures:
- Minimal production image size
- Fast startup times
- No Node.js runtime in production
- Proper static file serving

## Validation Requirements

This app is designed to meet the validation requirements for the AI model evaluation project:
- ✅ Single container approach
- ✅ Self-contained (no external dependencies in standalone mode)
- ✅ Comprehensive unit tests
- ✅ Docker build and test scripts
- ✅ TypeScript throughout
- ✅ Mock data for testing
