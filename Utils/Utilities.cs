using System.Text.RegularExpressions;

namespace levihobbs.Utils;

public static class Utilities
{
    public static string CleanSearchTerm(string title, string author)
    {
        // Clean up the search term by removing newlines and extra spaces
        string cleanTitle = title.Replace("\n", " ").Replace("\r", "").Trim();
        string cleanAuthor = author.Replace("\n", " ").Replace("\r", "").Trim();
        
        // Remove special characters that might interfere with the search
        cleanTitle = Regex.Replace(cleanTitle, @"[^\w\s\-\(\)\.]", "");
        cleanAuthor = Regex.Replace(cleanAuthor, @"[^\w\s\-\(\)\.]", "");
        
        return $"{cleanTitle} by {cleanAuthor}";
    }
} 