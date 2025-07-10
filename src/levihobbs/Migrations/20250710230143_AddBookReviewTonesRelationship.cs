using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace levihobbs.Migrations
{
    /// <inheritdoc />
    public partial class AddBookReviewTonesRelationship : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "BookReviewTones",
                columns: table => new
                {
                    BookReviewsId = table.Column<int>(type: "integer", nullable: false),
                    TonesId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BookReviewTones", x => new { x.BookReviewsId, x.TonesId });
                    table.ForeignKey(
                        name: "FK_BookReviewTones_BookReviews_BookReviewsId",
                        column: x => x.BookReviewsId,
                        principalTable: "BookReviews",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_BookReviewTones_Tones_TonesId",
                        column: x => x.TonesId,
                        principalTable: "Tones",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_BookReviewTones_TonesId",
                table: "BookReviewTones",
                column: "TonesId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "BookReviewTones");
        }
    }
}
