namespace BookToneApi.Dtos
{
    public class BookToneRecommendationsResponseDto
    {
        public List<BookToneRecommendationItemDto> Recommendations { get; set; } = new();
    }
} 