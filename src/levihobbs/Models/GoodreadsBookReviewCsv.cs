// Used for mapping Goodreads book review CSV columns to properties for import.
using CsvHelper.Configuration.Attributes;

namespace levihobbs.Models
{
    public class GoodreadsBookReviewCsv
    {
        [Name("Title")]
        public string? Title { get; set; }

        [Name("Author l-f")]
        public string? Author_l_f { get; set; }

        [Name("Additional Authors")]
        public string? Additional_Authors { get; set; }

        [Name("Publisher")]
        public string? Publisher { get; set; }

        [Name("My Rating")]
        public string? My_Rating { get; set; }

        [Name("Average Rating")]
        public string? Average_Rating { get; set; }

        [Name("Number of Pages")]
        public string? Number_of_Pages { get; set; }

        [Name("Original Publication Year")]
        public string? Original_Publication_Year { get; set; }

        [Name("Date Read")]
        public string? Date_Read { get; set; }

        [Name("Bookshelves")]
        public string? Bookshelves { get; set; }

        [Name("Exclusive Shelf")]
        public string? Exclusive_Shelf { get; set; }

        [Name("My Review")]
        public string? My_Review { get; set; }
    }
} 