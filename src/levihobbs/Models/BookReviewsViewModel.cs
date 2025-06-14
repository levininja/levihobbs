using System.Collections.Generic;
using levihobbs.Data;

namespace levihobbs.Models
{
    public class BookReviewsViewModel
    {
        public string Category { get; set; } = string.Empty;
        public IEnumerable<Bookshelf> AllBookshelves { get; set; } = new List<Bookshelf>();
        public string SelectedShelf { get; set; } = string.Empty;
        public IEnumerable<BookReview> BookReviews { get; set; } = new List<BookReview>();
    }
} 