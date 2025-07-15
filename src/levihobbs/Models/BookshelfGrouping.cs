namespace levihobbs.Models
{
    public class BookshelfGrouping
    {
        public int Id { get; set; }
        public required string Name { get; set; }
        public string? DisplayName { get; set; }
        public bool IsGenreBased { get; set; } = false;
        
        // Navigation property for many-to-many relationship with bookshelves
        public ICollection<Bookshelf> Bookshelves { get; set; } = new List<Bookshelf>();
    }
}