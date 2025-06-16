namespace levihobbs.Models
{
    public class Bookshelf
    {
        public int Id { get; set; }
        public required string Name { get; set; }
        public string? DisplayName { get; set; }
        public bool? Display { get; set; }
        
        // Navigation property for many-to-many relationship with BookReview
        public ICollection<BookReview> BookReviews { get; set; } = new List<BookReview>();
        
        // Navigation property for many-to-many relationship with BookshelfGrouping
        public ICollection<BookshelfGrouping> BookshelfGroupings { get; set; } = new List<BookshelfGrouping>();
    }
}