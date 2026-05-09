using System.ComponentModel.DataAnnotations;

namespace BookDataApi.Shared.Dtos
{
    public class CreateBookToneRecommendationDto
    {
        [Required]
        public int BookId { get; set; }
        
        [Required]
        public string Tone { get; set; } = string.Empty;
        
        [Range(-2, 1)]
        public int Feedback { get; set; }
    }
}
