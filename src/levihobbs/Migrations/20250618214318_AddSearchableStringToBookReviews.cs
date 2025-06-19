using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace levihobbs.Migrations
{
    /// <inheritdoc />
    public partial class AddSearchableStringToBookReviews : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "SearchableString",
                table: "BookReviews",
                type: "text",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_BookReview_SearchableString",
                table: "BookReviews",
                column: "SearchableString");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_BookReview_SearchableString",
                table: "BookReviews");

            migrationBuilder.DropColumn(
                name: "SearchableString",
                table: "BookReviews");
        }
    }
}
