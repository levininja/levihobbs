# Levi Hobbs Monorepo

This repository contains the main `levihobbs.com` site plus two supporting APIs and one shared DTO library.

## Projects

- `src/levihobbs` - ASP.NET Core MVC site (default ports 7000/7001)
- `src/levihobbs.Tests` - unit tests for the MVC site
- `src/book-data-api` - ASP.NET Core Web API for books/reviews/bookshelves/tones (port 5020)
- `src/book-tone-api` - ASP.NET Core Web API for AI tone recommendations (port 5010)
- `src/BookDataApi.Shared` - shared DTO/model class library consumed by the other projects

## Architecture Boundary (Important)

This monorepo keeps service boundaries intact:

- `levihobbs` uses its own database.
- `book-data-api` uses its own database.
- `book-tone-api` uses its own database.
- APIs communicate with each other over HTTP where needed; they do not share a DbContext or directly query each other's databases.

This preserves the ability to split services back into separate repositories later.

## Prerequisites

- .NET 8 SDK
- PostgreSQL
- Node.js and npm
- (Optional) Ollama for `book-tone-api`
- Docker + Docker Compose (for one-command local stack)

## Docker Quick Start (Recommended)

From repo root:

```bash
docker compose up --build
```

This starts:

- 3 separate PostgreSQL databases (`levihobbs`, `book_data_api`, `booktone_db`)
- `book-data-api` on `http://localhost:5020`
- `book-tone-api` on `http://localhost:5010`
- `levihobbs` on `http://localhost:7001`

The compose stack also:

- Builds the React book reviews app during `levihobbs` image build
- Applies EF migrations automatically at startup for each service's own database
- Keeps DB boundaries isolated per service

## Databases

Create three PostgreSQL databases:

```sql
CREATE DATABASE levihobbs;
CREATE DATABASE book_data_api;
CREATE DATABASE booktone_db;
```

Then configure credentials in each project's appsettings/secrets as needed:

- `src/levihobbs` -> `ConnectionStrings:DefaultConnection`
- `src/book-data-api` -> `ConnectionStrings:DefaultConnection`
- `src/book-tone-api` -> `ConnectionStrings:DefaultConnection`

## Getting Started

1. Restore and build everything from repo root:

```bash
dotnet restore
dotnet build levihobbs.sln
```

2. Install frontend dependencies where needed:

```bash
npm --prefix src/levihobbs install
npm --prefix src/book-data-api install
npm --prefix src/levihobbs/react-apps/book-reviews-app install
```

3. Apply EF migrations (run once per DB-backed project):

```bash
dotnet ef database update --project src/levihobbs/levihobbs.csproj
dotnet ef database update --project src/book-data-api/book-data-api.csproj
dotnet ef database update --project src/book-tone-api/BookToneApi.csproj
```

4. Run each service in its own terminal:

```bash
# Terminal 1
dotnet run --project src/book-data-api/book-data-api.csproj

# Terminal 2
dotnet run --project src/book-tone-api/BookToneApi.csproj

# Terminal 3
dotnet run --project src/levihobbs/levihobbs.csproj
```

5. Build SCSS/assets as needed:

```bash
npm --prefix src/levihobbs run build
npm --prefix src/book-data-api run scss:build
npm --prefix src/levihobbs/react-apps/book-reviews-app run build
```

## Service URLs

- `levihobbs`: `https://localhost:7001` or `http://localhost:7000`
- `book-data-api`: `http://localhost:5020`
- `book-tone-api`: `http://localhost:5010`

## React Book Reviews App Mode

The integrated site now defaults to real API mode:

- `src/levihobbs/react-apps/book-reviews-app/env.development`: `VITE_USE_MOCK=false`
- `src/levihobbs/Views/BookReviews/Index.cshtml`: `standaloneMode: false`

Use mock mode only for isolated UI development.

## Troubleshooting

- If `dotnet ef` is missing: `dotnet tool install --global dotnet-ef`
- If API calls fail, verify all three services are running and ports match config.
- If Postgres auth fails, update each project's connection string credentials.

## License

MIT License
