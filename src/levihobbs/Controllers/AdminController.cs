using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using CsvHelper;
using CsvHelper.Configuration;
using CsvHelper.Configuration.Attributes;
using levihobbs.Data;
using levihobbs.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Microsoft.EntityFrameworkCore;

namespace levihobbs.Controllers
{
    public class AdminController : Controller
    {
        private readonly ILogger<AdminController> _logger;
        private readonly ApplicationDbContext _context;
        
        public AdminController(
            ILogger<AdminController> logger,
            ApplicationDbContext context)
        {
            _logger = logger;
            _context = context;
        }
        
        public IActionResult ImportBookReviews()
        {
            return View(ModelState);
        }

        #region Book Review Import
        
        /// <summary>
        /// Handles the POST request for importing book reviews from a CSV file.
        /// Validates the file, processes it, and imports the reviews into the database.
        /// </summary>
        /// <param name="file">The CSV file containing book reviews to import.</param>
        /// <returns>View with success message or error details.</returns>
        [HttpPost]
        [RequestSizeLimit(10 * 1024 * 1024)] // 10MB limit
        public async Task<IActionResult> ImportBookReviews(IFormFile? file)
        {
            if (file == null)
            {
                ModelState.AddModelError("", "Please select a file to upload");
                return View(ModelState);
            }
            
            string fileName = file.FileName;
            
            // Check if file is CSV
            if (fileName == null || !fileName.EndsWith(".csv", StringComparison.OrdinalIgnoreCase))
            {
                ModelState.AddModelError("", "Please upload a CSV file");
                return View(ModelState);
            }
            
            try
            {
                int importResult = await ImportBookReviewsFromCsvFile(file);
                ViewBag.SuccessMessage = $"Successfully imported {importResult} book reviews.";
                return View(ModelState);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error importing book reviews");
                ModelState.AddModelError("", ex.Message);
                return View(ModelState);
            }
        }
        
        /// <summary>
        /// Process the CSV file and import the book reviews into the database
        /// </summary>
        /// <param name="file">The CSV file to import</param>
        /// <returns>The number of imported book reviews</returns>
        private async Task<int> ImportBookReviewsFromCsvFile(IFormFile file)
        {
            using Stream stream = file.OpenReadStream();
            using StreamReader reader = new StreamReader(stream);
            
            CsvConfiguration config = new CsvConfiguration(CultureInfo.InvariantCulture)
            {
                HasHeaderRecord = true,
                MissingFieldFound = null,
                BadDataFound = null,
                Mode = CsvMode.RFC4180,
                PrepareHeaderForMatch = args => args.Header.Trim('"', ' ')
            };
            
            string[] requiredColumns = new[] 
            { 
                "Title", 
                "Author l-f", 
                "My Rating", 
                "Average Rating", 
                "Number of Pages", 
                "Original Publication Year", 
                "Date Read", 
                "Bookshelves", 
                "Exclusive Shelf", 
                "My Review" 
            };
            
            var existingReviews = await _context.BookReviews
                .Select(r => new { r.Title, r.AuthorFirstName, r.AuthorLastName, BookshelvesCount = r.Bookshelves.Count })
                .ToListAsync();
            
            List<Bookshelf> existingBookshelves = await _context.Bookshelves.ToListAsync();
            
            int importedCount = 0;
            int duplicateCount = 0;
            
            using CsvReader csv = new CsvReader(reader, config);
            List<GoodreadsBookReviewCsv> records = csv.GetRecords<GoodreadsBookReviewCsv>().ToList();
            
            for (int i = 0; i < records.Count; i++)
            {
                GoodreadsBookReviewCsv row = records[i];
                
                // Check header on first iteration; this can't be done before the loop begins
                // because of how stream readers work.
                if (i == 0)
                    ValidateCsvHeader(csv, requiredColumns);
                    
                // Skip import if there is no review content
                if (row.My_Review == null || row.My_Review.Trim().Length == 0)
                    continue;
                
                // Parse author name (last, first)
                string authorName = row.Author_l_f ?? "";
                string firstName = "";
                string lastName = "";
                if (authorName.Contains(","))
                {
                    string[] parts = authorName.Split(new[] { ", " }, StringSplitOptions.None);
                    lastName = parts[0].Trim();
                    firstName = parts.Length > 1 ? parts[1].Trim() : "";
                }
                else
                    lastName = authorName;

                // Check for existing reviews with same title and author
                var matchingReview = existingReviews.FirstOrDefault(r => 
                    r.Title == row.Title && 
                    r.AuthorFirstName == firstName && 
                    r.AuthorLastName == lastName);
                if (matchingReview != null)
                {
                    int importedRowBookshelvesCount = row.Bookshelves?.Split(',', StringSplitOptions.RemoveEmptyEntries).Length ?? 0;
                    bool hasSameNumberOfBookshelves = matchingReview.BookshelvesCount == importedRowBookshelvesCount;
                    
                    // If it has the same number of bookshelves too, then this is a true duplicate; skip import and increase duplicate count
                    if (hasSameNumberOfBookshelves)
                    {
                        duplicateCount++;
                        continue;
                    }
                    // If it has a different number of bookshelves, we need to delete the existing review so it can be replaced with the new one
                    else
                    {
                        var reviewsToDelete = await _context.BookReviews
                            .Where(r => r.Title == row.Title && 
                                       r.AuthorFirstName == firstName && 
                                       r.AuthorLastName == lastName)
                            .ToListAsync();
                        _context.BookReviews.RemoveRange(reviewsToDelete);
                        
                        // Remove from our in-memory tracking list as well
                        existingReviews.RemoveAll(r => 
                            r.Title == row.Title && 
                            r.AuthorFirstName == firstName && 
                            r.AuthorLastName == lastName);
                    }
                }
                
                // Now that we have determined that the book review should in fact be imported...

                _logger.LogInformation("Importing book review: {Title} by {Author}", row.Title, authorName);
                _logger.LogDebug("Row data: {RowData}", row);
                _logger.LogDebug("Bookshelves: {Bookshelves}", row.Bookshelves?.Split(',', StringSplitOptions.RemoveEmptyEntries).Length ?? 0);

                // Finish parsing other fields
                int.TryParse(row.My_Rating, out int myRating);
                if (myRating < 0 || myRating > 5)
                {
                    _logger.LogWarning("Skipping book '{Title}' - Invalid rating: {Rating}", row.Title, myRating);
                    continue;
                }

                decimal.TryParse(row.Average_Rating, out decimal avgRating);

                int.TryParse(row.Number_of_Pages, out int pages);

                int.TryParse(row.Original_Publication_Year, out int pubYear);

                DateTime dateRead = DateTime.UtcNow;
                if (DateTime.TryParse(row.Date_Read, out DateTime parsedDate))
                    dateRead = DateTime.SpecifyKind(parsedDate, DateTimeKind.Utc);
                
                // Put together BookReview object for import
                BookReview bookReview = new BookReview
                {
                    Title = row.Title ?? "",
                    AuthorFirstName = firstName,
                    AuthorLastName = lastName,
                    MyRating = myRating,
                    AverageRating = avgRating,
                    NumberOfPages = pages > 0 ? pages : null,
                    OriginalPublicationYear = pubYear > 0 ? pubYear : null,
                    DateRead = dateRead,
                    MyReview = row.My_Review ?? "",
                    SearchableString = BuildSearchableString(row.Title ?? "", firstName, lastName, 
                        row.Additional_Authors, row.Publisher, row.Bookshelves)
                };

                // Import book review
                _context.BookReviews.Add(bookReview);
                importedCount++;
                
                // Import any bookshelves, if they don't already exist
                ProcessBookshelvesForImport(row.Bookshelves, bookReview, existingBookshelves);
            }
            
            // After processing all records, delete bookshelves that exist in the database but don't exist in the import
            RemoveUnusedBookshelves(records, existingBookshelves);
            
            await _context.SaveChangesAsync();
            ViewBag.DuplicateCount = duplicateCount;
            return importedCount;
        }

        /// <summary>
        /// Builds a searchable string for a book review by combining title, authors, publisher, and processed bookshelves.
        /// </summary>
        /// <param name="title">The book title.</param>
        /// <param name="firstName">The author's first name.</param>
        /// <param name="lastName">The author's last name.</param>
        /// <param name="additionalAuthors">Additional authors.</param>
        /// <param name="publisher">The publisher.</param>
        /// <param name="bookshelves">The bookshelves.</param>
        /// <returns>A lowercase searchable string.</returns>
        private string BuildSearchableString(string title, string firstName, string lastName, 
            string? additionalAuthors, string? publisher, string? bookshelves)
        {
            List<string> searchableParts = new List<string>();
            
            // Add title and author
            searchableParts.Add(title);
            searchableParts.Add($"{firstName} {lastName}".Trim());
            
            // Add additional authors
            if (!string.IsNullOrEmpty(additionalAuthors))
                searchableParts.Add(additionalAuthors);
            
            // Add publisher
            if (!string.IsNullOrEmpty(publisher))
                searchableParts.Add(publisher);
            
            // Process bookshelves
            if (!string.IsNullOrEmpty(bookshelves))
            {
                string processedShelves = ProcessBookshelvesForSearch(bookshelves);
                if (!string.IsNullOrEmpty(processedShelves))
                    searchableParts.Add(processedShelves);
            }
            
            return string.Join(" ", searchableParts.Where(p => !string.IsNullOrEmpty(p))).ToLower();
        }

        /// <summary>
        /// Processes bookshelves for search by filtering, normalizing, and applying synonyms.
        /// </summary>
        /// <param name="bookshelves">The raw bookshelves string.</param>
        /// <returns>A space-separated string of processed shelf names.</returns>
        private string ProcessBookshelvesForSearch(string bookshelves)
        {
            HashSet<string> excludedShelves = new HashSet<string> 
            { 
                "to-read", "to-look-into", "currently-reading", 
                "decided-not-to-read", "anticipating-release" 
            };
            
            Dictionary<string, string> synonymMap = new Dictionary<string, string>
            {
                { "sf", "Science Fiction Sci-Fi Scifi" }
            };
            
            IEnumerable<string> shelves = bookshelves.Split(',', StringSplitOptions.RemoveEmptyEntries)
                .Select(s => s.Trim().ToLower())
                .Where(s => !excludedShelves.Contains(s))
                .Select(s => s.Replace('-', ' '))
                .Select(s => synonymMap.ContainsKey(s) ? synonymMap[s] : s)
                .Where(s => !string.IsNullOrEmpty(s));
            
            return string.Join(" ", shelves);
        }

        /// <summary>
        /// Validates that the CSV header contains all required columns.
        /// </summary>
        /// <param name="csv">The CSV reader.</param>
        /// <param name="requiredColumns">Array of required column names.</param>
        /// <exception cref="Exception">Thrown if header is missing or required columns are absent.</exception>
        private void ValidateCsvHeader(CsvReader csv, string[] requiredColumns)
        {
            string[] header = csv.HeaderRecord;
            if (header == null)
                throw new Exception("CSV file is missing header row");
            
            List<string> missingColumns = requiredColumns
                .Where(col => !header.Contains(col))
                .ToList();
                
            if (missingColumns.Any())
                throw new Exception($"CSV file is missing required columns: {string.Join(", ", missingColumns)}");
        }

        /// <summary>
        /// Processes bookshelves from the CSV import, creating new bookshelves if they don't exist and associating them with the book review.
        /// </summary>
        /// <param name="bookshelvesString">The comma-separated string of bookshelf names from the CSV.</param>
        /// <param name="bookReview">The book review to associate the bookshelves with.</param>
        /// <param name="existingBookshelves">The list of existing bookshelves in the database.</param>
        private void ProcessBookshelvesForImport(string? bookshelvesString, BookReview bookReview, List<Bookshelf> existingBookshelves)
        {
            if (string.IsNullOrEmpty(bookshelvesString))
                return;

            List<string> shelfNames = bookshelvesString.Split(',', StringSplitOptions.RemoveEmptyEntries)
                .Select(s => s.Trim())
                .Where(s => !string.IsNullOrEmpty(s))
                .ToList();
            
            foreach (string shelfName in shelfNames)
            {
                string normalizedName = shelfName.ToLower();

                // See if this bookshelf already exists in the database
                Bookshelf? bookshelf = existingBookshelves.FirstOrDefault(b => b.Name.ToLower() == normalizedName);

                // If the bookshelf doesn't exist, create a new one
                if(bookshelf == null){
                    bookshelf = new Bookshelf
                    {
                        Name = shelfName,
                        DisplayName = shelfName
                    };
                    _context.Bookshelves.Add(bookshelf);
                    existingBookshelves.Add(bookshelf);
                }

                // Either way (whether we created a new bookshelf or found an existing one), add it to the book review
                // to track that it has this bookshelf (this populates a crossreference table in the db).
                bookReview.Bookshelves.Add(bookshelf);
            }
        }

        /// <summary>
        /// Removes bookshelves that exist in the database but are not present in the import records.
        /// </summary>
        /// <param name="records">The list of imported book review records.</param>
        /// <param name="existingBookshelves">The list of existing bookshelves in the database.</param>
        private void RemoveUnusedBookshelves(List<GoodreadsBookReviewCsv> records, List<Bookshelf> existingBookshelves)
        {
            HashSet<string> importedBookshelfNames = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
            foreach (GoodreadsBookReviewCsv record in records)
            {
                if (!string.IsNullOrEmpty(record.Bookshelves))
                {
                    List<string> shelfNames = record.Bookshelves.Split(',', StringSplitOptions.RemoveEmptyEntries)
                        .Select(s => s.Trim())
                        .Where(s => !string.IsNullOrEmpty(s))
                        .ToList();
                    
                    foreach (string shelfName in shelfNames)
                        importedBookshelfNames.Add(shelfName);
                }
            }
            
            // Find bookshelves that exist in the database but not in the import
            List<Bookshelf> bookshelvesToDelete = existingBookshelves
                .Where(bs => !importedBookshelfNames.Contains(bs.Name))
                .ToList();
            
            if (bookshelvesToDelete.Any())
            {
                _context.Bookshelves.RemoveRange(bookshelvesToDelete);
                _logger.LogInformation("Deleted {Count} bookshelves that were not present in the import: {Names}", 
                    bookshelvesToDelete.Count, 
                    string.Join(", ", bookshelvesToDelete.Select(bs => bs.Name)));
            }
        }


        #endregion


        #region Bookshelf Configuration

        /// <summary>
        /// Displays the bookshelf configuration page with current bookshelves and groupings.
        /// </summary>
        /// <returns>The bookshelf configuration view with populated view model.</returns>
        [HttpGet]
        public async Task<IActionResult> BookshelfConfiguration()
        {
            List<Bookshelf> bookshelves = await _context.Bookshelves
                .OrderBy(bs => bs.DisplayName ?? bs.Name)
                .ToListAsync();
                
            List<BookshelfGrouping> groupings = await _context.BookshelfGroupings
                .Include(bg => bg.Bookshelves)
                .OrderBy(bg => bg.DisplayName ?? bg.Name)
                .ToListAsync();
                
            BookshelfConfigurationViewModel viewModel = new BookshelfConfigurationViewModel
            {
                EnableCustomMappings = bookshelves.Any(bs => bs.Display.HasValue),
                Bookshelves = bookshelves.Select(bs => new BookshelfDisplayItem
                {
                    Id = bs.Id,
                    Name = bs.Name,
                    DisplayName = bs.DisplayName,
                    Display = bs.Display ?? false,
                    IsGenreBased = bs.IsGenreBased
                }).ToList(),
                Groupings = groupings.Select(bg => new BookshelfGroupingItem
                {
                    Id = bg.Id,
                    Name = bg.Name,
                    DisplayName = bg.DisplayName,
                    SelectedBookshelfIds = bg.Bookshelves.Select(bs => bs.Id).ToList(),
                    IsGenreBased = bg.IsGenreBased
                }).ToList()
            };
            
            return View(viewModel);
        }
        
        /// <summary>
        /// Handles the POST request for updating bookshelf configurations, including display settings and groupings.
        /// </summary>
        /// <param name="model">The view model containing updated bookshelf configuration data.</param>
        /// <returns>Redirect to the bookshelf configuration page after saving.</returns>
        [HttpPost]
        public async Task<IActionResult> BookshelfConfiguration(BookshelfConfigurationViewModel model)
        {
            try
            {                
                // Update bookshelf display settings
                List<Bookshelf> bookshelves = await _context.Bookshelves.ToListAsync();
                
                if (model.EnableCustomMappings)
                {
                    foreach (Bookshelf bookshelf in bookshelves)
                    {
                        BookshelfDisplayItem? displayItem = model.Bookshelves.FirstOrDefault(b => b.Id == bookshelf.Id);
                        bookshelf.Display = displayItem?.Display ?? false;
                        bookshelf.IsGenreBased = displayItem?.IsGenreBased ?? false;
                    }
                }
                else // Reset all display settings to null when custom mappings are disabled
                    foreach (Bookshelf bookshelf in bookshelves)
                        bookshelf.Display = null;
                
                // Handle groupings
                List<BookshelfGrouping> existingGroupings = await _context.BookshelfGroupings
                    .Include(bg => bg.Bookshelves)
                    .ToListAsync();
                
                // Only remove groupings that are explicitly marked for removal
                List<BookshelfGrouping> groupingsToRemove = existingGroupings
                    .Where(eg => model.Groupings.Any(mg => mg.Id == eg.Id && mg.ShouldRemove))
                    .ToList();
                    
                _context.BookshelfGroupings.RemoveRange(groupingsToRemove);
                
                // Track which bookshelves are assigned to groupings for automatic display setting
                HashSet<int> bookshelvesInGroupings = new HashSet<int>();
                
                // Update or create groupings
                foreach (BookshelfGroupingItem groupingModel in model.Groupings)
                {                   
                    BookshelfGrouping grouping;
                    
                    if (groupingModel.Id > 0)
                    {
                        grouping = existingGroupings.First(eg => eg.Id == groupingModel.Id);
                        grouping.Name = groupingModel.Name;
                        grouping.DisplayName = groupingModel.DisplayName;
                        grouping.IsGenreBased = groupingModel.IsGenreBased;
                        grouping.Bookshelves.Clear();
                    }
                    else
                    {
                        grouping = new BookshelfGrouping
                        {
                            Name = groupingModel.Name,
                            DisplayName = groupingModel.DisplayName,
                            IsGenreBased = groupingModel.IsGenreBased
                        };
                        _context.BookshelfGroupings.Add(grouping);
                    }
                    
                    // Add selected bookshelves to the grouping
                    List<Bookshelf> selectedBookshelves = bookshelves
                        .Where(bs => groupingModel.SelectedBookshelfIds?.Contains(bs.Id) ?? false)
                        .ToList();
                        
                    foreach (Bookshelf bookshelf in selectedBookshelves)
                    {
                        grouping.Bookshelves.Add(bookshelf);
                        bookshelvesInGroupings.Add(bookshelf.Id);
                        // Set IsGenreBased for bookshelves in groupings
                        bookshelf.IsGenreBased = groupingModel.IsGenreBased;
                    }
                }
                
                // Automatically set bookshelves to display if they're assigned to a grouping
                if (model.EnableCustomMappings)
                {
                    foreach (Bookshelf bookshelf in bookshelves)
                    {
                        if (bookshelvesInGroupings.Contains(bookshelf.Id))
                        {
                            bookshelf.Display = true;
                        }
                        // If IsGenreBased is true, ensure Display is also true
                        if (bookshelf.IsGenreBased)
                        {
                            bookshelf.Display = true;
                        }
                    }
                }
                
                int saveResult = await _context.SaveChangesAsync();
                ViewBag.SuccessMessage = "Bookshelf configuration saved successfully.";
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error saving bookshelf configuration");
                ModelState.AddModelError("", "An error occurred while saving the configuration.");
            }
            
            return await BookshelfConfiguration();
        }
        



        #endregion


        #region Tone Administration
        
        /// <summary>
        /// Retrieves the tone configuration data from the database and prepares it for display in the view.
        /// Loads parent tones with their subtones and maps them to view models for the configuration UI.
        /// Limitation: the way to change the parent tone of a subtone is just deleting and re-adding it.
        /// </summary>
        /// <returns>The tone configuration view with the populated view model</returns>
        [HttpGet]
        public async Task<IActionResult> ToneConfiguration()
        {
            List<Tone> tones = await _context.Tones
                .Include(t => t.Subtones)
                .Where(t => t.ParentId == null) // This way you don't get subtones twice in the structure
                .OrderBy(t => t.Name)
                .ToListAsync();
                
            ToneConfigurationViewModel viewModel = new ToneConfigurationViewModel
            {
                Tones = tones.Select(t => new ToneItem
                {
                    Id = t.Id,
                    Name = t.Name,
                    Description = t.Description,
                    Subtones = t.Subtones.Select(st => new ToneItem
                    {
                        Id = st.Id,
                        Name = st.Name,
                        Description = st.Description,
                        ParentId = st.ParentId
                    }).OrderBy(st => st.Name).ToList()
                }).OrderBy(t => t.Name).ToList()
            };
            
            return View(viewModel);
        }
        /// <summary>
        /// Handles POST requests for tone configuration updates, including creating, updating, and removing tones and subtones.
        /// </summary>
        /// <param name="model">The view model containing tone configuration data from the form submission</param>
        /// <returns>Redirects back to the tone configuration page after saving to update DOM with IDs of newly created tones</returns>
        [HttpPost]
        public async Task<IActionResult> ToneConfiguration(ToneConfigurationViewModel model)
        {
            try
            {
                // Get all existing tones
                List<Tone> existingTones = await _context.Tones
                    .Include(t => t.Subtones)
                    .ToListAsync();
                
                // Handle tone removals...
                List<Tone> tonesToRemove = existingTones
                    .Where(et => model.Tones.Any(mt => mt.Id == et.Id && mt.ShouldRemove))
                    .ToList();
                
                // Also remove subtones of removed parent tones
                List<Tone> subtonesToRemove = existingTones
                    .Where(et => et.ParentId.HasValue && tonesToRemove.Any(tr => tr.Id == et.ParentId))
                    .ToList();
                
                _context.Tones.RemoveRange(tonesToRemove);
                _context.Tones.RemoveRange(subtonesToRemove);
                
                // Process each tone in the model that isn't marked for removal
                foreach (ToneItem toneModel in model.Tones.Where(t => !t.ShouldRemove))
                {
                    Tone tone;
                    
                    if (toneModel.Id > 0)
                    {
                        // Update existing tone
                        tone = existingTones.First(et => et.Id == toneModel.Id);
                        tone.Name = toneModel.Name;
                        tone.Description = toneModel.Description;
                    }
                    else
                    {
                        // Create new tone
                        tone = new Tone
                        {
                            Name = toneModel.Name,
                            Description = toneModel.Description
                        };
                        _context.Tones.Add(tone);
                    }
                    
                    // Handle subtones...
                    List<Tone> existingSubtones = existingTones.Where(et => et.ParentId == tone.Id).ToList();
                    
                    // Remove subtones marked for removal
                    List<Tone> subtonesToRemoveForThisTone = existingSubtones
                        .Where(es => toneModel.Subtones.Any(st => st.Id == es.Id && st.ShouldRemove))
                        .ToList();
                    _context.Tones.RemoveRange(subtonesToRemoveForThisTone);
                    
                    // Process remaining subtones
                    foreach (ToneItem subtoneModel in toneModel.Subtones.Where(st => !st.ShouldRemove))
                    {
                        if (subtoneModel.Id > 0)
                        {
                            // Update existing subtone
                            Tone subtone = existingSubtones.First(es => es.Id == subtoneModel.Id);
                            subtone.Name = subtoneModel.Name;
                            subtone.Description = subtoneModel.Description;
                        }
                        else
                        {
                            // Create new subtone
                            Tone subtone = new Tone
                            {
                                Name = subtoneModel.Name,
                                Description = subtoneModel.Description,
                                Parent = tone
                            };
                            _context.Tones.Add(subtone);
                        }
                    }
                }
                
                // Save all changes to the database in one fell swoop
                await _context.SaveChangesAsync();
                ViewBag.SuccessMessage = "Tone configuration saved successfully.";
                
                // Redirect to refresh the page so it gets updated IDs
                return RedirectToAction(nameof(ToneConfiguration));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error saving tone configuration");
                ModelState.AddModelError("", "An error occurred while saving the tone configuration.");
                return await ToneConfiguration();
            }
        }
        #endregion


        #region Tone Assignment

        // For the uncategorized tones that aren't part of any other group
        const string otherTonesGroupName = "Other";
                
        /// <summary>
        /// Displays the tone assignment interface for book reviews that have review content.
        /// Groups tones by parent tone for organized display and provides suggestions based on content analysis.
        /// </summary>
        /// <returns>The tone assignment view with book reviews and tone groupings</returns>
        [HttpGet]
        public async Task<IActionResult> ToneAssignment()
        {
            // Get all book reviews that have review content
            List<BookReview> allBookReviews = await _context.BookReviews
                .Include(br => br.Tones)
                .Include(br => br.Bookshelves)
                    .ThenInclude(bs => bs.BookshelfGroupings)
                .Where(br => br.HasReviewContent)
                .OrderBy(br => br.Title)
                .ToListAsync();

            // Separate books with and without assigned tones
            List<BookReview> booksWithoutTones = allBookReviews.Where(br => !br.Tones.Any()).ToList();
            List<BookReview> booksWithTones = allBookReviews.Where(br => br.Tones.Any()).ToList();

            // Get all tones with their relationships
            List<Tone> allTones = await _context.Tones
                .Include(t => t.Subtones)
                .Where(t => t.ParentId == null) // This way you don't get subtones twice in the structure
                .ToListAsync();

            // Put the tone groupings together
            List<ToneGroup> toneGroups = allTones.Where(pt => pt.Subtones.Any()).Select((pt, index) => new ToneGroup
            {
                Name = pt.Name,
                DisplayName = pt.Name,
                ColorClass = GetColorClassForTone(index),
                Tones = new[] { pt }.Concat(pt.Subtones.OrderBy(st => st.Name))
                    .Select(t => new ToneDisplayItem
                    {
                        Id = t.Id,
                        Name = t.Name,
                        Description = t.Description
                    }).ToList()
            }).ToList();

            // Add a group for all stand-alone tones that don't have children
            toneGroups.Add(new ToneGroup
            {
                Name = otherTonesGroupName,
                DisplayName = otherTonesGroupName,
                ColorClass = GetColorClassForTone(-1), // -1 is a special case for the uncategorized tones group
                Tones = allTones.Where(pt => !pt.Subtones.Any() && pt.ParentId == null).Select(pt => new ToneDisplayItem {
                    Id = pt.Id,
                    Name = pt.Name,
                    Description = pt.Description
                }).ToList()
            });

            List<GenreToneAssociation> genreToneAssociations = GetGenreToneAssociations();

            // Return the view model
            ToneAssignmentViewModel viewModel = new ToneAssignmentViewModel
            {
                BookReviews = booksWithoutTones.Select(br => new BookReviewToneItem
                {
                    Id = br.Id,
                    Title = br.Title,
                    AuthorName = $"{br.AuthorFirstName} {br.AuthorLastName}".Trim(),
                    Genres = GetBookGenres(br),
                    MyReview = br.MyReview,
                    AssignedToneIds = br.Tones.Select(t => t.Id).ToList(),
                    SuggestedToneIds = GetSuggestedTones(br, allTones, genreToneAssociations)
                }).ToList(),
                BooksWithTones = booksWithTones.Select(br => new BookReviewToneItem
                {
                    Id = br.Id,
                    Title = br.Title,
                    AuthorName = $"{br.AuthorFirstName} {br.AuthorLastName}".Trim(),
                    Genres = GetBookGenres(br),
                    MyReview = br.MyReview,
                    AssignedToneIds = br.Tones.Select(t => t.Id).ToList(),
                    SuggestedToneIds = GetSuggestedTones(br, allTones, genreToneAssociations)
                }).ToList(),
                ToneGroups = toneGroups
            };

            return View(viewModel);
        }

        /// <summary>
        /// Handles POST requests for tone assignment updates, saving the tone assignments for book reviews.
        /// </summary>
        /// <param name="model">The view model containing tone assignment data from the form submission</param>
        /// <returns>Redirects back to the tone assignment page after saving</returns>
        [HttpPost]
        public async Task<IActionResult> ToneAssignment(ToneAssignmentViewModel model)
        {
            try
            {
                // Get all book reviews and tones - include both BookReviews and BooksWithTones
                List<int> allBookReviewIds = model.BookReviews.Select(brm => brm.Id)
                    .Concat(model.BooksWithTones.Select(brm => brm.Id))
                    .ToList();
                
                List<BookReview> bookReviews = await _context.BookReviews
                    .Include(br => br.Tones)
                    .Where(br => allBookReviewIds.Contains(br.Id))
                    .ToListAsync();

                List<Tone> allTones = await _context.Tones.ToListAsync();

                // Update tone assignments for books without tones
                foreach (BookReviewToneItem bookReviewModel in model.BookReviews)
                {
                    BookReview? bookReview = bookReviews.FirstOrDefault(br => br.Id == bookReviewModel.Id);
                    
                    // Clear existing tone assignments
                    bookReview?.Tones.Clear();
                    
                    // Add new tone assignments
                    List<Tone> selectedTones = allTones.Where(t => bookReviewModel.AssignedToneIds.Contains(t.Id)).ToList();
                    foreach (Tone tone in selectedTones)
                        bookReview?.Tones.Add(tone);
                }

                // Update tone assignments for books with tones (accordion section)
                foreach (BookReviewToneItem bookReviewModel in model.BooksWithTones)
                {
                    BookReview? bookReview = bookReviews.FirstOrDefault(br => br.Id == bookReviewModel.Id);
                    
                    // Clear existing tone assignments
                    bookReview?.Tones.Clear();
                    
                    // Add new tone assignments
                    List<Tone> selectedTones = allTones.Where(t => bookReviewModel.AssignedToneIds.Contains(t.Id)).ToList();
                    foreach (Tone tone in selectedTones)
                        bookReview?.Tones.Add(tone);
                }

                await _context.SaveChangesAsync();
                TempData["SuccessMessage"] = "Tone assignments saved successfully.";
                
                return RedirectToAction(nameof(ToneAssignment));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error saving tone assignments");
                ModelState.AddModelError("", "An error occurred while saving the tone assignments.");
                TempData["ErrorMessage"] = "An error occurred while saving the tone assignments.";
                return await ToneAssignment();
            }
        }

        /// <summary>
        /// Gets the genres for a book review based on its bookshelf groupings
        /// </summary>
        /// <param name="bookReview">The book review to get genres for</param>
        /// <returns>List of genre names</returns>
        private List<string> GetBookGenres(BookReview bookReview)
        {
            return bookReview.Bookshelves
                .SelectMany(bs => bs.BookshelfGroupings)
                .Select(bg => bg.Name)
                .Distinct()
                .OrderBy(name => name)
                .ToList();
        }

        /// <summary>
        /// Analyzes a book review to suggest appropriate tones based on bookshelf tags, review content, and genre associations.
        /// </summary>
        /// <param name="bookReview">The book review to analyze</param>
        /// <param name="allTones">All available tones for matching</param>
        /// <param name="genreToneAssociations">Genre-tone associations for genre-based suggestions</param>
        /// <returns>List of suggested tone IDs</returns>
        private List<int> GetSuggestedTones(BookReview bookReview, List<Tone> allTones, List<GenreToneAssociation> genreToneAssociations)
        {
            HashSet<int> suggestions = new HashSet<int>();
            
            // Get bookshelf names for matching
            List<string> bookshelfNames = bookReview.Bookshelves.Select(bs => bs.Name.ToLower()).ToList();
            string searchableContent = (bookReview.SearchableString ?? "").ToLower();
            string reviewContent = (bookReview.MyReview ?? "").ToLower();
            
            // Get genres for this book
            List<string> genres = GetBookGenres(bookReview);
            
            foreach (Tone tone in allTones.Concat(allTones.SelectMany(t => t.Subtones)))
            {
                string toneName = tone.Name.ToLower();
                
                // Check if tone name matches bookshelf names
                if (bookshelfNames.Any(bn => bn.Contains(toneName)))
                {
                    suggestions.Add(tone.Id);
                    continue;
                }
                
                // Check if tone name appears in searchable content
                if (searchableContent.Contains(toneName))
                {
                    suggestions.Add(tone.Id);
                    continue;
                }
                
                // Check if tone name appears in review content
                if (reviewContent.Contains(toneName))
                {
                    suggestions.Add(tone.Id);
                    continue;
                }
                
                // Check genre-based suggestions
                foreach (string genre in genres)
                {
                    GenreToneAssociation? association = genreToneAssociations.FirstOrDefault(gta => 
                        gta.Genre.Equals(genre, StringComparison.OrdinalIgnoreCase));
                    if (association != null && association.Tones.Any(t => 
                        t.Equals(tone.Name, StringComparison.OrdinalIgnoreCase)))
                    {
                        suggestions.Add(tone.Id);
                        break;
                    }
                }
            }
            
            return suggestions.ToList();
        }

        /// <summary>
        /// Returns a CSS class name for color coding tone groups based on the tone's index.
        /// </summary>
        /// <param name="toneIndex">The index of the tone in the list of parent tones. Used to consistently assign colors. Special case of -1 for 
        /// tones that don't have a parent tone (i.e. are not subtones).</param>
        /// <returns>CSS class name for the tone group color. Returns "tone-grey" for tones that don't have a parent tone (i.e. are not subtones), 
        /// otherwise returns one of 8 predefined color classes.</returns>
        private string GetColorClassForTone(int toneIndex)
        {
            // Special case for tones that don't have a parent tone (i.e. are not subtones)
            if (toneIndex == -1)
                return "tone-grey";

            // Generate consistent pastel colors based on tone index
            string[] colors = new[] { "tone-blue", "tone-purple",  "tone-aqua",  "tone-teal", "tone-orange", "tone-pink", "tone-yellow", "tone-green", "tone-red" };
            return colors[toneIndex];
        }

        /// <summary>
        /// Returns a list of genre-tone associations for suggesting tones based on book genres.
        /// </summary>
        /// <returns>List of genre-tone associations</returns>
        private List<GenreToneAssociation> GetGenreToneAssociations()
        {
            return new List<GenreToneAssociation>
            {
                new GenreToneAssociation
                {
                    Genre = "Fantasy",
                    Tones = new List<string> { "Epic", "Heroic", "Mystical", "Atmospheric", "Poignant", "Dark", "Bittersweet", "Whimsical", "Dramatic", "Haunting" }
                },
                new GenreToneAssociation
                {
                    Genre = "Science Fiction",
                    Tones = new List<string> { "Philosophical", "Epic", "Psychological", "Intense", "Suspenseful", "Dark", "Realistic", "Surreal", "Bittersweet", "Uplifting" }
                },
                new GenreToneAssociation
                {
                    Genre = "Historical Fiction",
                    Tones = new List<string> { "Poignant", "Melancholic", "Bittersweet", "Heartwarming", "Tragic", "Realistic", "Dramatic", "Atmospheric", "Haunting", "Romantic", "Gritty", "Detached" }
                },
                new GenreToneAssociation
                {
                    Genre = "Thriller",
                    Tones = new List<string> { "Intense", "Suspenseful", "Psychological", "Dark", "Gritty", "Claustrophobic", "Dramatic", "Cynical", "Disturbing", "Detached" }
                },
                new GenreToneAssociation
                {
                    Genre = "Horror",
                    Tones = new List<string> { "Horrific", "Disturbing", "Macabre", "Grotesque", "Claustrophobic", "Haunting", "Dark", "Psychological", "Surreal", "Unsettling", "Tragic" }
                },
                new GenreToneAssociation
                {
                    Genre = "Contemporary",
                    Tones = new List<string> { "Realistic", "Detached", "Poignant", "Heartwarming", "Bittersweet", "Romantic", "Angsty", "Sweet", "Playful", "Uplifting" }
                },
                new GenreToneAssociation
                {
                    Genre = "Literary",
                    Tones = new List<string> { "Poignant", "Melancholic", "Bittersweet", "Psychological", "Detached", "Philosophical", "Realistic", "Dark", "Tragic", "Haunting" }
                },
                new GenreToneAssociation
                {
                    Genre = "Romance",
                    Tones = new List<string> { "Romantic", "Steamy", "Sweet", "Angsty", "Flirty", "Poignant", "Heartwarming", "Uplifting", "Playful", "Bittersweet", "Whimsical", "Dramatic" }
                },
                new GenreToneAssociation
                {
                    Genre = "Mystery",
                    Tones = new List<string> { "Suspenseful", "Psychological", "Dark", "Intense", "Realistic", "Gritty", "Detached", "Hard-boiled", "Atmospheric", "Dramatic" }
                },
                new GenreToneAssociation
                {
                    Genre = "Magical Realism",
                    Tones = new List<string> { "Surreal", "Mystical", "Lyrical", "Poignant", "Haunting", "Bittersweet", "Whimsical", "Atmospheric", "Philosophical", "Playful", "Detached" }
                },
                new GenreToneAssociation
                {
                    Genre = "Fairy Tale",
                    Tones = new List<string> { "Whimsical", "Mystical", "Atmospheric", "Romantic", "Heroic", "Poignant", "Heartwarming", "Playful", "Dark", "Tragic" }
                },
                new GenreToneAssociation
                {
                    Genre = "Humor",
                    Tones = new List<string> { "Playful", "Flirty", "Sweet", "Whimsical", "Upbeat", "Cynical", "Detached", "Dramatic", "Realistic" }
                },
                new GenreToneAssociation
                {
                    Genre = "Children's",
                    Tones = new List<string> { "Whimsical", "Playful", "Cozy", "Heartwarming", "Sweet", "Hopeful", "Uplifting", "Mystical", "Dramatic", "Poignant", "Atmospheric" }
                },
                new GenreToneAssociation
                {
                    Genre = "Dystopian",
                    Tones = new List<string> { "Dark", "Bleak", "Gritty", "Cynical", "Disturbing", "Grimdark", "Intense", "Suspenseful", "Tragic", "Poignant", "Haunting", "Philosophical", "Epic" }
                },
                new GenreToneAssociation
                {
                    Genre = "Paranormal",
                    Tones = new List<string> { "Mystical", "Haunting", "Dark", "Romantic", "Tragic", "Suspenseful", "Atmospheric", "Psychological", "Grotesque", "Poignant" }
                },
                new GenreToneAssociation
                {
                    Genre = "Crime",
                    Tones = new List<string> { "Gritty", "Hard-boiled", "Suspenseful", "Intense", "Dark", "Detached", "Realistic", "Cynical", "Psychological", "Dramatic", "Disturbing" }
                },
                new GenreToneAssociation
                {
                    Genre = "Classics",
                    Tones = new List<string> { "Philosophical", "Poignant", "Tragic", "Melancholic", "Detached", "Psychological", "Realistic", "Epic", "Bittersweet", "Romantic", "Cynical", "Haunting" }
                }
            };
        }
        #endregion

    }
}
