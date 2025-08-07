using System.Text;
using System.Text.Json;
using levihobbs.Models;
using Microsoft.Extensions.Configuration;
using BookDataApi.Dtos;

namespace levihobbs.Services
{
    public class BookDataApiService : IBookDataApiService
    {
        private readonly HttpClient _httpClient;
        private readonly IConfiguration _configuration;
        private readonly ILogger<BookDataApiService> _logger;
        private readonly string _baseUrl;

        public BookDataApiService(HttpClient httpClient, IConfiguration configuration, ILogger<BookDataApiService> logger)
        {
            _httpClient = httpClient;
            _configuration = configuration;
            _logger = logger;
            _baseUrl = _configuration["BookDataApi:BaseUrl"] ?? "http://localhost:5020";
        }

        // Health check method to verify API availability
        public async Task<bool> IsApiAvailableAsync()
        {
            try
            {
                var response = await _httpClient.GetAsync($"{_baseUrl}/health");
                return response.IsSuccessStatusCode;
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Book-data-api is not available at {BaseUrl}. Please ensure book-data-api is running on port 5020.", _baseUrl);
                return false;
            }
        }

        // Book Reviews
        public async Task<List<BookReview>> GetBookReviewsAsync(string? displayCategory = null, string? shelf = null, string? grouping = null, bool recent = false)
        {
            try
            {
                var queryParams = new List<string>();
                if (!string.IsNullOrEmpty(displayCategory)) queryParams.Add($"displayCategory={Uri.EscapeDataString(displayCategory)}");
                if (!string.IsNullOrEmpty(shelf)) queryParams.Add($"shelf={Uri.EscapeDataString(shelf)}");
                if (!string.IsNullOrEmpty(grouping)) queryParams.Add($"grouping={Uri.EscapeDataString(grouping)}");
                if (recent) queryParams.Add("recent=true");

                var url = $"{_baseUrl}/api/bookreviews";
                if (queryParams.Any())
                    url += "?" + string.Join("&", queryParams);

                var response = await _httpClient.GetAsync(url);
                response.EnsureSuccessStatusCode();

                var json = await response.Content.ReadAsStringAsync();
                var result = JsonSerializer.Deserialize<ApiResponse<List<BookReview>>>(json, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                return result?.Data ?? new List<BookReview>();
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(ex, "Cannot connect to book-data-api at {BaseUrl}. Please ensure book-data-api is running on port 5020.", _baseUrl);
                Console.WriteLine($"ERROR: Cannot connect to book-data-api at {_baseUrl}. Please ensure book-data-api is running on port 5020.");
                return new List<BookReview>();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting book reviews from API");
                return new List<BookReview>();
            }
        }

        public async Task<BookReview?> GetBookReviewAsync(int id)
        {
            try
            {
                var response = await _httpClient.GetAsync($"{_baseUrl}/api/bookreviews/{id}");
                if (response.IsSuccessStatusCode)
                {
                    var json = await response.Content.ReadAsStringAsync();
                    return JsonSerializer.Deserialize<BookReview>(json, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                }
                return null;
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(ex, "Cannot connect to book-data-api at {BaseUrl}. Please ensure book-data-api is running on port 5020.", _baseUrl);
                Console.WriteLine($"ERROR: Cannot connect to book-data-api at {_baseUrl}. Please ensure book-data-api is running on port 5020.");
                return null;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting book review {Id} from API", id);
                return null;
            }
        }

        // Bookshelves
        public async Task<List<Bookshelf>> GetBookshelvesAsync()
        {
            try
            {
                var response = await _httpClient.GetAsync($"{_baseUrl}/api/bookshelves");
                response.EnsureSuccessStatusCode();

                var json = await response.Content.ReadAsStringAsync();
                return JsonSerializer.Deserialize<List<Bookshelf>>(json, new JsonSerializerOptions { PropertyNameCaseInsensitive = true }) ?? new List<Bookshelf>();
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(ex, "Cannot connect to book-data-api at {BaseUrl}. Please ensure book-data-api is running on port 5020.", _baseUrl);
                Console.WriteLine($"ERROR: Cannot connect to book-data-api at {_baseUrl}. Please ensure book-data-api is running on port 5020.");
                return new List<Bookshelf>();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting bookshelves from API");
                return new List<Bookshelf>();
            }
        }

        public async Task<Bookshelf?> GetBookshelfAsync(int id)
        {
            try
            {
                var response = await _httpClient.GetAsync($"{_baseUrl}/api/bookshelves/{id}");
                if (response.IsSuccessStatusCode)
                {
                    var json = await response.Content.ReadAsStringAsync();
                    return JsonSerializer.Deserialize<Bookshelf>(json, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                }
                return null;
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(ex, "Cannot connect to book-data-api at {BaseUrl}. Please ensure book-data-api is running on port 5020.", _baseUrl);
                Console.WriteLine($"ERROR: Cannot connect to book-data-api at {_baseUrl}. Please ensure book-data-api is running on port 5020.");
                return null;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting bookshelf {Id} from API", id);
                return null;
            }
        }

        // Tones
        public async Task<List<Tone>> GetTonesAsync()
        {
            try
            {
                var response = await _httpClient.GetAsync($"{_baseUrl}/api/tones");
                response.EnsureSuccessStatusCode();

                var json = await response.Content.ReadAsStringAsync();
                return JsonSerializer.Deserialize<List<Tone>>(json, new JsonSerializerOptions { PropertyNameCaseInsensitive = true }) ?? new List<Tone>();
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(ex, "Cannot connect to book-data-api at {BaseUrl}. Please ensure book-data-api is running on port 5020.", _baseUrl);
                Console.WriteLine($"ERROR: Cannot connect to book-data-api at {_baseUrl}. Please ensure book-data-api is running on port 5020.");
                return new List<Tone>();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting tones from API");
                return new List<Tone>();
            }
        }

        public async Task<Tone?> GetToneAsync(int id)
        {
            try
            {
                var response = await _httpClient.GetAsync($"{_baseUrl}/api/tones/{id}");
                if (response.IsSuccessStatusCode)
                {
                    var json = await response.Content.ReadAsStringAsync();
                    return JsonSerializer.Deserialize<Tone>(json, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                }
                return null;
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(ex, "Cannot connect to book-data-api at {BaseUrl}. Please ensure book-data-api is running on port 5020.", _baseUrl);
                Console.WriteLine($"ERROR: Cannot connect to book-data-api at {_baseUrl}. Please ensure book-data-api is running on port 5020.");
                return null;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting tone {Id} from API", id);
                return null;
            }
        }

        // Admin operations
        public async Task<BookshelfConfigurationDto> GetBookshelfConfigurationAsync()
        {
            try
            {
                var response = await _httpClient.GetAsync($"{_baseUrl}/api/bookshelfgroupings");
                response.EnsureSuccessStatusCode();

                var json = await response.Content.ReadAsStringAsync();
                return JsonSerializer.Deserialize<BookshelfConfigurationDto>(json, new JsonSerializerOptions { PropertyNameCaseInsensitive = true }) ?? new BookshelfConfigurationDto();
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(ex, "Cannot connect to book-data-api at {BaseUrl}. Please ensure book-data-api is running on port 5020.", _baseUrl);
                Console.WriteLine($"ERROR: Cannot connect to book-data-api at {_baseUrl}. Please ensure book-data-api is running on port 5020.");
                return new BookshelfConfigurationDto();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting bookshelf configuration from API");
                return new BookshelfConfigurationDto();
            }
        }

        public async Task<bool> UpdateBookshelfConfigurationAsync(BookshelfConfigurationDto model)
        {
            try
            {
                var json = JsonSerializer.Serialize(model);
                var content = new StringContent(json, Encoding.UTF8, "application/json");
                var response = await _httpClient.PostAsync($"{_baseUrl}/api/bookshelfgroupings", content);
                return response.IsSuccessStatusCode;
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(ex, "Cannot connect to book-data-api at {BaseUrl}. Please ensure book-data-api is running on port 5020.", _baseUrl);
                Console.WriteLine($"ERROR: Cannot connect to book-data-api at {_baseUrl}. Please ensure book-data-api is running on port 5020.");
                return false;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating bookshelf configuration via API");
                return false;
            }

        }

        public async Task<List<ToneItemDto>> GetToneConfigurationAsync()
        {
            try
            {
                // BREAKPOINT: About to make API call to get tone configuration
                _logger.LogInformation("Making API call to get tone configuration from {BaseUrl}/api/tones/configuration", _baseUrl);
                
                var response = await _httpClient.GetAsync($"{_baseUrl}/api/tones/configuration");
                response.EnsureSuccessStatusCode();

                var json = await response.Content.ReadAsStringAsync();
                
                var result = JsonSerializer.Deserialize<List<ToneItemDto>>(json, new JsonSerializerOptions { PropertyNameCaseInsensitive = true }) ?? new List<ToneItemDto>();
                
                _logger.LogInformation("Deserialized {Count} tone items from API response", result.Count);
                
                return result;
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(ex, "Cannot connect to book-data-api at {BaseUrl}. Please ensure book-data-api is running on port 5020.", _baseUrl);
                Console.WriteLine($"ERROR: Cannot connect to book-data-api at {_baseUrl}. Please ensure book-data-api is running on port 5020.");
                return new List<ToneItemDto>();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting tone configuration from API");
                return new List<ToneItemDto>();
            }
        }

        public async Task<bool> UpdateToneConfigurationAsync(List<ToneItemDto> tones)
        {
            try
            {
                var json = JsonSerializer.Serialize(tones);
                var content = new StringContent(json, Encoding.UTF8, "application/json");
                var response = await _httpClient.PostAsync($"{_baseUrl}/api/tones/configuration", content);
                return response.IsSuccessStatusCode;
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(ex, "Cannot connect to book-data-api at {BaseUrl}. Please ensure book-data-api is running on port 5020.", _baseUrl);
                Console.WriteLine($"ERROR: Cannot connect to book-data-api at {_baseUrl}. Please ensure book-data-api is running on port 5020.");
                return false;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating tone configuration via API");
                return false;
            }
        }

        public async Task<ToneAssignmentDto> GetToneAssignmentAsync()
        {
            try
            {
                var response = await _httpClient.GetAsync($"{_baseUrl}/api/tones/assignment");
                response.EnsureSuccessStatusCode();

                var json = await response.Content.ReadAsStringAsync();
                return JsonSerializer.Deserialize<ToneAssignmentDto>(json, new JsonSerializerOptions { PropertyNameCaseInsensitive = true }) ?? new ToneAssignmentDto();
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(ex, "Cannot connect to book-data-api at {BaseUrl}. Please ensure book-data-api is running on port 5020.", _baseUrl);
                Console.WriteLine($"ERROR: Cannot connect to book-data-api at {_baseUrl}. Please ensure book-data-api is running on port 5020.");
                return new ToneAssignmentDto();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting tone assignment from API");
                return new ToneAssignmentDto();
            }
        }

        public async Task<bool> UpdateToneAssignmentAsync(ToneAssignmentDto model)
        {
            try
            {
                _logger.LogInformation("UpdateToneAssignmentAsync called with {BookReviewsCount} book reviews and {BooksWithTonesCount} books with tones", 
                    model.BookReviews?.Count ?? 0, model.BooksWithTones?.Count ?? 0);
                
                var json = JsonSerializer.Serialize(model);
                _logger.LogInformation("Serialized JSON length: {Length} characters", json.Length);
                
                var content = new StringContent(json, Encoding.UTF8, "application/json");
                var response = await _httpClient.PostAsync($"{_baseUrl}/api/tones/assignment", content);
                
                _logger.LogInformation("API response status: {StatusCode}", response.StatusCode);
                _logger.LogInformation("API response is success: {IsSuccess}", response.IsSuccessStatusCode);
                
                if (!response.IsSuccessStatusCode)
                {
                    var errorContent = await response.Content.ReadAsStringAsync();
                    _logger.LogWarning("API returned error status. Content: {ErrorContent}", errorContent);
                }
                
                return response.IsSuccessStatusCode;
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(ex, "Cannot connect to book-data-api at {BaseUrl}. Please ensure book-data-api is running on port 5020.", _baseUrl);
                Console.WriteLine($"ERROR: Cannot connect to book-data-api at {_baseUrl}. Please ensure book-data-api is running on port 5020.");
                return false;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating tone assignment via API");
                return false;
            }
        }

        public async Task<bool> ImportBookReviewsAsync(IFormFile file)
        {
            try
            {
                using var formData = new MultipartFormDataContent();
                using var streamContent = new StreamContent(file.OpenReadStream());
                formData.Add(streamContent, "file", file.FileName);

                var response = await _httpClient.PostAsync($"{_baseUrl}/api/bookreviews/import", formData);
                return response.IsSuccessStatusCode;
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(ex, "Cannot connect to book-data-api at {BaseUrl}. Please ensure book-data-api is running on port 5020.", _baseUrl);
                Console.WriteLine($"ERROR: Cannot connect to book-data-api at {_baseUrl}. Please ensure book-data-api is running on port 5020.");
                return false;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error importing book reviews via API");
                return false;
            }
        }



        private class ApiResponse<T>
        {
            public T? Data { get; set; }
        }
    }
} 