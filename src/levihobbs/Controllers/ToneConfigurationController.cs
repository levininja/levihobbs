using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using levihobbs.Data;
using levihobbs.Models;
using levihobbs.Services;
using BookDataApi.Shared.Dtos;

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
                return View(new List<ToneItemDto>());
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching tone configuration");
                TempData["Error"] = "An error occurred while fetching tone configuration.";
                return View(new List<ToneItemDto>());
            }
        }

        [HttpPost]
        public async Task<IActionResult> Update(List<ToneItemDto> tones)
        {
            _logger.LogInformation("ToneConfiguration Update POST received. Request body count: {ToneCount}", tones?.Count ?? 0);
            
            // Log the incoming tones data
            if (tones != null && tones.Any())
            {
                foreach (var tone in tones)
                {
                    _logger.LogInformation("Tone received - Id: {ToneId}, Name: {ToneName}, Description: {Description}, ParentId: {ParentId}, SubtonesCount: {SubtonesCount}", 
                        tone.Id, tone.Name, tone.Description, tone.ParentId, tone.Subtones?.Count ?? 0);
                }
            }
            else
            {
                _logger.LogWarning("No tones data received in POST request");
            }

            try
            {
                _logger.LogInformation("Calling book-data-api UpdateToneConfigurationAsync");
                var success = await _bookDataApiService.UpdateToneConfigurationAsync(tones ?? new List<ToneItemDto>());
                _logger.LogInformation("UpdateToneConfigurationAsync completed with result: {Success}", success);
                
                if (success)
                {
                    _logger.LogInformation("Tone configuration updated successfully");
                    TempData["Success"] = "Tone configuration updated successfully.";
                }
                else
                {
                    _logger.LogWarning("Failed to update tone configuration - API returned false");
                    TempData["Error"] = "Failed to update tone configuration. Please ensure book-data-api is running on port 5020.";
                }
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(ex, "Cannot connect to book-data-api. Status: {StatusCode}, Message: {Message}", 
                    ex.StatusCode, ex.Message);
                TempData["Error"] = "Cannot connect to book-data-api. Please ensure book-data-api is running on port 5020.";
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error updating tone configuration. Exception type: {ExceptionType}, Message: {Message}", 
                    ex.GetType().Name, ex.Message);
                TempData["Error"] = "An error occurred while updating tone configuration.";
            }
            
            _logger.LogInformation("ToneConfiguration Update POST completed, redirecting to Index");
            return RedirectToAction(nameof(Index));
        }
    }
} 