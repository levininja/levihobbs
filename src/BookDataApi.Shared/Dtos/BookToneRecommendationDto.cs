namespace BookDataApi.Shared.Dtos
{
    public class BookToneRecommendationDto
    {
        public int Id { get; set; }
        public int BookId { get; set; }
        public string Tone { get; set; } = string.Empty;
        public int? ToneId { get; set; }
        public int Feedback { get; set; }
        public DateTime CreatedAt { get; set; }
    }
} 