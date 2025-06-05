using System.Threading.Tasks;
using levihobbs.Models;

namespace levihobbs.Services
{
    /// <summary>
    /// Service interface for retrieving and managing Goodreads RSS feed data.
    /// </summary>
    public interface IGoodreadsRssService
    {
        /// <summary>
        /// Retrieves the RSS feed for the configured Goodreads user.
        /// </summary>
        /// <returns>A task that represents the asynchronous operation. The task result contains the RSS channel data if successful, or null if the operation fails.</returns>
        Task<RssChannel?> GetRssFeedAsync();
    }
} 