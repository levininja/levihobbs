using System.ComponentModel.DataAnnotations;

namespace BookDataApi.Shared.Models
{
    public class BookToneRecommendation
    {
        public int Id { get; set; }
        public int BookId { get; set; }
        public string Tone { get; set; } = string.Empty;
        public int? ToneId { get; set; }
        public int Feedback { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
