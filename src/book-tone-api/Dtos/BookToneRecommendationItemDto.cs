using System.ComponentModel.DataAnnotations;

namespace BookToneApi.Dtos
{
    public class BookToneRecommendationItemDto
    {
        public int Id { get; set; }
        public int BookId { get; set; }
        public string Tone { get; set; } = string.Empty;
    }
} 