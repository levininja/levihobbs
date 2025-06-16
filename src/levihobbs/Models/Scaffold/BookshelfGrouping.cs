using System;
using System.Collections.Generic;

namespace levihobbs.Models.Scaffold;

public partial class BookshelfGrouping
{
    public int Id { get; set; }

    public string Name { get; set; } = null!;

    public string? DisplayName { get; set; }

    public virtual ICollection<Bookshelf> Bookshelves { get; set; } = new List<Bookshelf>();
}
