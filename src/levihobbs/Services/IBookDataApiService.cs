using levihobbs.Models;

namespace levihobbs.Services
{
    public interface IBookDataApiService
    {
        // Health check
        Task<bool> IsApiAvailableAsync();
        
        // Book Reviews
        Task<List<BookReview>> GetBookReviewsAsync(string? displayCategory = null, string? shelf = null, string? grouping = null, bool recent = false);
        Task<BookReview?> GetBookReviewAsync(int id);
        
        // Bookshelves
        Task<List<Bookshelf>> GetBookshelvesAsync();
        Task<Bookshelf?> GetBookshelfAsync(int id);
        
        // Tones
        Task<List<Tone>> GetTonesAsync();
        Task<Tone?> GetToneAsync(int id);
        
        // Admin operations
        Task<BookshelfConfigurationViewModel> GetBookshelfConfigurationAsync();
        Task<bool> UpdateBookshelfConfigurationAsync(BookshelfConfigurationViewModel model);
        Task<ToneConfigurationViewModel> GetToneConfigurationAsync();
        Task<bool> UpdateToneConfigurationAsync(ToneConfigurationViewModel model);
        Task<ToneAssignmentViewModel> GetToneAssignmentAsync();
        Task<bool> UpdateToneAssignmentAsync(ToneAssignmentViewModel model);
        Task<bool> ImportBookReviewsAsync(IFormFile file);
    }
} 