namespace levihobbs.Models
{
    public class BookReview : IWrittenContent
    {
        public int Id { get; set; }
        public required string Title { get; set; }
        public required string Subtitle { get; set; }
        public required string PreviewText { get; set; }
        public required string ImageUrl { get; set; }
        public required string Category { get; set; }
        
        // Additional fields for book reviews
        public required string Author { get; set; }
        public required DateTime DatePublished { get; set; }
        public required int StarRating { get; set; } // 1-5
        public required List<string> Shelves { get; set; }
        public required DateTime DateRead { get; set; }
        public required string ReadMoreUrl { get; set; }
        public byte[]? ImageRawData { get; set; }
        public string? SearchTerm { get; set; }
    }
}