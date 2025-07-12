namespace levihobbs.Models
{
    public class ToneAssignmentViewModel
    {
        public List<BookReviewToneItem> BookReviews { get; set; } = new List<BookReviewToneItem>();
        public List<BookReviewToneItem> BooksWithTones { get; set; } = new List<BookReviewToneItem>();
        public List<ToneGroup> ToneGroups { get; set; } = new List<ToneGroup>();
        public List<GenreToneAssociation> GenreToneAssociations { get; set; } = new List<GenreToneAssociation>();
    }

    public class GenreToneAssociation
    {
        public string Genre { get; set; } = "";
        public List<string> Tones { get; set; } = new List<string>();
    }

    public class BookReviewToneItem
    {
        public int Id { get; set; }
        public string Title { get; set; } = "";
        public string AuthorName { get; set; } = "";
        public List<string> Genres { get; set; } = new List<string>();
        public string? MyReview { get; set; }
        public List<int> AssignedToneIds { get; set; } = new List<int>();
        public List<int> SuggestedToneIds { get; set; } = new List<int>();
    }

    public class ToneGroup
    {
        public string Name { get; set; } = "";
        public string DisplayName { get; set; } = "";
        public string ColorClass { get; set; } = "";
        public List<ToneDisplayItem> Tones { get; set; } = new List<ToneDisplayItem>();
    }

    public class ToneDisplayItem
    {
        public int Id { get; set; }
        public string Name { get; set; } = "";
        public string? Description { get; set; }
    }
}