using System.ComponentModel.DataAnnotations;

namespace levihobbs.Models;

public class ContactFormModel
{
    [Required(ErrorMessage = "Name is required")]
    public string Name { get; set; } = string.Empty;

    [Required(ErrorMessage = "Email is required")]
    [EmailAddress(ErrorMessage = "Invalid email address")]
    public string Email { get; set; } = string.Empty;

    public string? Phone { get; set; }

    public string? CurrentWebsite { get; set; }

    [Required(ErrorMessage = "Subject is required")]
    public string Subject { get; set; } = string.Empty;

    [Required(ErrorMessage = "Message is required")]
    public string Message { get; set; } = string.Empty;
}
