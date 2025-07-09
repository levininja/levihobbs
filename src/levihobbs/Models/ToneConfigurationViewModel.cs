namespace levihobbs.Models
{
    public class ToneConfigurationViewModel
    {
        public List<ToneItem> Tones { get; set; } = new List<ToneItem>();
    }
    
    public class ToneItem : ITone
    {
        public int Id { get; set; }
        public string Name { get; set; } = "";
        public string? Description { get; set; }
        public int? ParentId { get; set; }
        public bool ShouldRemove { get; set; }
        public List<ToneItem> Subtones { get; set; } = new List<ToneItem>();
    }
}