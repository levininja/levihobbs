using System;
using System.Collections.Generic;

namespace levihobbs.Models.Scaffold;

public partial class BookReview
{
    public int Id { get; set; }

    public string Title { get; set; } = null!;

    public string AuthorFirstName { get; set; } = null!;

    public string AuthorLastName { get; set; } = null!;

    public int MyRating { get; set; }

    public decimal AverageRating { get; set; }

    public int? NumberOfPages { get; set; }

    public int? OriginalPublicationYear { get; set; }

    public DateTime DateRead { get; set; }

    public string MyReview { get; set; } = null!;

    public virtual ICollection<Bookshelf> Bookshelves { get; set; } = new List<Bookshelf>();
}
