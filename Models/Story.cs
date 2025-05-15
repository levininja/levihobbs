namespace levihobbs.Models
{
    public class Story : IWrittenContent
    {
        public int Id { get; set; }
        public required string Title { get; set; }
        public required string Subtitle { get; set; }
        public required string PreviewText { get; set; }
        public required string ImageUrl { get; set; }
        public required string Category { get; set; }
    }
}