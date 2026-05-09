using System.ComponentModel.DataAnnotations;

namespace BookDataApi.Shared.Models
{
    public class Book
    {
        public int Id { get; set; }
        public required string Title { get; set; }
        public required string AuthorFirstName { get; set; }
        public required string AuthorLastName { get; set; }
        public string? ISBN10 { get; set; }
        public string? ISBN13 { get; set; }
        public required decimal AverageRating { get; set; }
        public int? NumberOfPages { get; set; }
        public int? OriginalPublicationYear { get; set; }
        public string? SearchableString { get; set; }
        public int? CoverImageId { get; set; }

        public string TitleByAuthor => $"{Title} by {AuthorFirstName} {AuthorLastName}".Trim();
    }
}
