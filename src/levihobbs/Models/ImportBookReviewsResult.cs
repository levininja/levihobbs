namespace levihobbs.Models
{
    public class ImportBookReviewsResult
    {
        public bool Success { get; set; }
        public int ImportedCount { get; set; }
        public int DuplicateCount { get; set; }
        public string? Message { get; set; }
        public string? RawResponse { get; set; }
    }
}
