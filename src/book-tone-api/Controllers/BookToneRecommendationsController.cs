using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BookToneApi.Data;
using BookToneApi.Models;
using BookToneApi.Dtos;
using BookToneApi.Services;
using BookDataApi.Shared.Models;
using BookDataApi.Shared.Dtos;

namespace BookToneApi.Controllers
{
    [ApiController]
    [Route("api/book-tone-recommendations")]
    public class BookToneRecommendationsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IRecommenderService _recommenderService;
        private readonly IBookDataService _bookDataService;
        private readonly IBatchProcessingService _batchProcessingService;
        private readonly ILogger<BookToneRecommendationsController> _logger;

        public BookToneRecommendationsController(
            ApplicationDbContext context, 
            IRecommenderService recommenderService,
            IBookDataService bookDataService,
            IBatchProcessingService batchProcessingService,
            ILogger<BookToneRecommendationsController> logger)
        {
            _context = context;
            _recommenderService = recommenderService;
            _bookDataService = bookDataService;
            _batchProcessingService = batchProcessingService;
            _logger = logger;
        }

        // POST: api/book-tone-recommendations
        [HttpPost]
        public async Task<IActionResult> GenerateBookToneRecommendations([FromQuery] List<int> bookIds)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            if (bookIds == null || !bookIds.Any())
                return BadRequest("At least one book ID is required");

            try
            {
                // Start the batch processing job asynchronously
                string batchId = await _batchProcessingService.StartBatchProcessingAsync(bookIds);
                
                _logger.LogInformation("Started batch processing job {BatchId} for {BookCount} books", 
                    batchId, bookIds.Count);

                return Accepted(new { 
                    BatchId = batchId
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to start batch processing job");
                return StatusCode(500, new { Error = "Failed to start batch processing job" });
            }
        }

        // GET: api/book-tone-recommendations/batch/{batchId}/status
        [HttpGet("batch/{batchId}/status")]
        public async Task<IActionResult> GetBatchStatus(string batchId)
        {
            try
            {
                BatchProcessingStatus status = await _batchProcessingService.GetBatchStatusAsync(batchId);
                
                if (status.Status == "NotFound")
                {
                    return NotFound(new { Error = "Batch job not found" });
                }

                return Ok(status);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to get batch status for {BatchId}", batchId);
                return StatusCode(500, new { Error = "Failed to get batch status" });
            }
        }

        // GET: api/book-tone-recommendations/batch/{batchId}/logs
        [HttpGet("batch/{batchId}/logs")]
        public async Task<IActionResult> GetBatchLogs(string batchId)
        {
            try
            {
                List<BatchProcessingLog> logs = await _batchProcessingService.GetBatchLogsAsync(batchId);
                return Ok(logs);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to get batch logs for {BatchId}", batchId);
                return StatusCode(500, new { Error = "Failed to get batch logs" });
            }
        }

        // GET: api/book-tone-recommendations/batch/{batchId}/metrics
        [HttpGet("batch/{batchId}/metrics")]
        public async Task<IActionResult> GetBatchMetrics(string batchId)
        {
            try
            {
                List<ResourceMetrics> metrics = await _context.ResourceMetrics
                    .Where(m => m.BatchId == batchId)
                    .OrderBy(m => m.CreatedAt)
                    .ToListAsync();
                
                return Ok(metrics);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to get batch metrics for {BatchId}", batchId);
                return StatusCode(500, new { Error = "Failed to get batch metrics" });
            }
        }

        // GET: api/book-tone-recommendations/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<BookToneRecommendationsResponseDto>> GetBookToneRecommendation(int id)
        {
            List<BookToneRecommendation> recommendations = await _context.BookToneRecommendations
                .Where(r => r.BookId == id)
                .ToListAsync();

            if (!recommendations.Any())
            {
                return NotFound();
            }

            BookToneRecommendationsResponseDto response = new BookToneRecommendationsResponseDto
            {
                Recommendations = recommendations.Select(r => new BookToneRecommendationItemDto
                {
                    Id = r.Id,
                    BookId = r.BookId,
                    Tone = FormatTone(r.Tone)
                }).ToList()
            };

            return Ok(response);
        }

        // PUT: api/book-tone-recommendations/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateBookToneRecommendation(int id, [FromBody] int feedback)
        {
            BookToneRecommendation? recommendation = await _context.BookToneRecommendations.FindAsync(id);

            if (recommendation == null)
            {
                return NotFound();
            }

            if (feedback < -1 || feedback > 1)
            {
                return BadRequest("Feedback must be between -1 and 1");
            }

            recommendation.Feedback = feedback;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!BookToneRecommendationExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        private bool BookToneRecommendationExists(int id)
        {
            return _context.BookToneRecommendations.Any(e => e.Id == id);
        }

        private string FormatTone(string tone)
        {
            if (string.IsNullOrEmpty(tone))
                return tone;

            string normalizedTone = tone.Trim();
            
            // Apply specific formatting rules (case insensitive)
            if (string.Equals(normalizedTone, "Gut Wrenching", StringComparison.OrdinalIgnoreCase) ||
                string.Equals(normalizedTone, "Gut-wrenching", StringComparison.OrdinalIgnoreCase))
            {
                return "Gut-wrenching";
            }
            
            if (string.Equals(normalizedTone, "Hard Boiled", StringComparison.OrdinalIgnoreCase) ||
                string.Equals(normalizedTone, "Hard-boiled", StringComparison.OrdinalIgnoreCase))
            {
                return "Hard-boiled";
            }
            
            if (string.Equals(normalizedTone, "Heart Warming", StringComparison.OrdinalIgnoreCase) ||
                string.Equals(normalizedTone, "Heart-Warming", StringComparison.OrdinalIgnoreCase))
            {
                return "Heartwarming";
            }
            
            // For all other tones, just capitalize the first letter of each word
            return System.Globalization.CultureInfo.CurrentCulture.TextInfo.ToTitleCase(normalizedTone.ToLower());
        }
    }
} 