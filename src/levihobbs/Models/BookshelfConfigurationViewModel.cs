namespace levihobbs.Models
{
    public class BookshelfConfigurationViewModel
    {
        public bool EnableCustomMappings { get; set; }
        public List<BookshelfDisplayItem> Bookshelves { get; set; } = new List<BookshelfDisplayItem>();
        public List<BookshelfGroupingItem> Groupings { get; set; } = new List<BookshelfGroupingItem>();
    }

    public class BookshelfDisplayItem
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? DisplayName { get; set; }
        public bool Display { get; set; }
        public bool IsGenreBased { get; set; }
    }

    public class BookshelfGroupingItem
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? DisplayName { get; set; }
        public List<int> SelectedBookshelfIds { get; set; } = new List<int>();
        public bool ShouldRemove { get; set; }
        public bool IsGenreBased { get; set; }
    }
}