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
                // Get tone assignment data (which includes the tones)
                ToneAssignmentDto toneAssignmentData = await _bookDataApiService.GetToneAssignmentAsync();
                
                // Use the tones from the assignment data instead of making a separate API call
                List<ToneItemDto> tones = toneAssignmentData.Tones ?? new List<ToneItemDto>();
                
                // Create tone color groupings
                List<ToneColorGrouping> toneColorGroupings = CreateToneColorGroupings(tones);
                
                // Create the ViewModel with all the data
                ToneAssignmentViewModel viewModel = new ToneAssignmentViewModel
                {
                    BookReviews = toneAssignmentData.BookReviews ?? new List<BookReviewToneItemDto>(),
                    BooksWithTones = toneAssignmentData.BooksWithTones ?? new List<BookReviewToneItemDto>(),
                    ToneColorGroupings = toneColorGroupings
                };

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

        /// <summary>
        /// Creates tone color groupings for display in the tone assignment interface.
        /// Groups parent tones with their subtones and creates a separate group for standalone tones.
        /// </summary>
        /// <param name="allTones">List of all tones from the API</param>
        /// <returns>List of tone color groupings</returns>
        private List<ToneColorGrouping> CreateToneColorGroupings(List<ToneItemDto> allTones)
        {
            const string otherTonesGroupName = "Other Tones";
            
            // Find parent tones with subtones
            var parentTonesWithSubtones = allTones.Where(pt => pt.Subtones.Any()).ToList();
            
            // Put the tone groupings together
            List<ToneColorGrouping> toneColorGroupings = parentTonesWithSubtones.Select((pt, index) => 
            {
                var grouping = new ToneColorGrouping
                {
                    Name = pt.Name,
                    DisplayName = pt.Name,
                    ColorClass = GetColorClassForTone(index),
                    Tones = new[] { pt }.Concat(pt.Subtones.OrderBy(st => st.Name))
                        .Select(t => new Tone
                        {
                            Id = t.Id,
                            Name = t.Name,
                            Description = t.Description
                        }).ToList()
                };
                
                return grouping;
            }).ToList();

            // Find standalone tones
            var standaloneTones = allTones.Where(pt => !pt.Subtones.Any() && pt.ParentId == null).ToList();
            
            // Add a group for all stand-alone tones that don't have children
            var otherTonesGrouping = new ToneColorGrouping
            {
                Name = otherTonesGroupName,
                DisplayName = otherTonesGroupName,
                ColorClass = GetColorClassForTone(-1), // -1 is a special case for the uncategorized tones group
                Tones = standaloneTones.Select(pt => new Tone {
                    Id = pt.Id,
                    Name = pt.Name,
                    Description = pt.Description
                }).ToList()
            };
            
            toneColorGroupings.Add(otherTonesGrouping);

            return toneColorGroupings;
        }

        [HttpPost]
        public async Task<IActionResult> Update(ToneAssignmentViewModel model)
        {
            _logger.LogInformation("ToneAssignment Update POST received");
            _logger.LogInformation("Model validation state: {IsValid}", ModelState.IsValid);
            
            if (!ModelState.IsValid)
            {
                _logger.LogWarning("Model state is invalid. Errors:");
                foreach (var error in ModelState.Values.SelectMany(v => v.Errors))
                {
                    _logger.LogWarning("Validation error: {ErrorMessage}", error.ErrorMessage);
                }
            }
            
            _logger.LogInformation("BookReviews count: {Count}", model.BookReviews?.Count ?? 0);
            _logger.LogInformation("BooksWithTones count: {Count}", model.BooksWithTones?.Count ?? 0);
            
            // Log details about the first book review as an example
            if (model.BookReviews != null && model.BookReviews.Any())
            {
                var firstBook = model.BookReviews.First();
                _logger.LogInformation("First BookReview {Id} ({Title}) - AssignedToneIds: [{ToneIds}]", 
                    firstBook.Id, firstBook.Title, string.Join(", ", firstBook.AssignedToneIds));
            }
            
            if (model.BooksWithTones != null && model.BooksWithTones.Any())
            {
                var firstBookWithTones = model.BooksWithTones.First();
                _logger.LogInformation("First BookWithTones {Id} ({Title}) - AssignedToneIds: [{ToneIds}]", 
                    firstBookWithTones.Id, firstBookWithTones.Title, string.Join(", ", firstBookWithTones.AssignedToneIds));
            }
            
            try
            {
                // Convert ViewModel back to DTO for API call
                ToneAssignmentDto dto = new ToneAssignmentDto
                {
                    BookReviews = model.BookReviews,
                    BooksWithTones = model.BooksWithTones
                };
                
                _logger.LogInformation("Calling book-data-api UpdateToneAssignmentAsync");
                var success = await _bookDataApiService.UpdateToneAssignmentAsync(dto);
                _logger.LogInformation("UpdateToneAssignmentAsync result: {Success}", success);
                
                if (success)
                {
                    _logger.LogInformation("Tone assignment updated successfully");
                    TempData["Success"] = "Tone assignment updated successfully.";
                }
                else
                {
                    _logger.LogWarning("Failed to update tone assignment - API returned false");
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
            string[] colors = new[] { "tone-aqua", "tone-blue", "tone-purple",  "tone-teal",  "tone-red",  "tone-yellow", "tone-indigo",
            "tone-brown", "tone-pink", "tone-orange", "tone-green", "tone-lime", "tone-cyan", "tone-magenta", "tone-amber" };
            // Use modulo to handle cases where there are more tones than colors
            return colors[toneIndex % colors.Length];
        }

    }
} 