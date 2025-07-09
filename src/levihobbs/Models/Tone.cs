namespace levihobbs.Models
{
    public class Tone
    {
        public int Id { get; set; }
        public required string Name { get; set; }
        public string? Description { get; set; }
        public int? ParentId { get; set; }
        
        // Navigation property for self-referencing relationship (parent tone)
        public Tone? Parent { get; set; }
        
        // Navigation property for child tones
        public ICollection<Tone> Subtones { get; set; } = new List<Tone>();
    }
} 