using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using levihobbs.Data;
using levihobbs.Models;
using levihobbs.Services;
using BookDataApi.Dtos;

namespace levihobbs.Controllers
{
    public class ToneAssignmentController : Controller, IAdminController
    {
        private readonly ILogger<ToneAssignmentController> _logger;
        private readonly ApplicationDbContext _context;
        private readonly IBookDataApiService _bookDataApiService;
        
        public ToneAssignmentController(
            ILogger<ToneAssignmentController> logger,
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
                var viewModel = await _bookDataApiService.GetToneAssignmentAsync();
                return View(viewModel);
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(ex, "Cannot connect to book-data-api");
                TempData["Error"] = "Cannot connect to book-data-api. Please ensure book-data-api is running on port 5020.";
                return View(new ToneAssignmentDto());
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching tone assignment");
                TempData["Error"] = "An error occurred while fetching tone assignment.";
                return View(new ToneAssignmentDto());
            }
        }

        [HttpPost]
        public async Task<IActionResult> Update(ToneAssignmentDto model)
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
            
            return RedirectToAction(nameof(Index));
        }
    }
} 