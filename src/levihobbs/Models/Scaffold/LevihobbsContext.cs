using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace levihobbs.Models.Scaffold;

public partial class LevihobbsContext : DbContext
{
    public LevihobbsContext()
    {
    }

    public LevihobbsContext(DbContextOptions<LevihobbsContext> options)
        : base(options)
    {
    }

    public virtual DbSet<BookCoverImage> BookCoverImages { get; set; }

    public virtual DbSet<BookReview> BookReviews { get; set; }

    public virtual DbSet<Bookshelf> Bookshelves { get; set; }

    public virtual DbSet<BookshelfGrouping> BookshelfGroupings { get; set; }

    public virtual DbSet<ErrorLog> ErrorLogs { get; set; }

    public virtual DbSet<NewsletterSubscription> NewsletterSubscriptions { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        if (!optionsBuilder.IsConfigured)
        {
            IConfigurationRoot configuration = new ConfigurationBuilder()
                .SetBasePath(Directory.GetCurrentDirectory())
                .AddJsonFile("appsettings.json")
                .Build();
            optionsBuilder.UseNpgsql(configuration.GetConnectionString("DefaultConnection"));
        }
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<BookCoverImage>(entity =>
        {
            entity.HasIndex(e => e.Name, "IX_BookCoverImages_Name").IsUnique();

            entity.Property(e => e.FileType).HasDefaultValueSql("''::text");
        });

        modelBuilder.Entity<BookReview>(entity =>
        {
            entity.Property(e => e.AverageRating).HasPrecision(3, 2);

            entity.HasMany(d => d.Bookshelves).WithMany(p => p.BookReviews)
                .UsingEntity<Dictionary<string, object>>(
                    "BookReviewBookshelf",
                    r => r.HasOne<Bookshelf>().WithMany().HasForeignKey("BookshelvesId"),
                    l => l.HasOne<BookReview>().WithMany().HasForeignKey("BookReviewsId"),
                    j =>
                    {
                        j.HasKey("BookReviewsId", "BookshelvesId");
                        j.ToTable("BookReviewBookshelves");
                        j.HasIndex(new[] { "BookshelvesId" }, "IX_BookReviewBookshelves_BookshelvesId");
                    });
        });

        modelBuilder.Entity<Bookshelf>(entity =>
        {
            entity.HasIndex(e => e.Name, "IX_Bookshelves_Name").IsUnique();
        });

        modelBuilder.Entity<BookshelfGrouping>(entity =>
        {
            entity.HasIndex(e => e.Name, "IX_BookshelfGroupings_Name").IsUnique();

            entity.HasMany(d => d.Bookshelves).WithMany(p => p.BookshelfGroupings)
                .UsingEntity<Dictionary<string, object>>(
                    "BookshelfGroupingBookshelf",
                    r => r.HasOne<Bookshelf>().WithMany().HasForeignKey("BookshelvesId"),
                    l => l.HasOne<BookshelfGrouping>().WithMany()
                        .HasForeignKey("BookshelfGroupingsId")
                        .HasConstraintName("FK_BookshelfGroupingBookshelves_BookshelfGroupings_BookshelfGr~"),
                    j =>
                    {
                        j.HasKey("BookshelfGroupingsId", "BookshelvesId");
                        j.ToTable("BookshelfGroupingBookshelves");
                        j.HasIndex(new[] { "BookshelvesId" }, "IX_BookshelfGroupingBookshelves_BookshelvesId");
                    });
        });

        modelBuilder.Entity<ErrorLog>(entity =>
        {
            entity.Property(e => e.StackTrace).HasMaxLength(1024);
        });

        modelBuilder.Entity<NewsletterSubscription>(entity =>
        {
            entity.HasIndex(e => e.Email, "IX_NewsletterSubscriptions_Email").IsUnique();

            entity.Property(e => e.Email).HasMaxLength(100);
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
