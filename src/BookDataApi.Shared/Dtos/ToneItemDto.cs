namespace BookDataApi.Shared.Dtos
{
    public class ToneItemDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int? ParentId { get; set; }
        public List<ToneItemDto> Subtones { get; set; } = new List<ToneItemDto>();
        public bool ShouldRemove { get; set; }
    }
}
