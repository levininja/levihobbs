using levihobbs.Models;
using BookDataApi.Shared.Dtos;

namespace levihobbs.Services
{
    public interface IBookDataApiService
    {
        // Health check
        Task<bool> IsApiAvailableAsync();
        
        // Book Reviews
        Task<List<BookReviewDto>> GetBookReviewsAsync(string? displayCategory = null, string? shelf = null, string? grouping = null, bool recent = false);
        Task<BookReviewDto?> GetBookReviewAsync(int id);
        
        // Bookshelves
        Task<List<Bookshelf>> GetBookshelvesAsync();
        Task<Bookshelf?> GetBookshelfAsync(int id);
        
        // Tones
        Task<List<Tone>> GetTonesAsync();
        Task<Tone?> GetToneAsync(int id);
        
        // Admin operations
        Task<BookshelfConfigurationDto> GetBookshelfConfigurationAsync();
        Task<bool> UpdateBookshelfConfigurationAsync(BookshelfConfigurationDto model);
        Task<List<ToneItemDto>> GetToneConfigurationAsync();
        Task<bool> UpdateToneConfigurationAsync(List<ToneItemDto> tones);
        Task<ToneAssignmentDto> GetToneAssignmentAsync();
        Task<bool> UpdateToneAssignmentAsync(ToneAssignmentDto model);
        Task<ImportBookReviewsResult> ImportBookReviewsAsync(IFormFile file);
    }
} 
