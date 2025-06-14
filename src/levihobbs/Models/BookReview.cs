namespace levihobbs.Models
{
    public class BookReview
    {
        public int Id { get; set; }
        public required string Title { get; set; }
        public required string AuthorFirstName { get; set; }
        public required string AuthorLastName { get; set; }
        public required int MyRating { get; set; } // 1-5
        public required decimal AverageRating { get; set; } // 1-5
        public int? NumberOfPages { get; set; }
        public int? OriginalPublicationYear { get; set; }
        public required DateTime DateRead { get; set; }
        public required string MyReview { get; set; }
        
        // Navigation property for many-to-many relationship
        public ICollection<Bookshelf> Bookshelves { get; set; } = new List<Bookshelf>();
    }
}