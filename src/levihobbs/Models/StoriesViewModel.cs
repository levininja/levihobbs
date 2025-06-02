namespace levihobbs.Models
{
    public class StoriesViewModel
    {
        public List<Story> Stories { get; set; } = new List<Story>();
        public List<StoryGroup> StoryGroups { get; set; } = new List<StoryGroup>();
        public String Category {get;set;} = "";
        public String? NoStoriesMessage {get;set;}
    }
}