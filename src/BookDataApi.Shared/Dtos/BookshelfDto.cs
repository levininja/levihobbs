namespace BookDataApi.Shared.Dtos
{
    public class BookshelfDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public bool Display { get; set; }
        public bool IsGenreBased { get; set; }
        public bool IsNonFictionGenre { get; set; }
    }
}
