using BookDataApi.Dtos;

namespace levihobbs.Models
{
    public class ToneAssignmentViewModel
    {
        public List<BookReviewToneItemDto> BookReviews { get; set; } = new List<BookReviewToneItemDto>();
        public List<BookReviewToneItemDto> BooksWithTones { get; set; } = new List<BookReviewToneItemDto>();
        public List<ToneColorGrouping> ToneColorGroupings { get; set; } = new List<ToneColorGrouping>();
    }
} 