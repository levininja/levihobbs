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
        public async Task<IActionResult> ImportBookReviews(IFormFile file)
        {
            if (file == null || file.Length == 0)
            {
                ModelState.AddModelError("", "No file uploaded");
                return View(ModelState);
            }
            
            // Check if file is CSV
            string? fileName = file?.FileName;
            if (fileName == null || !fileName.EndsWith(".csv", StringComparison.OrdinalIgnoreCase))
            {
                ModelState.AddModelError("", "Please upload a CSV file");
                return View(ModelState);
            }
            
            try
            {
                int importResult = await ProcessCsvFile(file);
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
        
        private async Task<int> ProcessCsvFile(IFormFile file)
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
            
            using CsvReader csv = new CsvReader(reader, config);
            List<GoodreadsBookReviewCsv> records = csv.GetRecords<GoodreadsBookReviewCsv>().ToList();
            
            string[] requiredColumns = new[] 
            { 
                "Title", "Author l-f", "My Rating", "Average Rating", 
                "Number of Pages", "Original Publication Year", "Date Read", 
                "Bookshelves", "Exclusive Shelf", "My Review" 
            };
            
            // Load existing reviews once
            var existingReviews = await _context.BookReviews
                .Select(r => new { r.Title, r.AuthorFirstName, r.AuthorLastName })
                .ToListAsync();
            
            int importedCount = 0;
            int duplicateCount = 0;
            
            for (int i = 0; i < records.Count; i++)
            {
                GoodreadsBookReviewCsv row = records[i];
                
                // Check header on first iteration; this can't be done before the loop begins
                // because of how stream readers work.
                if (i == 0)
                    ValidateCsvHeader(csv, requiredColumns);
                
                // Skip rows that don't have Exclusive Shelf = "read"
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
                    Bookshelves = row.Bookshelves ?? "",
                    MyReview = row.My_Review ?? ""
                };
                
                _context.BookReviews.Add(bookReview);
                importedCount++;
            }
            
            await _context.SaveChangesAsync();
            ViewBag.DuplicateCount = duplicateCount;
            return importedCount;
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
