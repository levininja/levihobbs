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
    public DbSet<Tone> Tones { get; set; } = null!;
    public DbSet<Genre> Genres { get; set; } = null!;

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
            
            // Add index for reviews with content
            entity.Property(b => b.HasReviewContent)
                .HasComputedColumnSql("CASE WHEN \"MyReview\" IS NOT NULL AND \"MyReview\" != '' THEN true ELSE false END", stored: true);

            entity.HasIndex(b => b.HasReviewContent)
                .HasDatabaseName("IX_BookReview_HasReviewContent")
                .HasFilter("\"HasReviewContent\" = true");

            // Assumes BookCoverImage can be associated with multiple reviews if needed, but the FK is on BookReview
            entity.HasOne(br => br.CoverImage)
                .WithMany()  // No inverse navigation (BookCoverImage doesn't need a list of reviews)
                .HasForeignKey(br => br.CoverImageId)
                .IsRequired(false)  // Allows null for reviews without images
                .OnDelete(DeleteBehavior.SetNull);  // If image is deleted, set FK to null instead of cascading
                
            // Add index for searchable string
            entity.HasIndex(b => b.SearchableString)
                .HasDatabaseName("IX_BookReview_SearchableString");
        });
            
        // Configure many-to-many relationship between BookReview and Bookshelf
        modelBuilder.Entity<BookReview>()
            .HasMany(br => br.Bookshelves)
            .WithMany(bs => bs.BookReviews)
            .UsingEntity(j => j.ToTable("BookReviewBookshelves"));
            
        // Configure many-to-many relationship between BookReview and Tone
        modelBuilder.Entity<BookReview>()
            .HasMany(br => br.Tones)
            .WithMany(t => t.BookReviews)
            .UsingEntity(j => j.ToTable("BookReviewTones"));
            
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

        modelBuilder.Entity<Genre>()
            .HasIndex(g => g.Name)
            .IsUnique();
            
        // Configure self-referencing relationship for Tone
        modelBuilder.Entity<Tone>(entity =>
        {
            entity.HasOne(t => t.Parent)
                .WithMany(t => t.Subtones)
                .HasForeignKey(t => t.ParentId)
                .IsRequired(false)
                .OnDelete(DeleteBehavior.Restrict); // Prevent cascade delete to avoid orphaned records
                
            entity.HasIndex(t => t.Name)
                .IsUnique();
        });
    }
}
