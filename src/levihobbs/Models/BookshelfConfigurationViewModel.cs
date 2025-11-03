using BookDataApi.Shared.Dtos;

namespace levihobbs.Models
{
    public class BookshelfConfigurationViewModel
    {
        public BookshelfConfigurationDto Configuration { get; set; } = new BookshelfConfigurationDto();
        public string? SuccessMessage { get; set; }
        public string? ErrorMessage { get; set; }
        public bool HasErrors { get; set; }
    }
} 