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
    public DbSet<BookCoverImage> BookCoverImages { get; set; } = null!;
    public DbSet<BookReview> BookReviews { get; set; } = null!;

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
            
        modelBuilder.Entity<BookCoverImage>()
            .HasIndex(b => b.Name)
            .IsUnique();
            
        modelBuilder.Entity<BookReview>(entity =>
        {
            entity.ToTable(t =>
            {
                t.HasCheckConstraint("CK_BookReview_MyRating", "\"MyRating\" BETWEEN 0 AND 5");
                t.HasCheckConstraint("CK_BookReview_AverageRating", "\"AverageRating\" BETWEEN 0 AND 5");
            });
            entity.Property(b => b.MyRating).HasColumnType("integer");
            entity.Property(b => b.AverageRating).HasColumnType("decimal(3,2)");
        });
    }
} 