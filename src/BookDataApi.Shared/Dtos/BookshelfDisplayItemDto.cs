namespace BookDataApi.Shared.Dtos
{
    public class BookshelfDisplayItemDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public bool Display { get; set; } = true;
        public bool IsGenreBased { get; set; }
        public bool IsNonFictionGenre { get; set; }
        public string Title { get; set; } = string.Empty;
        public string AuthorFirstName { get; set; } = string.Empty;
        public string AuthorLastName { get; set; } = string.Empty;
        public decimal AverageRating { get; set; }
        public string TitleByAuthor { get; set; } = string.Empty;
    }
}
