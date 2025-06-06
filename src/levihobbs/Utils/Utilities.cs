using System.Text.RegularExpressions;

namespace levihobbs.Utils;

public static class Utilities
{
    /// <summary>
    /// Cleans and normalizes a book review search term (which are normally comprised of a title and author) 
    /// by removing unwanted characters and normalizing whitespace.
    /// </summary>
    /// <param name="searchTerm">The raw search term to be cleaned.</param>
    /// <returns>A cleaned version of the search term with normalized whitespace and removed special characters.</returns>
    public static string CleanBookReviewSearchTerm(string searchTerm)
    {
        if (string.IsNullOrEmpty(searchTerm))
            return string.Empty;
            
        // Clean up the search term by replacing newlines and extra spaces with a single space
        // [\r\n]+ - Matches one or more carriage returns or newlines
        // | - OR operator
        // \s+ - Matches one or more whitespace characters (spaces, tabs, etc.)
        string cleanedTerm = Regex.Replace(searchTerm, @"[\r\n]+|\s+", " ");
        
        // Remove special characters that might interfere with the search
        // [^\w\s:;'",.? !&-] - Matches any character that is NOT:
        //   \w - a word character (letter, digit, or underscore)
        //   \s - a whitespace character
        //   :;'",()&#.? !&- - legitimate punctuation characters that we want to keep since they
        //      may show up in book titles
        cleanedTerm = Regex.Replace(cleanedTerm, @"[^\w\s:;'"",()&#\.\?\!\-]", "");
        
        // Remove any leading or trailing whitespace
        return cleanedTerm.Trim();
    }
}