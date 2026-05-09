# Repository Guidelines

## Project Structure & Module Organization
The API source lives at the root of this repo. Controllers sit in `Controllers/`, query and persistence logic in `Services/` and `Data/`, and Entity Framework models in `Models/`. Database migrations are tracked in `Migrations/`. Shared contracts come from the sibling project `../BookDataApi.Shared`, so update that library whenever you add DTOs or core models that are reused across services. Keep new JSON configuration in `appsettings.Development.json` for local work and mirror sensitive values in environment variables for deployment.

## Build, Test, and Development Commands
Run `dotnet restore` followed by `dotnet build` to compile against .NET 8 with nullable reference types enabled. Use `dotnet run` to launch the API on https://localhost:5020 and load Swagger. Database changes require `dotnet ef migrations add <Name>` and `dotnet ef database update` (install the global `dotnet-ef` tool once). If you touch SCSS assets, compile them with `npm install` and `npm run scss:build` or keep a watcher running via `npm run scss:watch`.

## Coding Style & Naming Conventions
Follow standard C# conventions: four-space indentation, `PascalCase` for classes and public members, `camelCase` for locals and method parameters, and singular file-per-type organization. Prefer constructor injection for services and keep controller actions thin by delegating to classes in `Services/`. Use asynchronous APIs when hitting the database or external services, and return `ActionResult<T>` to preserve consistent HTTP responses. When updating shared DTOs, keep namespaces aligned with the folder structure.

## Testing Guidelines
There is not yet a committed test project; new contributions should add one under `tests/BookDataApi.Tests` (xUnit recommended) with files suffixed `*Tests.cs`. Keep unit tests fast and deterministic, mocking I/O or network calls via abstractions in `Services/`. Cover new controllers with integration-style tests that exercise the full request pipeline via the ASP.NET Core test host. Execute the full suite using `dotnet test` before opening a PR.

## Commit & Pull Request Guidelines
Recent history favors short, imperative commit subjects (`Add tone filtering to shelves`) with optional context in the body. Group related changes together and include `dotnet format` output in the same commit if you run it. Pull requests should describe the change, list any new migrations, and call out configuration impacts (e.g., new values under `GoogleCustomSearch`). Attach screenshots or sample responses when altering endpoints, and link to tracking issues so reviewers can trace intent.

## Security & Configuration Tips
Never commit real connection strings or API keys; rely on user secrets or environment variables in production. Validate any external input before persisting, and keep an eye on long-running EF queries—add indexes via migrations when needed. When adding third-party services, document required environment variables in `README.md` and update this guide if contributor workflows change.
