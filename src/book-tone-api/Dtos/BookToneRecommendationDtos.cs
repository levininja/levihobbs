using System.ComponentModel.DataAnnotations;

namespace BookToneApi.Dtos
{
    public class UpdateBookToneRecommendationDto
    {
        [Required]
        public int Id { get; set; }
        
        [Required]
        [Range(-1, 1)]
        public int Feedback { get; set; }
    }
} 