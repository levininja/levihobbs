using BookToneApi.Models;

namespace BookToneApi.Services
{
    public interface IHardcoverApiService
    {
        Task<List<string>> GetMoodTagsAsync(string bookTitle, string bookAuthor);
    }
} 