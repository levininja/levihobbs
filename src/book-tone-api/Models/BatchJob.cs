using System.ComponentModel.DataAnnotations;

namespace BookToneApi.Models
{
    public class BatchJob
    {
        public int Id { get; set; }
        
        [Required]
        [MaxLength(50)]
        public string BatchId { get; set; } = string.Empty;
        
        [Required]
        [MaxLength(20)]
        public string Status { get; set; } = string.Empty; // "Queued", "Processing", "Completed", "Failed"
        
        public int TotalBooks { get; set; }
        public int ProcessedBooks { get; set; }
        public int FailedBooks { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? StartedAt { get; set; }
        public DateTime? CompletedAt { get; set; }
        
        [MaxLength(1000)]
        public string? ErrorMessage { get; set; }
        
        // Navigation property for logs
        public List<BatchProcessingLog> ProcessingLogs { get; set; } = new();
    }
} 