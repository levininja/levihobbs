using System.ComponentModel.DataAnnotations;

namespace BookDataApi.Shared.Dtos
{
    public class UpdateBookDto
    {
        public string? Title { get; set; }
        
        public string? AuthorFirstName { get; set; }
        
        public string? AuthorLastName { get; set; }
        
        public string? ISBN10 { get; set; }
        
        public string? ISBN13 { get; set; }
        
        [Range(0, 5)]
        public decimal? AverageRating { get; set; }
        
        public int? NumberOfPages { get; set; }
        
        public int? OriginalPublicationYear { get; set; }
        
        public string? SearchableString { get; set; }
        
        public int? CoverImageId { get; set; }
    }
}
