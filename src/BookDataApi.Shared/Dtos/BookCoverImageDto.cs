namespace BookDataApi.Shared.Dtos
{
    public class BookCoverImageDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? ImageUrl { get; set; }
        public int Width { get; set; }
        public int Height { get; set; }
        public string? FileType { get; set; }
        public DateTime? DateDownloaded { get; set; }
    }
}
