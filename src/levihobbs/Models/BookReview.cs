using System.Text.RegularExpressions;
using System.ComponentModel.DataAnnotations.Schema;

namespace levihobbs.Models
{
    public class BookReview
    {
        public int Id { get; set; }
        public required string Title { get; set; }
        public required string AuthorFirstName { get; set; }
        public required string AuthorLastName { get; set; }
        public required int MyRating { get; set; } // 1-5
        public required decimal AverageRating { get; set; } // 1-5
        public int? NumberOfPages { get; set; }
        public int? OriginalPublicationYear { get; set; }
        public required DateTime DateRead { get; set; }
        public string? MyReview { get; set; }
        
        [DatabaseGenerated(DatabaseGeneratedOption.Computed)]
        public bool HasReviewContent { get; set; }
        
        // Navigation property for many-to-many relationship
        public ICollection<Bookshelf> Bookshelves { get; set; } = new List<Bookshelf>();
                
        public BookCoverImage? CoverImage { get; set; }  // Navigation property for the associated image
        public int? CoverImageId { get; set; }  // Foreign key (nullable to allow reviews without images)

        [NotMapped]
        public string TitleByAuthor => $"{Title} by {AuthorFirstName} {AuthorLastName}".Trim();

        // Read-only property for preview text with "Read More" link
        [NotMapped]
        public string PreviewText
        {
            get
            {
                if (string.IsNullOrWhiteSpace(MyReview))
                    return string.Empty;
                    
                /* Strip all HTML except <b>, </b>, <i>, </i> tags
                   Regex breakdown:
                   < - Match opening angle bracket
                   (?!/?[bi]>) - Negative lookahead that fails to match if what follows is:
                     /? - Optional forward slash (for closing tags)
                     [bi] - Either 'b' or 'i' character
                     > - Closing angle bracket
                   [^>]* - Match any characters that aren't > zero or more times
                   > - Match closing angle bracket */
                string cleanText = Regex.Replace(MyReview, @"<(?!/?[bi]>)[^>]*>", "");
                
                // Get first 300 characters
                string preview = cleanText.Length <= 300 ? cleanText : cleanText.Substring(0, 300);
                
                // Add "Read More" link if text was truncated
                if (cleanText.Length > 300)
                {
                    // Find the last complete word to avoid cutting off mid-word
                    int lastSpace = preview.LastIndexOf(' ');
                    if (lastSpace > 250) // Only trim if we're not cutting too much
                    {
                        preview = preview.Substring(0, lastSpace);
                    }
                    
                    // TODO: implement these links later (are broken for now)
                    preview += $"... <a href=\"/read/reviews/{Id}\">Read More</a>";
                }
                
                return preview;
            }
        }
        
        // Read-only property for estimated how many minutes it takes to read the review
        [NotMapped]
        public int ReadingTimeMinutes
        {
            get
            {
                if (string.IsNullOrWhiteSpace(MyReview))
                    return 0;

                /* Strip all HTML tags to get plain text for word count
                   Regex breakdown:
                   < - Match opening angle bracket
                   [^>]* - Match any characters that aren't > zero or more times
                   > - Match closing angle bracket
                   
                   This removes both opening and closing tags like <p>, </p>, <br>, etc.
                   leaving only the text content */
                string plainText = Regex.Replace(MyReview, @"<[^>]*>", "");
                
                // Count words (split by whitespace and filter out empty entries)
                int wordCount = plainText.Split(new char[] { ' ', '\t', '\n', '\r' }, 
                    StringSplitOptions.RemoveEmptyEntries).Length;
                
                // Calculate reading time: 250 words per minute, minimum 1 minute
                int minutes = Math.Max(1, (int)Math.Ceiling(wordCount / 250.0));
                
                return minutes;
            }
        }
    }
}