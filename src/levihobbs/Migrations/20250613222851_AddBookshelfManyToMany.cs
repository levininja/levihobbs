using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace levihobbs.Migrations
{
    /// <inheritdoc />
    public partial class AddBookshelfManyToMany : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Bookshelves",
                table: "BookReviews");

            migrationBuilder.CreateTable(
                name: "Bookshelves",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "text", nullable: false),
                    DisplayName = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Bookshelves", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "BookReviewBookshelves",
                columns: table => new
                {
                    BookReviewsId = table.Column<int>(type: "integer", nullable: false),
                    BookshelvesId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BookReviewBookshelves", x => new { x.BookReviewsId, x.BookshelvesId });
                    table.ForeignKey(
                        name: "FK_BookReviewBookshelves_BookReviews_BookReviewsId",
                        column: x => x.BookReviewsId,
                        principalTable: "BookReviews",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_BookReviewBookshelves_Bookshelves_BookshelvesId",
                        column: x => x.BookshelvesId,
                        principalTable: "Bookshelves",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_BookReviewBookshelves_BookshelvesId",
                table: "BookReviewBookshelves",
                column: "BookshelvesId");

            migrationBuilder.CreateIndex(
                name: "IX_Bookshelves_Name",
                table: "Bookshelves",
                column: "Name",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "BookReviewBookshelves");

            migrationBuilder.DropTable(
                name: "Bookshelves");

            migrationBuilder.AddColumn<string>(
                name: "Bookshelves",
                table: "BookReviews",
                type: "text",
                nullable: false,
                defaultValue: "");
        }
    }
}
