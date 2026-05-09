using BookDataApi.Shared.Models;

namespace BookDataApi.Shared.Dtos
{
    public class BookReviewResponseDto
    {
        public List<BookReviewDto> BookReviews { get; set; } = new List<BookReviewDto>();
        public List<BookshelfDto> Bookshelves { get; set; } = new List<BookshelfDto>();
        public List<BookshelfGroupingDto> BookshelfGroupings { get; set; } = new List<BookshelfGroupingDto>();
    }
}
