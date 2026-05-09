# Monorepo Migration Plan

## Goal

Convert `levihobbs.com` into a self-contained monorepo by pulling in three currently adjacent projects:

- `book-data-api` — ASP.NET Core Web API for all book data, reviews, bookshelves, tones
- `book-tone-api` — AI-powered tone suggestion API (Ollama/Phi)
- `BookDataApi.Shared` — shared DTO/model class library consumed by both APIs and the main site

After migration, a new developer can clone one repo, configure credentials, and run `dotnet build` from the root. All three services remain independent runnable projects — they are not merged into a single process.

Also included: revert the React app's mock API default back to the real API (commit `9a432b7`).

---

## Current State

```
develop/
├── levihobbs.com/                  ← this repo
│   ├── levihobbs.sln               ← only includes levihobbs + levihobbs.Tests
│   └── src/
│       ├── levihobbs/              ← MVC web app (refs BookDataApi.Shared 3 levels up)
│       └── levihobbs.Tests/
├── book-data-api/                  ← separate repo, port 5020
├── book-tone-api/                  ← separate repo, port 5010
└── BookDataApi.Shared/             ← separate repo, shared library
```

Cross-repo project references today (all using OS-relative paths outside this repo):
- `levihobbs.csproj` → `../../../BookDataApi.Shared/BookDataApi.Shared.csproj`
- `book-data-api.csproj` → `..\BookDataApi.Shared\BookDataApi.Shared.csproj`
- `BookToneApi.csproj` → `..\BookDataApi.Shared\BookDataApi.Shared.csproj`

---

## Target State

```
levihobbs.com/
├── levihobbs.sln                   ← updated: includes all 5 projects
├── README.md                       ← updated: new setup instructions
├── MIGRATION_PLAN.md               ← this file
└── src/
    ├── levihobbs/                  ← existing (project ref updated)
    ├── levihobbs.Tests/            ← existing (unchanged)
    ├── book-data-api/              ← moved in from ../book-data-api
    ├── book-tone-api/              ← moved in from ../book-tone-api
    └── BookDataApi.Shared/         ← moved in from ../BookDataApi.Shared
```

All three project references become same-repo sibling paths under `src/`.

---

## Migration Steps

### Step 1 — Copy the three external projects into `src/`

Copy each project directory (excluding `bin/`, `obj/`, `node_modules/`):

```bash
rsync -av --exclude='bin/' --exclude='obj/' --exclude='node_modules/' \
  /Users/Levi/develop/book-data-api/ src/book-data-api/

rsync -av --exclude='bin/' --exclude='obj/' \
  /Users/Levi/develop/book-tone-api/ src/book-tone-api/

rsync -av --exclude='bin/' --exclude='obj/' \
  /Users/Levi/develop/BookDataApi.Shared/ src/BookDataApi.Shared/
```

The incoming projects have their own `.gitignore` files. Since the root `.gitignore` in this repo already covers the standard .NET + Node patterns (`bin/`, `obj/`, `.vs/`, `node_modules/`, etc.), delete the per-project `.gitignore` files that come in with them — they are redundant and can cause confusion.

### Step 2 — Update project references in each `.csproj`

**`src/levihobbs/levihobbs.csproj`**
```xml
<!-- Before -->
<ProjectReference Include="../../../BookDataApi.Shared/BookDataApi.Shared.csproj" />

<!-- After -->
<ProjectReference Include="../BookDataApi.Shared/BookDataApi.Shared.csproj" />
```

**`src/book-data-api/book-data-api.csproj`**
```xml
<!-- Before -->
<ProjectReference Include="..\BookDataApi.Shared\BookDataApi.Shared.csproj" />

<!-- After -->
<ProjectReference Include="../BookDataApi.Shared/BookDataApi.Shared.csproj" />
```

**`src/book-tone-api/BookToneApi.csproj`**
```xml
<!-- Before -->
<ProjectReference Include="..\BookDataApi.Shared\BookDataApi.Shared.csproj" />

<!-- After -->
<ProjectReference Include="../BookDataApi.Shared/BookDataApi.Shared.csproj" />
```

### Step 3 — Update `levihobbs.sln` to include all projects

Add three new `Project(...)` entries and corresponding build configuration blocks. The solution format is straightforward — generate new GUIDs for each project and add them alongside the existing two entries. The updated solution will include:

1. `levihobbs` (existing) — `src\levihobbs\levihobbs.csproj`
2. `levihobbs.Tests` (existing) — `src\levihobbs.Tests\levihobbs.Tests.csproj`
3. `book-data-api` (new) — `src\book-data-api\book-data-api.csproj`
4. `book-tone-api` (new) — `src\book-tone-api\BookToneApi.csproj`
5. `BookDataApi.Shared` (new) — `src\BookDataApi.Shared\BookDataApi.Shared.csproj`

With all five projects in the solution, `dotnet build` from the repo root builds everything.

### Step 4 — Revert mock API defaults (commit `9a432b7`)

Two files changed in that commit need to be reverted. The tests added in the same commit can be kept — they test valid logic and should not be thrown away.

**`src/levihobbs/react-apps/book-reviews-app/env.development`**
```
# Before (current state)
VITE_USE_MOCK=true

# After (reverted)
VITE_USE_MOCK=false
VITE_API_BASE_URL=http://localhost:5000/api
```

**`src/levihobbs/Views/BookReviews/Index.cshtml`**
```js
// Before (current state)
standaloneMode: true,  // true = use mock data, false = use real API

// After (reverted)
standaloneMode: false, // true = use mock data, false = use real API
```

### Step 5 — Update `README.md`

The README needs a significant rewrite to reflect monorepo reality:

- Remove the "Required folder structure" section that mandates sibling repos
- Remove the "Both codebases must be installed in adjacent folders" requirement
- Update the project dependency diagram to show all five projects in one repo
- Update "Getting Started" to run `dotnet build` once from repo root instead of per-project
- Add a section on running all three services (they each still need to be started separately, since they're independent processes)
- Add EF migration instructions for all three DB-backed projects (`levihobbs`, `book-data-api`, `book-tone-api`)
- Document the three databases needed: `levihobbs`, `book_data_api`, and the book-tone-api DB (check `book-tone-api/appsettings.json` for its DB name)

---

## Verification Steps

After each step, verify before moving to the next:

1. After Step 2+3: `dotnet build` from repo root should succeed with zero errors across all five projects.
2. After Step 4: Open the book reviews page in the browser and confirm it hits the real API (no mock data placeholders visible).
3. End-to-end: Start all three services and verify the tone assignment admin page can call book-tone-api and book-data-api.

---

## Risk Areas

### 1. EF Migrations path sensitivity
Each DB-backed project (`levihobbs`, `book-data-api`, `book-tone-api`) has its own `Migrations/` folder. When running `dotnet ef database update`, the tool must be run from within each project directory (or with `--project src/book-data-api`). The migrations themselves are unaffected by the move since they're relative to their own project — but developers need to know to run the command three times, once per project.

### 2. Three separate databases still required
The monorepo does not merge the data stores. A new developer still needs three PostgreSQL databases:
- `levihobbs` (for the MVC web app)
- `book_data_api` (for book-data-api)
- The book-tone-api database (verify name in its `appsettings.json`)

Consider adding a setup script or Makefile target that runs all three `dotnet ef database update` commands in sequence.

### 3. `book-data-api` has SCSS
`src/book-data-api/` has a `package.json` with sass dev dependency and `npm run scss:build` / `npm run scss:watch` scripts. Anyone working on book-data-api's UI layer also needs to run `npm install` in that subdirectory. Document this alongside the existing SCSS instructions for `levihobbs`.

### 4. `book-tone-api` uses .NET 9 packages on a net8.0 target
`BookToneApi.csproj` targets `net8.0` but pulls EF Core 9.x and Npgsql 9.x packages. This is technically valid (EF Core 9 supports .NET 8) but is inconsistent with the rest of the solution which uses EF Core 8.x. It works as-is and should not block the migration, but is worth standardizing in a follow-up.

### 5. Gitignore coverage for incoming projects
The root `.gitignore` covers the standard patterns. The incoming projects each ship their own `.gitignore` — these should be deleted after copying to avoid conflicting or overlapping ignore rules. Review the incoming files to confirm no custom patterns are missing from the root `.gitignore` before deleting them.

### 6. No single startup command (yet)
`dotnet build` from root will work after this migration, but `dotnet run` only starts one project. A new developer still needs three terminal sessions (or a process manager) to run the full stack. This is acceptable for V1 of the monorepo. A follow-up could add a `Makefile`, shell script, or `docker-compose.yml` that starts all three.

---

## Files Created or Modified

| File | Change |
|---|---|
| `levihobbs.sln` | Add 3 new project entries + build configuration blocks |
| `src/levihobbs/levihobbs.csproj` | Update `BookDataApi.Shared` project reference path |
| `src/book-data-api/book-data-api.csproj` | Update `BookDataApi.Shared` project reference path |
| `src/book-tone-api/BookToneApi.csproj` | Update `BookDataApi.Shared` project reference path |
| `src/levihobbs/react-apps/book-reviews-app/env.development` | Revert `VITE_USE_MOCK` to `false` |
| `src/levihobbs/Views/BookReviews/Index.cshtml` | Revert `standaloneMode` to `false` |
| `README.md` | Rewrite setup instructions for monorepo |
| `src/book-data-api/` | New directory — copied from `../book-data-api` |
| `src/book-tone-api/` | New directory — copied from `../book-tone-api` |
| `src/BookDataApi.Shared/` | New directory — copied from `../BookDataApi.Shared` |
| `src/book-data-api/.gitignore` | Delete (covered by root `.gitignore`) |
| `src/book-tone-api/.gitignore` | Delete (covered by root `.gitignore`) |
