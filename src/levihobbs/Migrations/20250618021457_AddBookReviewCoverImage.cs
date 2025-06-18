using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace levihobbs.Migrations
{
    /// <inheritdoc />
    public partial class AddBookReviewCoverImage : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "CoverImageId",
                table: "BookReviews",
                type: "integer",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_BookReviews_CoverImageId",
                table: "BookReviews",
                column: "CoverImageId");

            migrationBuilder.AddForeignKey(
                name: "FK_BookReviews_BookCoverImages_CoverImageId",
                table: "BookReviews",
                column: "CoverImageId",
                principalTable: "BookCoverImages",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_BookReviews_BookCoverImages_CoverImageId",
                table: "BookReviews");

            migrationBuilder.DropIndex(
                name: "IX_BookReviews_CoverImageId",
                table: "BookReviews");

            migrationBuilder.DropColumn(
                name: "CoverImageId",
                table: "BookReviews");
        }
    }
}
