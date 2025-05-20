using System;

namespace levihobbs.Models
{
    public class StoryDTO
    {
        public required string Title { get; set; }
        public required string Subtitle { get; set; }
        public required string Description { get; set; }
        public required string SearchEngineDescription { get; set; }
        public required string CoverImage { get; set; }
        public required string CanonicalUrl { get; set; }
        public DateTime PostDate { get; set; }
        public required string Id { get; set; }
    }
} 