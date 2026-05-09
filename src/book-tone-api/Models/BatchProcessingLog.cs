using System.ComponentModel.DataAnnotations;

namespace BookToneApi.Models
{
    public class BatchProcessingLog
    {
        public int Id { get; set; }
        
        [Required]
        [MaxLength(50)]
        public string BatchId { get; set; } = string.Empty;
        
        [Required]
        public int BookId { get; set; }
        
        [Required]
        [MaxLength(50)]
        public string Status { get; set; } = string.Empty; // "Started", "Completed", "Failed"
        
        [MaxLength(1000)]
        public string? Message { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        public DateTime? CompletedAt { get; set; }
    }
} 