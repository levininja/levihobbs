using System.Threading.Tasks;
using levihobbs.Models;

namespace levihobbs.Services
{
    public interface IBookCoverService
    {
        Task<byte[]?> GetBookCoverImageAsync(string searchTerm, int bookReviewId);
    }
}