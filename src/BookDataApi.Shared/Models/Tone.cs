namespace BookDataApi.Shared.Models
{
    public class Tone
    {
        public int Id { get; set; }
        public required string Name { get; set; }
        public string? Description { get; set; }
        public int? ParentId { get; set; }
    }
}
