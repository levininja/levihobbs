namespace levihobbs.Models
{
    public class StoryGroup
    {
        public string Title { get; set; } = string.Empty;
        public List<Story> Stories { get; set; } = new List<Story>();
    }
}