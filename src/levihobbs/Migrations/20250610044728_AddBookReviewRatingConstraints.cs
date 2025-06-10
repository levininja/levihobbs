using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace levihobbs.Migrations
{
    /// <inheritdoc />
    public partial class AddBookReviewRatingConstraints : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddCheckConstraint(
                name: "CK_BookReview_AverageRating",
                table: "BookReviews",
                sql: "\"AverageRating\" BETWEEN 1 AND 5");

            migrationBuilder.AddCheckConstraint(
                name: "CK_BookReview_MyRating",
                table: "BookReviews",
                sql: "\"MyRating\" BETWEEN 1 AND 5");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropCheckConstraint(
                name: "CK_BookReview_AverageRating",
                table: "BookReviews");

            migrationBuilder.DropCheckConstraint(
                name: "CK_BookReview_MyRating",
                table: "BookReviews");
        }
    }
}
