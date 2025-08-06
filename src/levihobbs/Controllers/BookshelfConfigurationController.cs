using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using levihobbs.Data;
using levihobbs.Models;
using levihobbs.Services;
using BookDataApi.Dtos;

namespace levihobbs.Controllers
{
    public class BookshelfConfigurationController : Controller, IAdminController
    {
        private readonly ILogger<BookshelfConfigurationController> _logger;
        private readonly ApplicationDbContext _context;
        private readonly IBookDataApiService _bookDataApiService;
        
        public BookshelfConfigurationController(
            ILogger<BookshelfConfigurationController> logger,
            ApplicationDbContext context,
            IBookDataApiService bookDataApiService)
        {
            _logger = logger;
            _context = context;
            _bookDataApiService = bookDataApiService;
        }

        public async Task<IActionResult> Index()
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
                return View(new BookshelfConfigurationDto());
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching bookshelf configuration");
                TempData["Error"] = "An error occurred while fetching bookshelf configuration.";
                return View(new BookshelfConfigurationDto());
            }
        }

        [HttpPost]
        public async Task<IActionResult> Update(BookshelfConfigurationDto model)
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
            
            return RedirectToAction(nameof(Index));
        }
    }
} 