using System.ComponentModel.DataAnnotations;

namespace BookToneApi.Models
{
    public class ResourceMetrics
    {
        public int Id { get; set; }
        
        [Required]
        [MaxLength(50)]
        public string BatchId { get; set; } = string.Empty;
        
        public int? BookId { get; set; }
        
        public double CpuUsagePercent { get; set; }
        public long MemoryUsageBytes { get; set; }
        public long AvailableMemoryBytes { get; set; }
        public double MemoryUsagePercent { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
} 