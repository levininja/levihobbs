using System;
using System.Collections.Generic;

namespace levihobbs.Models.Scaffold;

public partial class BookCoverImage
{
    public int Id { get; set; }

    public string Name { get; set; } = null!;

    public byte[] ImageData { get; set; } = null!;

    public int Width { get; set; }

    public int Height { get; set; }

    public string FileType { get; set; } = null!;

    public DateTime DateDownloaded { get; set; }
}
