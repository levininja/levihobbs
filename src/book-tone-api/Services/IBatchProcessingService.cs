using BookToneApi.Models;

namespace BookToneApi.Services
{
    public interface IBatchProcessingService
    {
        Task<string> StartBatchProcessingAsync(List<int> bookIds);
        Task<BatchProcessingStatus> GetBatchStatusAsync(string batchId);
        Task<List<BatchProcessingLog>> GetBatchLogsAsync(string batchId);
    }

    public class BatchProcessingStatus
    {
        public string BatchId { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty; // "Queued", "Processing", "Completed", "Failed"
        public int TotalBooks { get; set; }
        public int ProcessedBooks { get; set; }
        public int FailedBooks { get; set; }
        public DateTime StartedAt { get; set; }
        public DateTime? CompletedAt { get; set; }
        public string? ErrorMessage { get; set; }
    }
} 