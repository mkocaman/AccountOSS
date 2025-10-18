using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AccountOS.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddLanguageManagementAndUserLimits : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "MaxUsers",
                table: "companies",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "MaxUsers",
                table: "companies");
        }
    }
}
