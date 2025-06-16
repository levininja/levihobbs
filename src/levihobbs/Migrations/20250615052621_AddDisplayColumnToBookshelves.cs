using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace levihobbs.Migrations
{
    /// <inheritdoc />
    public partial class AddDisplayColumnToBookshelves : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "Display",
                table: "Bookshelves",
                type: "boolean",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "BookshelfGroupings",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "text", nullable: false),
                    DisplayName = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BookshelfGroupings", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "BookshelfGroupingBookshelves",
                columns: table => new
                {
                    BookshelfGroupingsId = table.Column<int>(type: "integer", nullable: false),
                    BookshelvesId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BookshelfGroupingBookshelves", x => new { x.BookshelfGroupingsId, x.BookshelvesId });
                    table.ForeignKey(
                        name: "FK_BookshelfGroupingBookshelves_BookshelfGroupings_BookshelfGr~",
                        column: x => x.BookshelfGroupingsId,
                        principalTable: "BookshelfGroupings",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_BookshelfGroupingBookshelves_Bookshelves_BookshelvesId",
                        column: x => x.BookshelvesId,
                        principalTable: "Bookshelves",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_BookshelfGroupingBookshelves_BookshelvesId",
                table: "BookshelfGroupingBookshelves",
                column: "BookshelvesId");

            migrationBuilder.CreateIndex(
                name: "IX_BookshelfGroupings_Name",
                table: "BookshelfGroupings",
                column: "Name",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "BookshelfGroupingBookshelves");

            migrationBuilder.DropTable(
                name: "BookshelfGroupings");

            migrationBuilder.DropColumn(
                name: "Display",
                table: "Bookshelves");
        }
    }
}
