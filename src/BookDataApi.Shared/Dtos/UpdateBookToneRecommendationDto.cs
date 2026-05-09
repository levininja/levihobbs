using System.ComponentModel.DataAnnotations;

namespace BookDataApi.Shared.Dtos
{
    public class UpdateBookToneRecommendationDto
    {
        public int? ToneId { get; set; }
        
        [Range(-2, 1)]
        public int Feedback { get; set; }
    }
}
