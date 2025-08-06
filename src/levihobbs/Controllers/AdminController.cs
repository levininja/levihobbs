using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using levihobbs.Data;
using levihobbs.Models;
using levihobbs.Services;

namespace levihobbs.Controllers
{
    public class AdminController : Controller
    {
        private readonly ILogger<AdminController> _logger;
        private readonly ApplicationDbContext _context;
        private readonly IBookDataApiService _bookDataApiService;
        
        public AdminController(
            ILogger<AdminController> logger,
            ApplicationDbContext context,
            IBookDataApiService bookDataApiService)
        {
            _logger = logger;
            _context = context;
            _bookDataApiService = bookDataApiService;
        }
        
        public IActionResult Index()
        {
            return View();
        }

        #region Bookshelf Configuration
        public async Task<IActionResult> BookshelfConfiguration()
        {
            try
            {
                var viewModel = await _bookDataApiService.GetBookshelfConfigurationAsync();
                return View(viewModel);
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(ex, "Cannot connect to book-data-api");
                TempData["Error"] = "Cannot connect to book-data-api. Please ensure book-data-api is running on port 5020.";
                return View(new BookshelfConfigurationViewModel());
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching bookshelf configuration");
                TempData["Error"] = "An error occurred while fetching bookshelf configuration.";
                return View(new BookshelfConfigurationViewModel());
            }
        }

        [HttpPost]
        public async Task<IActionResult> UpdateBookshelfConfiguration(BookshelfConfigurationViewModel model)
        {
            try
            {
                var success = await _bookDataApiService.UpdateBookshelfConfigurationAsync(model);
                if (success)
                {
                    TempData["Success"] = "Bookshelf configuration updated successfully.";
                }
                else
                {
                    TempData["Error"] = "Failed to update bookshelf configuration. Please ensure book-data-api is running on port 5020.";
                }
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(ex, "Cannot connect to book-data-api");
                TempData["Error"] = "Cannot connect to book-data-api. Please ensure book-data-api is running on port 5020.";
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating bookshelf configuration");
                TempData["Error"] = "An error occurred while updating bookshelf configuration.";
            }
            
            return RedirectToAction(nameof(BookshelfConfiguration));
        }
        #endregion

        #region Tone Configuration
        public async Task<IActionResult> ToneConfiguration()
        {
            try
            {
                var viewModel = await _bookDataApiService.GetToneConfigurationAsync();
                return View(viewModel);
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(ex, "Cannot connect to book-data-api");
                TempData["Error"] = "Cannot connect to book-data-api. Please ensure book-data-api is running on port 5020.";
                return View(new ToneConfigurationViewModel());
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching tone configuration");
                TempData["Error"] = "An error occurred while fetching tone configuration.";
                return View(new ToneConfigurationViewModel());
            }
        }

        [HttpPost]
        public async Task<IActionResult> UpdateToneConfiguration(ToneConfigurationViewModel model)
        {
            try
            {
                var success = await _bookDataApiService.UpdateToneConfigurationAsync(model);
                if (success)
                {
                    TempData["Success"] = "Tone configuration updated successfully.";
                }
                else
                {
                    TempData["Error"] = "Failed to update tone configuration. Please ensure book-data-api is running on port 5020.";
                }
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(ex, "Cannot connect to book-data-api");
                TempData["Error"] = "Cannot connect to book-data-api. Please ensure book-data-api is running on port 5020.";
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating tone configuration");
                TempData["Error"] = "An error occurred while updating tone configuration.";
            }
            
            return RedirectToAction(nameof(ToneConfiguration));
        }
        #endregion

        #region Tone Assignment
        public async Task<IActionResult> ToneAssignment()
        {
            try
            {
                var viewModel = await _bookDataApiService.GetToneAssignmentAsync();
                return View(viewModel);
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(ex, "Cannot connect to book-data-api");
                TempData["Error"] = "Cannot connect to book-data-api. Please ensure book-data-api is running on port 5020.";
                return View(new ToneAssignmentViewModel());
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching tone assignment");
                TempData["Error"] = "An error occurred while fetching tone assignment.";
                return View(new ToneAssignmentViewModel());
            }
        }

        [HttpPost]
        public async Task<IActionResult> UpdateToneAssignment(ToneAssignmentViewModel model)
        {
            try
            {
                var success = await _bookDataApiService.UpdateToneAssignmentAsync(model);
                if (success)
                {
                    TempData["Success"] = "Tone assignment updated successfully.";
                }
                else
                {
                    TempData["Error"] = "Failed to update tone assignment. Please ensure book-data-api is running on port 5020.";
                }
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(ex, "Cannot connect to book-data-api");
                TempData["Error"] = "Cannot connect to book-data-api. Please ensure book-data-api is running on port 5020.";
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating tone assignment");
                TempData["Error"] = "An error occurred while updating tone assignment.";
            }
            
            return RedirectToAction(nameof(ToneAssignment));
        }
        #endregion

        #region Import Book Reviews
        public IActionResult ImportBookReviews()
        {
            return View(ModelState);
        }

        [HttpPost]
        public async Task<IActionResult> ImportBookReviews(IFormFile file)
        {
            if (file == null || file.Length == 0)
            {
                TempData["Error"] = "Please select a file to upload.";
                return RedirectToAction(nameof(ImportBookReviews));
            }

            try
            {
                var success = await _bookDataApiService.ImportBookReviewsAsync(file);
                if (success)
                {
                    TempData["Success"] = "Book reviews imported successfully.";
                }
                else
                {
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
            
            return RedirectToAction(nameof(ImportBookReviews));
        }
        #endregion
    }
}
