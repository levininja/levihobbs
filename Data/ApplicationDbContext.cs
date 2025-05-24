using Microsoft.EntityFrameworkCore;
using levihobbs.Models;

namespace levihobbs.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<NewsletterSubscription> NewsletterSubscriptions { get; set; } = null!;
    public DbSet<ErrorLog> ErrorLogs { get; set; } = null!;

    // Add your DbSet properties here
    // Example: public DbSet<Newsletter> Newsletters { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<NewsletterSubscription>()
            .HasIndex(s => s.Email)
            .IsUnique();
            
        modelBuilder.Entity<ErrorLog>()
            .Property(e => e.StackTrace)
            .HasMaxLength(1024);
    }
} 