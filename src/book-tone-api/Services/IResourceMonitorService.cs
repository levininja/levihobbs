using BookToneApi.Models;

namespace BookToneApi.Services
{
    public interface IResourceMonitorService
    {
        Task<ResourceMetrics> GetCurrentMetricsAsync();
        Task LogMetricsAsync(string batchId, int? bookId = null);
    }
} 