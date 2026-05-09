using BookToneApi.Models;
using BookToneApi.Dtos;

namespace BookToneApi.Services
{
    public interface IRecommenderService
    {
        Task<List<string>> GenerateBookToneRecommendationsAsync(int bookId);
    }
} 