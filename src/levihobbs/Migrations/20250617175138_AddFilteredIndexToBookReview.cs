using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace levihobbs.Migrations
{
    /// <inheritdoc />
    public partial class AddFilteredIndexToBookReview : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "MyReview",
                table: "BookReviews",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AddColumn<bool>(
                name: "HasReviewContent",
                table: "BookReviews",
                type: "boolean",
                nullable: false,
                computedColumnSql: "CASE WHEN \"MyReview\" IS NOT NULL AND \"MyReview\" != '' THEN true ELSE false END",
                stored: true);

            migrationBuilder.CreateIndex(
                name: "IX_BookReview_HasReviewContent",
                table: "BookReviews",
                column: "HasReviewContent",
                filter: "\"HasReviewContent\" = true");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_BookReview_HasReviewContent",
                table: "BookReviews");

            migrationBuilder.DropColumn(
                name: "HasReviewContent",
                table: "BookReviews");

            migrationBuilder.AlterColumn<string>(
                name: "MyReview",
                table: "BookReviews",
                type: "text",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);
        }
    }
}
