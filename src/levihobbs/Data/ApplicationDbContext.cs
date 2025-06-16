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
    public DbSet<Bookshelf> Bookshelves { get; set; } = null!;
    public DbSet<BookshelfGrouping> BookshelfGroupings { get; set; } = null!;

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
        
        // Configure many-to-many relationship between BookReview and Bookshelf
        modelBuilder.Entity<BookReview>()
            .HasMany(br => br.Bookshelves)
            .WithMany(bs => bs.BookReviews)
            .UsingEntity(j => j.ToTable("BookReviewBookshelves"));
            
        modelBuilder.Entity<Bookshelf>()
            .HasIndex(bs => bs.Name)
            .IsUnique();
            
        // Configure many-to-many relationship between Bookshelf and BookshelfGrouping
        modelBuilder.Entity<Bookshelf>()
            .HasMany(bs => bs.BookshelfGroupings)
            .WithMany(bg => bg.Bookshelves)
            .UsingEntity(j => j.ToTable("BookshelfGroupingBookshelves"));
            
        modelBuilder.Entity<BookshelfGrouping>()
            .HasIndex(bg => bg.Name)
            .IsUnique();
    }
} 