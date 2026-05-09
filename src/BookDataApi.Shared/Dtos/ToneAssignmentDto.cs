namespace BookDataApi.Shared.Dtos
{
    public class ToneAssignmentDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int? ParentId { get; set; }
        public List<BookReviewToneItemDto> BookReviews { get; set; } = new List<BookReviewToneItemDto>();
        public List<BookReviewToneItemDto> BooksWithTones { get; set; } = new List<BookReviewToneItemDto>();
        public List<ToneItemDto> Tones { get; set; } = new List<ToneItemDto>();
    }
}
