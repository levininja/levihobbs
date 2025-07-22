# Levi Hobbs Website

This is a personal author website built using ASP.NET Core MVC with PostgreSQL as the database.

## Prerequisites

Before you begin, ensure you have the following installed:
- [.NET 8.0 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [PostgreSQL](https://www.postgresql.org/download/)
- [Node.js and npm](https://nodejs.org/) (for SCSS compilation)
- An IDE (like Visual Studio, VS Code, or Rider)

## Getting Started

1. **Extract the Project**
   - Extract the contents of the zip file to a location of your choice
   - Open the extracted folder in your preferred IDE

2. **Database Setup**
   - Install PostgreSQL if you haven't already
   - Create a new database named `levihobbs`
   - During PostgreSQL installation, you would have set up a superuser (usually named 'postgres')
   - Update the connection string in `appsettings.json` with your PostgreSQL credentials:
     ```json
     "ConnectionStrings": {
       "DefaultConnection": "Host=localhost;Database=levihobbs;Username=postgres;Password=your_postgres_password"
     }
     ```
     Replace `your_postgres_password` with the password you set during PostgreSQL installation. If you're using a different username than 'postgres', update that as well.

3. **Development Credentials**
   - Copy `appsettings.Development.template.json` to `appsettings.Development.json`
   - Contact another developer to get the necessary credentials for:
     - Google Custom Search API key and Search Engine ID
     - ReCaptcha site key
   - These credentials are required for features like book cover image search and form validation

4. **Install .NET Dependencies**
   ```bash
   dotnet restore
   ```

5. **Install Node.js Dependencies** (for SCSS compilation)
   ```bash
   npm install
   ```

6. **Apply Database Migrations**
   ```bash
   dotnet ef database update
   ```

7. **Compile SCSS to CSS**
   ```bash
   npm run build
   ```
   or
   ```bash
   npm run scss:watch
   ```

8. **Run the Application**
   > **Note:** When running `dotnet run` from the root directory, you need to specify the project path: `dotnet run --project src/levihobbs/levihobbs.csproj`. Alternatively, you can `cd` into the `src/levihobbs` directory first and then run the commands.
   
   ```bash
   dotnet run --project src/levihobbs/levihobbs.csproj
   ```
   The application should now be running at `https://localhost:5001` or `http://localhost:5000`

## Development

- The project uses Entity Framework Core for database operations
- Frontend assets are managed through Bower (see `bower.json`)
- The application follows the MVC (Model-View-Controller) pattern
- SCSS is used for styling (see SCSS section below)

## Project Structure

- `src/levihobbs/` - Contains the main project
   - `Controllers/` - Contains the application's controllers
   - `Models/` - Contains the data models
   - `Views/` - Contains the Razor views
   - `ViewComponents/` - Contains the Razor viewComponents
   - `Data/` - Contains database context and configurations
   - `Migrations/` - Contains database migration files
   - `wwwroot/` - Contains static files (CSS, JavaScript, images)
      - `wwwroot/scss/` - Contains SCSS source files
      - `wwwroot/css/` - Contains compiled CSS files
      - `wwwroot/react-apps/` - Contains React applications
         - `book-reviews-app/` - [Book Reviews React App](src/levihobbs/react-apps/book-reviews-app/README.md) (standalone and integrated modes)
- `src/levihobbs.Tests/` - Contains the unit test project

## Bookshelf Configuration

The Bookshelf Configuration page (Admin > Bookshelf Configuration) does two things primarily:
1. controls how bookshelves appear as filter tags on the Book Reviews page and 
2. is used to determine genres and sub-genres.

### How to Use
1. **Enable Custom Mappings**: Check "Enable Custom Bookshelf Mappings" to gain control over which bookshelves appear as filter tags
2. **Create/Remove Groupings**: Use "Add New Grouping" to combine related bookshelves under a single filter tag, or remove groupings you no longer need
3. **Configure Genres**: Check the "Is Genre Based" checkbox on individual bookshelves or bookshelf groupings to mark them as genres. When you mark a bookshelf grouping as genre-based, all bookshelves within it are automatically marked as genre-based too, representing a genre with subgenres.

### Technical Details
- **Controller**: `src/levihobbs/Controllers/AdminController.cs` (methods: `BookshelfConfiguration()` GET/POST)
- **View**: `src/levihobbs/Views/Admin/BookshelfConfiguration.cshtml`
- **ViewModel**: `src/levihobbs/Models/BookshelfConfigurationViewModel.cs`
- **Database**: `ApplicationDbContext` in `src/levihobbs/Data/ApplicationDbContext.cs` handles EF Core configuration for PostgreSQL

## SCSS Compilation

### Directory Structure
- Source files: `wwwroot/scss/`
- Compiled files: `wwwroot/css/` (don't edit these directly)

### Available Commands
- **Build once:** `npm run build`
- **Watch mode:** `npm start` (automatically recompiles when files change)

### Working with SCSS
- Add new SCSS files to the `wwwroot/scss/` directory
- Use `variables.scss` for design tokens and consistent styling
- Keep styles modular and follow existing naming conventions
- Use nesting appropriately to maintain readability

## Troubleshooting

If you encounter any issues:
1. **.NET SDK Version**
   - Make sure you have .NET 8.0 SDK installed
   - You can check your version by running `dotnet --version`
   - If you have an older version, you'll need to upgrade to .NET 8.0

2. **Entity Framework Core Tools**
   - If you get errors about `dotnet-ef` not being found, install the EF Core tools:
     ```bash
     dotnet tool install --global dotnet-ef
     ```
   - If you already have it installed but it's outdated, update it:
     ```bash
     dotnet tool update --global dotnet-ef
     ```

3. **Database Connection**
   - Ensure PostgreSQL is running
   - Verify your PostgreSQL connection string in `appsettings.json`
   - Make sure the database `levihobbs` exists
   - Check that your PostgreSQL user has the correct permissions

4. **SCSS Compilation Issues**
   - Make sure Node.js and npm are installed 
   - Verify that all dependencies are installed with `npm install`
   - Check for errors in the SCSS files

5. **Build Issues**
   - Try cleaning and rebuilding the solution:
     ```bash
     dotnet clean
     dotnet build
     ```
   - If you get package restore errors, try:
     ```bash
     dotnet restore --force
     ```

6. **Running the Application**
   - If you get port conflicts, you can modify the ports in `Properties/launchSettings.json`
   - Make sure no other application is using ports 5000 or 5001

## License

MIT License

Copyright (c) 2025 Levi Hobbs

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE. 