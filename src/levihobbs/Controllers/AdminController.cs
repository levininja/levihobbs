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
        
        public async Task<IActionResult> BookshelfConfiguration()
        {
            var bookshelves = await _context.Bookshelves
                .OrderBy(bs => bs.DisplayName ?? bs.Name)
                .ToListAsync();
                
            var groupings = await _context.BookshelfGroupings
                .Include(bg => bg.Bookshelves)
                .OrderBy(bg => bg.DisplayName ?? bg.Name)
                .ToListAsync();
                
            var viewModel = new BookshelfConfigurationViewModel
            {
                EnableCustomMappings = bookshelves.Any(bs => bs.Display.HasValue),
                Bookshelves = bookshelves.Select(bs => new BookshelfDisplayItem
                {
                    Id = bs.Id,
                    Name = bs.Name,
                    DisplayName = bs.DisplayName,
                    Display = bs.Display ?? false
                }).ToList(),
                Groupings = groupings.Select(bg => new BookshelfGroupingItem
                {
                    Id = bg.Id,
                    Name = bg.Name,
                    DisplayName = bg.DisplayName,
                    SelectedBookshelfIds = bg.Bookshelves.Select(bs => bs.Id).ToList()
                }).ToList()
            };
            
            return View(viewModel);
        }
        
        [HttpPost]
        public async Task<IActionResult> BookshelfConfiguration(BookshelfConfigurationViewModel model)
        {
            try
            {
                _logger.LogInformation("POST to BookshelfConfiguration received. Model details:");
                _logger.LogInformation("EnableCustomMappings: {EnableCustomMappings}", model.EnableCustomMappings);
                _logger.LogInformation("Number of groupings in model: {GroupingCount}", model.Groupings.Count);
                
                foreach (var grouping in model.Groupings)
                {
                    _logger.LogInformation("Grouping details - Id: {Id}, Name: {Name}, DisplayName: {DisplayName}, SelectedBookshelfIds: {SelectedIds}", 
                        grouping.Id, 
                        grouping.Name, 
                        grouping.DisplayName ?? "null",
                        string.Join(", ", grouping.SelectedBookshelfIds));
                }
                
                _logger.LogInformation("Starting BookshelfConfiguration save. Model has {GroupingCount} groupings", model.Groupings.Count);
                
                // Update bookshelf display settings
                var bookshelves = await _context.Bookshelves.ToListAsync();
                _logger.LogInformation("Found {BookshelfCount} bookshelves in database", bookshelves.Count);
                
                if (model.EnableCustomMappings)
                {
                    foreach (var bookshelf in bookshelves)
                    {
                        var displayItem = model.Bookshelves.FirstOrDefault(b => b.Id == bookshelf.Id);
                        bookshelf.Display = displayItem?.Display ?? false;
                    }
                }
                else
                {
                    // Reset all display settings to null when custom mappings are disabled
                    foreach (var bookshelf in bookshelves)
                    {
                        bookshelf.Display = null;
                    }
                }
                
                // Handle groupings
                var existingGroupings = await _context.BookshelfGroupings
                    .Include(bg => bg.Bookshelves)
                    .ToListAsync();
                _logger.LogInformation("Found {ExistingGroupingCount} existing groupings in database", existingGroupings.Count);
                
                // Only remove groupings that are explicitly marked for removal
                var groupingsToRemove = existingGroupings
                    .Where(eg => model.Groupings.Any(mg => mg.Id == eg.Id && mg.ShouldRemove))
                    .ToList();
                _logger.LogInformation("Removing {GroupingRemoveCount} groupings", groupingsToRemove.Count);
                    
                _context.BookshelfGroupings.RemoveRange(groupingsToRemove);
                
                // Update or create groupings
                foreach (var groupingModel in model.Groupings)
                {
                    _logger.LogInformation("Processing grouping: {GroupingName} with {SelectedCount} selected bookshelves", 
                        groupingModel.Name, groupingModel.SelectedBookshelfIds.Count);
                    
                    BookshelfGrouping grouping;
                    
                    if (groupingModel.Id > 0)
                    {
                        grouping = existingGroupings.First(eg => eg.Id == groupingModel.Id);
                        grouping.Name = groupingModel.Name;
                        grouping.DisplayName = groupingModel.DisplayName;
                        grouping.Bookshelves.Clear();
                        _logger.LogInformation("Updating existing grouping with ID {GroupingId}", grouping.Id);
                    }
                    else
                    {
                        grouping = new BookshelfGrouping
                        {
                            Name = groupingModel.Name,
                            DisplayName = groupingModel.DisplayName
                        };
                        _context.BookshelfGroupings.Add(grouping);
                        _logger.LogInformation("Creating new grouping: {GroupingName}", grouping.Name);
                    }
                    
                    // Add selected bookshelves to the grouping
                    var selectedBookshelves = bookshelves
                        .Where(bs => groupingModel.SelectedBookshelfIds?.Contains(bs.Id) ?? false)
                        .ToList();
                    _logger.LogInformation("Found {SelectedCount} bookshelves to add to grouping", selectedBookshelves.Count);
                        
                    foreach (var bookshelf in selectedBookshelves)
                    {
                        grouping.Bookshelves.Add(bookshelf);
                    }
                }
                
                var saveResult = await _context.SaveChangesAsync();
                _logger.LogInformation("SaveChangesAsync returned {SaveResult} changes", saveResult);
                ViewBag.SuccessMessage = "Bookshelf configuration saved successfully.";
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error saving bookshelf configuration");
                ModelState.AddModelError("", "An error occurred while saving the configuration.");
            }
            
            return await BookshelfConfiguration();
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
                .Select(r => new { r.Title, r.AuthorFirstName, r.AuthorLastName })
                .ToListAsync();
            
            List<Bookshelf> existingBookshelves = await _context.Bookshelves.ToListAsync();
            
            int importedCount = 0;
            int duplicateCount = 0;
            int skippedToReadCount = 0;
            
            using CsvReader csv = new CsvReader(reader, config);
            List<GoodreadsBookReviewCsv> records = csv.GetRecords<GoodreadsBookReviewCsv>().ToList();
            
            for (int i = 0; i < records.Count; i++)
            {
                GoodreadsBookReviewCsv row = records[i];
                
                // Check header on first iteration; this can't be done before the loop begins
                // because of how stream readers work.
                if (i == 0)
                    ValidateCsvHeader(csv, requiredColumns);
                
                // Skip rows that contain "to-read" in bookshelves
                if (!string.IsNullOrEmpty(row.Bookshelves) && 
                    row.Bookshelves.Split(',').Any(shelf => shelf.Trim().ToLower() == "to-read"))
                {
                    skippedToReadCount++;
                    continue;
                }
                
                // All GoodReads books with reviews also have exclusive shelf "read".
                if (row.Exclusive_Shelf?.ToString() != "read")
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
                
                // Parse ratings
                int.TryParse(row.My_Rating, out int myRating);
                decimal.TryParse(row.Average_Rating, out decimal avgRating);
                
                // Validate ratings
                if (myRating < 0 || myRating > 5)
                {
                    _logger.LogWarning("Skipping book '{Title}' - Invalid rating: {Rating}", row.Title, myRating);
                    continue;
                }
                
                // Parse other numeric fields
                int.TryParse(row.Number_of_Pages, out int pages);
                int.TryParse(row.Original_Publication_Year, out int pubYear);
                
                // Parse date
                DateTime dateRead = DateTime.UtcNow;
                if (DateTime.TryParse(row.Date_Read, out DateTime parsedDate))
                    dateRead = DateTime.SpecifyKind(parsedDate, DateTimeKind.Utc);
                
                // Check for existing review in memory
                bool reviewExists = existingReviews.Any(r => 
                    r.Title == row.Title && 
                    r.AuthorFirstName == firstName && 
                    r.AuthorLastName == lastName);
                
                if (reviewExists)
                {
                    duplicateCount++;
                    continue;
                }
                
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
                
                // Import bookshelves, if they don't already exist
                if (!string.IsNullOrEmpty(row.Bookshelves))
                {
                    List<string> shelfNames = row.Bookshelves.Split(',', StringSplitOptions.RemoveEmptyEntries)
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
                
                _context.BookReviews.Add(bookReview);
                importedCount++;
            }
            
            await _context.SaveChangesAsync();
            ViewBag.DuplicateCount = duplicateCount;
            ViewBag.SkippedToReadCount = skippedToReadCount;
            return importedCount;
        }

        private string BuildSearchableString(string title, string firstName, string lastName, 
            string? additionalAuthors, string? publisher, string? bookshelves)
        {
            var searchableParts = new List<string>();
            
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
                var processedShelves = ProcessBookshelvesForSearch(bookshelves);
                if (!string.IsNullOrEmpty(processedShelves))
                    searchableParts.Add(processedShelves);
            }
            
            return string.Join(" ", searchableParts.Where(p => !string.IsNullOrEmpty(p))).ToLower();
        }

        private string ProcessBookshelvesForSearch(string bookshelves)
        {
            var excludedShelves = new HashSet<string> 
            { 
                "to-read", "to-look-into", "currently-reading", 
                "decided-not-to-read", "anticipating-release" 
            };
            
            var synonymMap = new Dictionary<string, string>
            {
                { "sf", "Science Fiction Sci-Fi Scifi" }
            };
            
            var shelves = bookshelves.Split(',', StringSplitOptions.RemoveEmptyEntries)
                .Select(s => s.Trim().ToLower())
                .Where(s => !excludedShelves.Contains(s))
                .Select(s => s.Replace('-', ' '))
                .Select(s => synonymMap.ContainsKey(s) ? synonymMap[s] : s)
                .Where(s => !string.IsNullOrEmpty(s));
            
            return string.Join(" ", shelves);
        }

        private void ValidateCsvHeader(CsvReader csv, string[] requiredColumns)
        {
            var header = csv.HeaderRecord;
            if (header == null)
                throw new Exception("CSV file is missing header row");
            
            var missingColumns = requiredColumns
                .Where(col => !header.Contains(col))
                .ToList();
                
            if (missingColumns.Any())
                throw new Exception($"CSV file is missing required columns: {string.Join(", ", missingColumns)}");
        }
    }
}
