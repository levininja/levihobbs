using levihobbs.Models;

namespace levihobbs.Services
{
    public interface IBookReviewSearchService
    {
        Task<List<BookReview>> SearchBooksAsync(string searchTerm);
    }
} 