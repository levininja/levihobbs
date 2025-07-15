using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace levihobbs.Migrations
{
    /// <inheritdoc />
    public partial class AddIsGenreBasedToBookshelvesAndGroupings : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsGenreBased",
                table: "Bookshelves",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsGenreBased",
                table: "BookshelfGroupings",
                type: "boolean",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsGenreBased",
                table: "Bookshelves");

            migrationBuilder.DropColumn(
                name: "IsGenreBased",
                table: "BookshelfGroupings");
        }
    }
}
