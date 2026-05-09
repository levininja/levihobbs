namespace BookToneApi.Dtos
{
    public class BookToneRecommendationResponseDto
    {
        public int Id { get; set; }
        public string BookTitle { get; set; } = string.Empty;
        public string AuthorFirstName { get; set; } = string.Empty;
        public string AuthorLastName { get; set; } = string.Empty;
        public string Tone { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
    }
} 