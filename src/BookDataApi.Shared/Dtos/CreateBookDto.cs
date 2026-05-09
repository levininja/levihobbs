using System.ComponentModel.DataAnnotations;

namespace BookDataApi.Shared.Dtos
{
    public class CreateBookDto
    {
        [Required]
        public string Title { get; set; } = string.Empty;
        
        [Required]
        public string AuthorFirstName { get; set; } = string.Empty;
        
        [Required]
        public string AuthorLastName { get; set; } = string.Empty;
        
        public string? ISBN10 { get; set; }
        
        public string? ISBN13 { get; set; }
        
        [Required]
        [Range(0, 5)]
        public decimal AverageRating { get; set; }
        
        public int? NumberOfPages { get; set; }
        
        public int? OriginalPublicationYear { get; set; }
        
        public string? SearchableString { get; set; }
        
        public int? CoverImageId { get; set; }
    }
}
