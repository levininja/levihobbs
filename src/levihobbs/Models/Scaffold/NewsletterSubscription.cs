using System;
using System.Collections.Generic;

namespace levihobbs.Models.Scaffold;

public partial class NewsletterSubscription
{
    public int Id { get; set; }

    public string Email { get; set; } = null!;

    public DateTime SubscriptionDate { get; set; }
}
