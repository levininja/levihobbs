using System;

namespace levihobbs.Models
{
    public class StoryDTO
    {
        public string Title { get; set; }
        public string Subtitle { get; set; }
        public string Description { get; set; }
        public string CoverImage { get; set; }
        public string CanonicalUrl { get; set; }
        public DateTime PostDate { get; set; }
        public string Id { get; set; }
    }
} 