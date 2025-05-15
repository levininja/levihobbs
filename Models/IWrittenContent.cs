namespace levihobbs.Models
{
    public interface IWrittenContent
    {
        int Id { get; set; }
        string Title { get; set; }
        string PreviewText { get; set; }
        string ImageUrl { get; set; }
        string Category { get; set; }
    }
}