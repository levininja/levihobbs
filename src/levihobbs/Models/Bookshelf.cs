namespace levihobbs.Models
{
    public class Bookshelf
    {
        public int Id { get; set; }
        public required string Name { get; set; }
        public string? DisplayName { get; set; }
        
        // Navigation property for many-to-many relationship
        public ICollection<BookReview> BookReviews { get; set; } = new List<BookReview>();
    }
}