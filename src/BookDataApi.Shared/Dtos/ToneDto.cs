namespace BookDataApi.Shared.Dtos
{
    public class ToneDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int? ParentId { get; set; }
    }
}
