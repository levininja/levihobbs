namespace BookDataApi.Shared.Dtos
{
    public class BookReviewDto
    {
        public int Id { get; set; }
        public int ReviewerRating { get; set; }
        public string ReviewerFullName { get; set; } = string.Empty;
        public DateTime? DateRead { get; set; }
        public string? Review { get; set; }
        public int BookId { get; set; }
        public bool HasReviewContent { get; set; }
        public string ReviewPreviewText { get; set; } = string.Empty;
        public int ReadingTimeMinutes { get; set; }
    }
}
