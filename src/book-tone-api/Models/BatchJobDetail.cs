using System.ComponentModel.DataAnnotations;

namespace BookToneApi.Models
{
    public class BatchJobDetail
    {
        public int Id { get; set; }
        
        [Required]
        [MaxLength(50)]
        public string BatchId { get; set; } = string.Empty;
        
        [Required]
        public int BookId { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
} 