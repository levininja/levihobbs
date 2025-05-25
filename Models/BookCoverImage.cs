using System;

namespace levihobbs.Models
{
    public class BookCoverImage
    {
        public int Id { get; set; }
        public required string SearchTerm { get; set; }
        public required byte[] ImageData { get; set; }
        public int Width { get; set; }
        public int Height { get; set; }
        public string? FileType { get; set; }
        public DateTime DateAccessed { get; set; } = DateTime.UtcNow;
    }
}