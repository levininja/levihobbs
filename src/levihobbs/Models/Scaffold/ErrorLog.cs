using System;
using System.Collections.Generic;

namespace levihobbs.Models.Scaffold;

public partial class ErrorLog
{
    public int Id { get; set; }

    public string LogLevel { get; set; } = null!;

    public string Message { get; set; } = null!;

    public string Source { get; set; } = null!;

    public string StackTrace { get; set; } = null!;

    public DateTime LogDate { get; set; }
}
