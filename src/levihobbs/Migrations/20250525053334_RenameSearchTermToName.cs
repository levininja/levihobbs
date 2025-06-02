using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace levihobbs.Migrations
{
    /// <inheritdoc />
    public partial class RenameSearchTermToName : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "SearchTerm",
                table: "BookCoverImages",
                newName: "Name");

            migrationBuilder.RenameIndex(
                name: "IX_BookCoverImages_SearchTerm",
                table: "BookCoverImages",
                newName: "IX_BookCoverImages_Name");

            migrationBuilder.AlterColumn<string>(
                name: "FileType",
                table: "BookCoverImages",
                type: "text",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Name",
                table: "BookCoverImages",
                newName: "SearchTerm");

            migrationBuilder.RenameIndex(
                name: "IX_BookCoverImages_Name",
                table: "BookCoverImages",
                newName: "IX_BookCoverImages_SearchTerm");

            migrationBuilder.AlterColumn<string>(
                name: "FileType",
                table: "BookCoverImages",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text");
        }
    }
}
