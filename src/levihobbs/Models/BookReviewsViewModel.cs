using System.Collections.Generic;
using levihobbs.Data;

namespace levihobbs.Models
{
    public class BookReviewsViewModel
    {
        public string? Category { get; set; }
        public List<Bookshelf> AllBookshelves { get; set; } = new List<Bookshelf>();
        public List<BookshelfGrouping> AllBookshelfGroupings { get; set; } = new List<BookshelfGrouping>();
        public string? SelectedShelf { get; set; }
        public string? SelectedGrouping { get; set; }
        public bool ShowRecentOnly { get; set; }
        public bool UseCustomMappings { get; set; }
        public List<BookReview> BookReviews { get; set; } = new List<BookReview>();
    }
} 