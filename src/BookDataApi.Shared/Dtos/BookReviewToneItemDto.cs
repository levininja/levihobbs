namespace BookDataApi.Shared.Dtos
{
    public class BookReviewToneItemDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string AuthorFirstName { get; set; } = string.Empty;
        public string AuthorLastName { get; set; } = string.Empty;
        public string AuthorName { get; set; } = string.Empty;
        public List<string> Genres { get; set; } = new List<string>();
        public string MyReview { get; set; } = string.Empty;
        public List<int> AssignedToneIds { get; set; } = new List<int>();
        public int ReviewerRating { get; set; }
        public string ReviewerFullName { get; set; } = string.Empty;
        public DateTime? DateRead { get; set; }
        public string? Review { get; set; }
        public string TitleByAuthor { get; set; } = string.Empty;
    }
}
