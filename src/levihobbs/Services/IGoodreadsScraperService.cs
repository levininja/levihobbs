using System.Collections.Generic;
using System.Threading.Tasks;
using levihobbs.Models;

namespace levihobbs.Services
{
    public interface IGoodreadsScraperService
    {
        Task<List<BookReview>> GetBookReviewsAsync();
    }
} 