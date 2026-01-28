using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using levihobbs.Data;
using levihobbs.Models;
using levihobbs.Services;

namespace levihobbs.Controllers
{
    public class ImportBookReviewsController : Controller, IAdminController
    {
        private readonly ILogger<ImportBookReviewsController> _logger;
        private readonly ApplicationDbContext _context;
        private readonly IBookDataApiService _bookDataApiService;
        
        public ImportBookReviewsController(
            ILogger<ImportBookReviewsController> logger,
            ApplicationDbContext context,
            IBookDataApiService bookDataApiService)
        {
            _logger = logger;
            _context = context;
            _bookDataApiService = bookDataApiService;
        }

        public IActionResult Index()
        {
            return View(ModelState);
        }

        [HttpPost]
        public async Task<IActionResult> Import(IFormFile file)
        {
            if (file == null || file.Length == 0)
            {
                TempData["Error"] = "Please select a file to upload.";
                return RedirectToAction(nameof(Index));
            }

            try
            {
                var result = await _bookDataApiService.ImportBookReviewsAsync(file);
                if (result.Success)
                {
                    if (result.DuplicateCount > 0)
                        TempData["DuplicateCount"] = result.DuplicateCount;

                    if (result.ImportedCount > 0)
                        TempData["Success"] = $"Imported {result.ImportedCount} book reviews successfully.";
                    else if (!string.IsNullOrWhiteSpace(result.Message))
                        TempData["Success"] = result.Message;
                    else
                        TempData["Success"] = "Book reviews import completed, but no new reviews were added.";
                }
                else
                {
                    if (!string.IsNullOrWhiteSpace(result.Message))
                        TempData["Error"] = result.Message;
                    else
                        TempData["Error"] = "Failed to import book reviews. Please ensure book-data-api is running on port 5020.";
                }
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(ex, "Cannot connect to book-data-api");
                TempData["Error"] = "Cannot connect to book-data-api. Please ensure book-data-api is running on port 5020.";
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error importing book reviews");
                TempData["Error"] = "An error occurred while importing book reviews.";
            }
            
            return RedirectToAction(nameof(Index));
        }
    }
} 
