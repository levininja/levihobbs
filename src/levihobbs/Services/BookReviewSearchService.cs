using levihobbs.Data;
using levihobbs.Models;
using Microsoft.EntityFrameworkCore;

namespace levihobbs.Services
{
    public class BookReviewSearchService : IBookReviewSearchService
    {
        private readonly ApplicationDbContext _context;
        
        public BookReviewSearchService(ApplicationDbContext context)
        {
            _context = context;
        }
        
        public async Task<List<BookReview>> SearchBooksAsync(string searchTerm)
        {
            if (string.IsNullOrWhiteSpace(searchTerm))
                return new List<BookReview>();
            
            var normalizedSearchTerm = searchTerm.ToLower();
            
            return await _context.BookReviews
                .Include(br => br.Bookshelves)
                .Where(br => br.SearchableString != null && br.SearchableString.Contains(normalizedSearchTerm))
                .OrderByDescending(br => br.DateRead)
                .Take(50) // Limit results for performance
                .ToListAsync();
        }
    }
} 