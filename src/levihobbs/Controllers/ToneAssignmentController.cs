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
                // BREAKPOINT: Starting tone assignment index action
                _logger.LogInformation("ToneAssignment Index action started");
                
                // Get both tone assignment data and tone configuration
                _logger.LogInformation("Fetching tone assignment data...");
                ToneAssignmentDto toneAssignmentData = await _bookDataApiService.GetToneAssignmentAsync();
                _logger.LogInformation("Tone assignment data received: {BookReviewsCount} book reviews, {BooksWithTonesCount} books with tones", 
                    toneAssignmentData.BookReviews?.Count ?? 0, toneAssignmentData.BooksWithTones?.Count ?? 0);
                
                _logger.LogInformation("Fetching tone configuration...");
                List<ToneItemDto> tones = await _bookDataApiService.GetToneConfigurationAsync();
                _logger.LogInformation("Tone configuration received: {TonesCount} tones", tones.Count);
                
                // Create tone color groupings
                _logger.LogInformation("Creating tone color groupings...");
                List<ToneColorGrouping> toneColorGroupings = CreateToneColorGroupings(tones);
                _logger.LogInformation("Tone color groupings created: {GroupingsCount} groupings", toneColorGroupings.Count);
                
                // Create the ViewModel with all the data
                ToneAssignmentViewModel viewModel = new ToneAssignmentViewModel
                {
                    BookReviews = toneAssignmentData.BookReviews ?? new List<BookReviewToneItemDto>(),
                    BooksWithTones = toneAssignmentData.BooksWithTones ?? new List<BookReviewToneItemDto>(),
                    ToneColorGroupings = toneColorGroupings
                };

                _logger.LogInformation("ViewModel created successfully, returning view");
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
            
            // BREAKPOINT: Starting tone color groupings creation
            _logger.LogInformation("CreateToneColorGroupings called with {Count} tones", allTones.Count);
            
            // Log all incoming tones for debugging
            foreach (var tone in allTones)
            {
                _logger.LogInformation("Input tone: Id={Id}, Name={Name}, ParentId={ParentId}, SubtonesCount={SubtonesCount}", 
                    tone.Id, tone.Name, tone.ParentId, tone.Subtones?.Count ?? 0);
            }
            
            // BREAKPOINT: Finding parent tones with subtones
            var parentTonesWithSubtones = allTones.Where(pt => pt.Subtones.Any()).ToList();
            _logger.LogInformation("Found {Count} parent tones with subtones", parentTonesWithSubtones.Count);
            
            // Put the tone groupings together
            List<ToneColorGrouping> toneColorGroupings = parentTonesWithSubtones.Select((pt, index) => 
            {
                _logger.LogInformation("Creating grouping for parent tone: {Name} with {SubtonesCount} subtones", pt.Name, pt.Subtones.Count);
                
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
                
                _logger.LogInformation("Created grouping '{Name}' with {TonesCount} tones", grouping.Name, grouping.Tones.Count);
                return grouping;
            }).ToList();

            // BREAKPOINT: Finding standalone tones
            var standaloneTones = allTones.Where(pt => !pt.Subtones.Any() && pt.ParentId == null).ToList();
            _logger.LogInformation("Found {Count} standalone tones (no subtones and no parent)", standaloneTones.Count);
            
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
            
            _logger.LogInformation("Created 'Other Tones' grouping with {TonesCount} tones", otherTonesGrouping.Tones.Count);
            toneColorGroupings.Add(otherTonesGrouping);

            // BREAKPOINT: Final result
            _logger.LogInformation("Final result: {GroupingsCount} tone color groupings created", toneColorGroupings.Count);
            foreach (var grouping in toneColorGroupings)
            {
                _logger.LogInformation("Grouping: {Name} ({ColorClass}) with {TonesCount} tones", 
                    grouping.Name, grouping.ColorClass, grouping.Tones.Count);
            }

            return toneColorGroupings;
        }

        [HttpPost]
        public async Task<IActionResult> Update(ToneAssignmentViewModel model)
        {
            try
            {
                // Convert ViewModel back to DTO for API call
                ToneAssignmentDto dto = new ToneAssignmentDto
                {
                    BookReviews = model.BookReviews,
                    BooksWithTones = model.BooksWithTones
                };
                
                var success = await _bookDataApiService.UpdateToneAssignmentAsync(dto);
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

    }
} 