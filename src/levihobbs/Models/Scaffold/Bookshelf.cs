using System;
using System.Collections.Generic;

namespace levihobbs.Models.Scaffold;

public partial class Bookshelf
{
    public int Id { get; set; }

    public string Name { get; set; } = null!;

    public string? DisplayName { get; set; }

    public bool? Display { get; set; }

    public virtual ICollection<BookReview> BookReviews { get; set; } = new List<BookReview>();

    public virtual ICollection<BookshelfGrouping> BookshelfGroupings { get; set; } = new List<BookshelfGrouping>();
}
