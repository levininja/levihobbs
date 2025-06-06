using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace levihobbs.Migrations
{
    /// <inheritdoc />
    public partial class RenameDateAccessedToDateDownloaded : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "DateAccessed",
                table: "BookCoverImages",
                newName: "DateDownloaded");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "DateDownloaded",
                table: "BookCoverImages",
                newName: "DateAccessed");
        }
    }
}
