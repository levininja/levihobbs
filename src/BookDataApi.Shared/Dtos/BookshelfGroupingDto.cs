namespace BookDataApi.Shared.Dtos
{
    public class BookshelfGroupingDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public bool IsGenreBased { get; set; }
        public bool IsNonFictionGenre { get; set; }
    }
}

