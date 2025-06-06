using Xunit;
using levihobbs.Utils;
using FluentAssertions;

namespace levihobbs.Tests.UtilitiesTests
{
    public class CleanSearchTermTests
    {
        [Theory]
        [InlineData("", "")]
        [InlineData(null, "")]
        public void CleanSearchTerm_HandlesEmptyOrNull(string searchTerm, string expected)
        {
            // Act
            string result = Utilities.CleanSearchTerm(searchTerm);

            // Assert
            result.Should().Be(expected);
        }

        [Theory]
        [InlineData("The Great\nAdventure", "The Great Adventure")]
        [InlineData("Line1\r\nLine2", "Line1 Line2")]
        [InlineData("Multiple\n\n\nNewlines", "Multiple Newlines")]
        public void CleanSearchTerm_NormalizesNewlinesAndSpaces(string searchTerm, string expected)
        {
            // Act
            string result = Utilities.CleanSearchTerm(searchTerm);

            // Assert
            result.Should().Be(expected);
        }

        [Theory]
        [InlineData("Hello! World?", "Hello! World?")]
        [InlineData("Test@123", "Test123")]
        [InlineData("Special#Chars$%^", "SpecialChars")]
        [InlineData("Keep: these; punctuation.", "Keep: these; punctuation.")]
        public void CleanSearchTerm_HandlesSpecialCharacters(string searchTerm, string expected)
        {
            // Act
            string result = Utilities.CleanSearchTerm(searchTerm);

            // Assert
            result.Should().Be(expected);
        }

        [Theory]
        [InlineData("  Book  Title  by  Author Name ", "Book Title by Author Name")]
        public void CleanSearchTerm_HandlesExtraSpacesAndTrim(string searchTerm, string expected)
        {
            // Act
            string result = Utilities.CleanSearchTerm(searchTerm);

            // Assert
            result.Should().Be(expected);
        }

        [Theory]
        [InlineData("Book (Vol. 1) - Part 2 by A. B. Smith", "Book (Vol. 1) - Part 2 by A. B. Smith")]
        [InlineData("Book: The Sequel by Author", "Book: The Sequel by Author")]
        [InlineData("Book; Another Chapter by Author", "Book; Another Chapter by Author")]
        [InlineData("Book\"Quoted\" by Author", "Book\"Quoted\" by Author")]
        [InlineData("Book'Quoted' by Author", "Book'Quoted' by Author")]
        [InlineData("Book! by Author", "Book! by Author")]
        [InlineData("Book? by Author", "Book? by Author")]
        [InlineData("Book & Author by Author", "Book & Author by Author")]
        [InlineData("Book, The Sequel by Author", "Book, The Sequel by Author")]
        [InlineData("Book. The End by Author", "Book. The End by Author")]
        [InlineData("Title by Author - 2023", "Title by Author - 2023")]
        public void CleanSearchTerm_PreservesAllowedChars(string searchTerm, string expected)
        {
            // Act
            string result = Utilities.CleanSearchTerm(searchTerm);

            // Assert
            result.Should().Be(expected);
        }

        [Theory]
        [InlineData(" by Author", "by Author")]
        [InlineData("Title by ", "Title by")]
        [InlineData(" by ", "by")]
        public void CleanSearchTerm_HandlesEmptyTitlesAndAuthors(string searchTerm, string expected)
        {
            // Act
            string result = Utilities.CleanSearchTerm(searchTerm);

            // Assert
            result.Should().Be(expected);
        }
    }
}