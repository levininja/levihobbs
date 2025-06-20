# Book Reviews React App

A React application for browsing and searching book reviews, designed to work both as a standalone application and integrated within an ASP.NET Core website.

## Quick Start (Standalone Mode)

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation & Development
```bash
# Install dependencies
npm install

# Start development server with hot reload
npm run dev

# The app will be available at http://localhost:5173
```

### Building for Production
```bash
# Build the app
npm run build

# The built files will be in the dist/ directory
```

### Available Scripts
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run test` - Run tests

## Docker Deployment

### Prerequisites
- Docker and Docker Compose installed

### Quick Start with Docker

#### Production Build
```bash
# Build and run production container
./docker-run.sh

# Or use docker-compose
docker-compose up -d

# Access the app at http://localhost:3000
```

#### Development with Docker
```bash
# Start development environment with hot reload
docker-compose --profile dev up

# Access the dev server at http://localhost:5173
```

### Docker Commands

#### Build Image
```bash
# Build production image
docker build -t book-reviews-app .

# Build development image
docker build -f Dockerfile.dev -t book-reviews-app:dev .
```

#### Run Container
```bash
# Run production container
docker run -d -p 3000:80 --name book-reviews-app book-reviews-app

# Run development container
docker run -d -p 5173:5173 -v $(pwd):/app --name book-reviews-dev book-reviews-app:dev
```

#### Using Docker Compose
```bash
# Production
docker-compose up -d

# Development
docker-compose --profile dev up

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Docker Configuration

#### Production Dockerfile
- Multi-stage build with Node.js 18 Alpine
- Nginx for serving static files
- Optimized for production with mock data enabled
- Health check endpoint at `/health`

#### Development Dockerfile
- Single-stage build for development
- Volume mounting for hot reload
- Vite dev server with host binding for Docker

#### Environment Variables
- `VITE_USE_MOCK=true` - Enable standalone mode with mock data
- `NODE_ENV=production` - Production optimizations
- `NODE_ENV=development` - Development mode with hot reload

### Health Checks
The production container includes a health check endpoint:
```bash
curl http://localhost:3000/health
# Returns: "healthy"
```

## Application Modes

This React app operates in two distinct modes:

### Standalone Mode
- **Purpose**: Independent development and testing
- **Data Source**: Local mock data (real book reviews from database)
- **API**: In-memory filtering and search
- **Configuration**: Set via `VITE_USE_MOCK` environment variable or detected automatically
- **Use Case**: Development, testing, demos
- **Default**: This is the default mode when no configuration is provided

### Integrated Mode  
- **Purpose**: Production deployment within ASP.NET Core website
- **Data Source**: Real database via BookReviewsApiController
- **API**: HTTP requests to C# backend
- **Configuration**: Set via `window.bookReviewsConfig.standaloneMode` from C# view
- **Use Case**: Production website integration

## Features

### Browse Functionality
- **Default**: Shows "favorites" bookshelf
- **Filter by shelf**: Select specific bookshelves (favorites, featured, philosophy, etc.)
- **Filter by grouping**: Group bookshelves together (when groupings exist)
- **Recent books**: Show 10 most recently read books
- **Sorting**: Always sorted by date read (newest first)

### Search Functionality
- **Full-text search**: Search across book titles, authors, and content
- **Real-time results**: Results update as you type
- **Minimum length**: 3 characters required to trigger search

### Book Review Display
- **Book cards**: Compact display with cover, title, author, rating
- **Full review reader**: Modal with complete review content
- **Reading time**: Estimated reading time for reviews
- **Cover images**: Automatic cover image loading with fallbacks

## Technical Architecture

### API Layer
- **Unified interface**: Single `getBookReviews()` method handles both modes
- **Consistent responses**: Always returns `BookReviewsViewModel` structure
- **Parameter mapping**: Matches C# controller's `GetBookReviews` method
- **Error handling**: Graceful fallbacks for API failures

### Data Structure
```typescript
interface BookReviewsViewModel {
  category?: string;
  allBookshelves: Bookshelf[];
  allBookshelfGroupings: BookshelfGrouping[];
  selectedShelf?: string;
  selectedGrouping?: string;
  showRecentOnly: boolean;
  useCustomMappings: boolean;
  bookReviews: BookReview[];
}
```

### Mock Data
- **Real data**: 470 book reviews from actual database
- **Content filtering**: Only shows reviews with content (185 reviews)
- **Bookshelves**: 9 real bookshelves including favorites, featured, philosophy
- **Generated fields**: Reading time and preview text calculated automatically

## Development Workflow

### Standalone Development
1. Run `npm run dev` for hot reloading
2. Edit components in `src/components/`
3. Update styles in `src/scss/` files
4. Test search and browse functionality

### Docker Development
1. Run `docker-compose --profile dev up` for containerized development
2. Edit files locally - changes are reflected in container
3. Access dev server at http://localhost:5173

### Integration Testing
1. Build with `npm run build`
2. Copy built files to ASP.NET Core `wwwroot/react-apps/book-reviews-app/`
3. Access via `/BookReviews` route in C# website
4. Test integrated mode with real API

### Environment Variables
- `VITE_USE_MOCK` - Force standalone mode (default: true when not set)
- `VITE_API_BASE_URL` - Base URL for real API calls

## File Structure
```
src/
├── components/          # React components
│   ├── BookCard.tsx    # Individual book display
│   ├── BookReviewReader.tsx # Full review reader
│   └── SearchBar.tsx   # Search interface
├── scss/               # Modular SCSS styles
│   ├── variables.scss  # Shared design variables
│   ├── common.scss     # Common styles across components
│   ├── book-card.scss  # Book card component styles
│   ├── book-review-reader.scss # Review reader styles
│   └── search-bar.scss # Search bar styles
├── services/
│   ├── api.ts          # API client (unified interface)
│   └── mockData.ts     # Mock data and helpers
├── types/
│   └── BookReview.ts   # TypeScript interfaces
├── utils/
│   └── caseConverter.ts # Utility functions
├── App.tsx             # Main application component
├── App.scss            # Main app layout styles
└── main.tsx            # Application entry point
```

## Styling Architecture

The app uses a modular SCSS architecture for maintainable and consistent styling:

### SCSS Structure
- **`variables.scss`**: Shared design tokens (colors, spacing, fonts, etc.)
- **`common.scss`**: Reusable styles across components (bookshelf tags, ratings, text utilities)
- **Component-specific files**: Dedicated styles for each major component
  - `book-card.scss` - Book card display and hover effects
  - `book-review-reader.scss` - Full review reader modal
  - `search-bar.scss` - Search input and hint styling
- **`App.scss`**: Main app layout and general styles

### Design System
- **Consistent spacing**: Uses standardized spacing variables (`$spacing-xs`, `$spacing-sm`, etc.)
- **Color palette**: Semantic color variables (`$color-text-primary`, `$color-brand-primary`, etc.)
- **Typography**: Consistent font families and sizes
- **Interactive states**: Standardized hover and focus effects

### Benefits
- **Modularity**: Each component has its own style file
- **Reusability**: Common patterns extracted to shared files
- **Maintainability**: Changes to common styles affect all components consistently
- **Consistency**: Design tokens ensure visual harmony across the app

## Integration with ASP.NET Core

The React app integrates seamlessly with the C# backend:

1. **Static file serving**: Built files served from `wwwroot/react-apps/book-reviews-app/`
2. **Dynamic asset loading**: C# helper reads hashed filenames for cache busting
3. **Configuration injection**: Mode determined by `window.bookReviewsConfig.standaloneMode` (false = integrated mode)
4. **API routing**: Unified endpoint at `/api/BookReviewsApi` handles all requests
5. **Error handling**: Graceful fallback to standalone mode if build fails
6. **Default behavior**: Standalone mode when no configuration is provided

## Troubleshooting

### Common Issues
- **Build errors**: Ensure all dependencies are installed with `npm install`
- **API failures**: Check network connectivity and C# backend status
- **Missing assets**: Verify React app is built and copied to correct location
- **Mode detection**: Check `window.bookReviewsConfig` in browser console
- **Docker issues**: Ensure Docker is running and ports are available

### Development Tips
- Use browser dev tools to inspect API calls and responses
- Check console for configuration and error messages
- Test both modes to ensure compatibility
- Use TypeScript for better development experience
- Update SCSS variables in `variables.scss` for design system changes
- Use Docker for consistent development environments

### Docker Troubleshooting
```bash
# Check container status
docker ps -a

# View container logs
docker logs book-reviews-app-container

# Restart container
docker restart book-reviews-app-container

# Remove and rebuild
docker-compose down
docker-compose up --build
```
