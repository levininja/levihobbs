using System.ComponentModel.DataAnnotations;

namespace BookToneApi.Models
{
    public class ErrorLog
    {
        public int Id { get; set; }
        
        [Required]
        [MaxLength(100)]
        public string Source { get; set; } = string.Empty; // "BatchProcessing", "RecommenderService", etc.
        
        [Required]
        [MaxLength(500)]
        public string ErrorType { get; set; } = string.Empty;
        
        [Required]
        public string ErrorMessage { get; set; } = string.Empty;
        
        public string? StackTrace { get; set; }
        
        public int? BookId { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
} 