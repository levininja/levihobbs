using System;
using System.ComponentModel.DataAnnotations;
using Microsoft.EntityFrameworkCore;

namespace levihobbs.Models;

public class NewsletterSubscription
{
    public int Id { get; set; }
    
    [Required]
    [EmailAddress]
    [MaxLength(100)]
    public string Email { get; set; } = string.Empty;
    
    public DateTime SubscriptionDate { get; set; } = DateTime.UtcNow;
} 