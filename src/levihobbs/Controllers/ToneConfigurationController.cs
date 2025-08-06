using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using levihobbs.Data;
using levihobbs.Models;
using levihobbs.Services;

namespace levihobbs.Controllers
{
    public class ToneConfigurationController : Controller, IAdminController
    {
        private readonly ILogger<ToneConfigurationController> _logger;
        private readonly ApplicationDbContext _context;
        private readonly IBookDataApiService _bookDataApiService;
        
        public ToneConfigurationController(
            ILogger<ToneConfigurationController> logger,
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
        public async Task<IActionResult> Update(ToneConfigurationViewModel model)
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
            
            return RedirectToAction(nameof(Index));
        }
    }
} 