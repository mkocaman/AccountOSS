using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AccountOS.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class UpdateCompanyFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "LogoPath",
                table: "companies",
                newName: "LogoUrl");

            migrationBuilder.RenameColumn(
                name: "Language",
                table: "companies",
                newName: "DefaultLanguage");

            migrationBuilder.RenameColumn(
                name: "Currency",
                table: "companies",
                newName: "BaseCurrency");

            migrationBuilder.AddColumn<DateTime>(
                name: "JoinedAt",
                table: "user_companies",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<string>(
                name: "PrimaryColor",
                table: "companies",
                type: "character varying(20)",
                maxLength: 20,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "JoinedAt",
                table: "user_companies");

            migrationBuilder.DropColumn(
                name: "PrimaryColor",
                table: "companies");

            migrationBuilder.RenameColumn(
                name: "LogoUrl",
                table: "companies",
                newName: "LogoPath");

            migrationBuilder.RenameColumn(
                name: "DefaultLanguage",
                table: "companies",
                newName: "Language");

            migrationBuilder.RenameColumn(
                name: "BaseCurrency",
                table: "companies",
                newName: "Currency");
        }
    }
}
