using levihobbs.Models;

namespace levihobbs.Services;

public interface ISubstackApiClient
{
    Task<bool> SubscribeToNewsletterAsync(string email);
    Task<List<StoryDTO>> GetStories(string searchTerm, int? limit = 20);
} 