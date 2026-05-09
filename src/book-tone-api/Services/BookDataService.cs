using System.Text.Json;
using BookDataApi.Shared.Dtos;

namespace BookToneApi.Services
{
    public class BookDataService : IBookDataService
    {
        private readonly HttpClient _httpClient;
        private readonly ILogger<BookDataService> _logger;
        private readonly string _bookDataApiUrl;

        public BookDataService(HttpClient httpClient, ILogger<BookDataService> logger, IConfiguration configuration)
        {
            _httpClient = httpClient;
            _logger = logger;
            _bookDataApiUrl = configuration["BookDataApi:BaseUrl"] ?? "http://localhost:5020";
        }

        public async Task<BookDto?> GetBookByIdAsync(int bookId)
        {
            try
            {
                _logger.LogInformation("Fetching book data for book ID: {BookId}", bookId);
                
                HttpResponseMessage response = await _httpClient.GetAsync($"{_bookDataApiUrl}/api/books/{bookId}");
                
                if (response.IsSuccessStatusCode)
                {
                    string content = await response.Content.ReadAsStringAsync();
                    BookDto? bookData = JsonSerializer.Deserialize<BookDto>(content, new JsonSerializerOptions
                    {
                        PropertyNameCaseInsensitive = true
                    });
                    
                    _logger.LogInformation("Successfully retrieved book data for book ID: {BookId}", bookId);
                    return bookData;
                }
                else
                {
                    _logger.LogWarning("Failed to retrieve book data for book ID: {BookId}. Status: {StatusCode}", 
                        bookId, response.StatusCode);
                    return null;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving book data for book ID: {BookId}", bookId);
                return null;
            }
        }
    }
} 