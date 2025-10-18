using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AccountOS.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddDocumentNumberingTemplates : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "document_numbering_templates",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    DocumentType = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    SubType = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    Template = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Prefix = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    IncludeYear = table.Column<bool>(type: "boolean", nullable: false),
                    YearFormat = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    IncludeMonth = table.Column<bool>(type: "boolean", nullable: false),
                    MonthFormat = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    SequenceLength = table.Column<int>(type: "integer", nullable: false),
                    StartingNumber = table.Column<int>(type: "integer", nullable: false),
                    CurrentSequence = table.Column<int>(type: "integer", nullable: false),
                    ResetFrequency = table.Column<int>(type: "integer", nullable: false),
                    LastResetDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ExampleOutput = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uuid", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    UpdatedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DeletedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    RowVersion = table.Column<byte[]>(type: "bytea", rowVersion: true, nullable: false),
                    CompanyId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_document_numbering_templates", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_doc_numbering_company_type",
                table: "document_numbering_templates",
                columns: new[] { "CompanyId", "DocumentType", "SubType" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "document_numbering_templates");
        }
    }
}
