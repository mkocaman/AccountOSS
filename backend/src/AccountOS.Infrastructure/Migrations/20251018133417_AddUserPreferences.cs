using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AccountOS.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddUserPreferences : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "ix_ip_blacklist_blocked_until",
                table: "ip_blacklist",
                newName: "blocked_until");

            migrationBuilder.CreateTable(
                name: "company_settings",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    company_name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    logo_url = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    website = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    phone = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    email = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    address = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    tax_number = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    tax_office = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    default_currency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    default_language = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    default_timezone = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    default_vat_rate = table.Column<decimal>(type: "numeric(5,2)", nullable: false),
                    default_invoice_due_days = table.Column<int>(type: "integer", nullable: false),
                    default_payment_method = table.Column<int>(type: "integer", nullable: false),
                    invoice_prefix = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    invoice_start_number = table.Column<int>(type: "integer", nullable: false),
                    invoice_number_format = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    invoice_footer = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    default_invoice_notes = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    default_invoice_terms = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    email_sender_name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    email_sender_address = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    email_signature = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    business_hours_start = table.Column<string>(type: "character varying(5)", maxLength: 5, nullable: false),
                    business_hours_end = table.Column<string>(type: "character varying(5)", maxLength: 5, nullable: false),
                    weekend_days = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    fiscal_year_start_month = table.Column<int>(type: "integer", nullable: false),
                    multi_currency_enabled = table.Column<bool>(type: "boolean", nullable: false),
                    inventory_enabled = table.Column<bool>(type: "boolean", nullable: false),
                    expense_management_enabled = table.Column<bool>(type: "boolean", nullable: false),
                    require_two_factor = table.Column<bool>(type: "boolean", nullable: false),
                    require_email_verification = table.Column<bool>(type: "boolean", nullable: false),
                    custom_settings = table.Column<string>(type: "jsonb", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    created_by = table.Column<Guid>(type: "uuid", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    updated_by = table.Column<Guid>(type: "uuid", nullable: true),
                    is_deleted = table.Column<bool>(type: "boolean", nullable: false),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_by = table.Column<Guid>(type: "uuid", nullable: true),
                    RowVersion = table.Column<byte[]>(type: "bytea", nullable: false),
                    company_id = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_company_settings", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "dashboard_widgets",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    widget_type = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    title = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    settings = table.Column<string>(type: "jsonb", nullable: true),
                    position_x = table.Column<int>(type: "integer", nullable: false),
                    position_y = table.Column<int>(type: "integer", nullable: false),
                    width = table.Column<int>(type: "integer", nullable: false),
                    height = table.Column<int>(type: "integer", nullable: false),
                    is_visible = table.Column<bool>(type: "boolean", nullable: false),
                    order = table.Column<int>(type: "integer", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    created_by = table.Column<Guid>(type: "uuid", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    updated_by = table.Column<Guid>(type: "uuid", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DeletedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    RowVersion = table.Column<byte[]>(type: "bytea", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_dashboard_widgets", x => x.Id);
                    table.ForeignKey(
                        name: "FK_dashboard_widgets_users_user_id",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "user_preferences",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    company_id = table.Column<Guid>(type: "uuid", nullable: false),
                    theme = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    language = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    timezone = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    date_format = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    time_format = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    number_format = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    default_currency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    dashboard_layout = table.Column<string>(type: "jsonb", nullable: true),
                    default_page = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    items_per_page = table.Column<int>(type: "integer", nullable: false),
                    compact_mode = table.Column<bool>(type: "boolean", nullable: false),
                    sidebar_collapsed = table.Column<bool>(type: "boolean", nullable: false),
                    email_notifications_enabled = table.Column<bool>(type: "boolean", nullable: false),
                    daily_digest_email = table.Column<bool>(type: "boolean", nullable: false),
                    weekly_report_email = table.Column<bool>(type: "boolean", nullable: false),
                    default_invoice_due_days = table.Column<int>(type: "integer", nullable: true),
                    default_payment_method = table.Column<int>(type: "integer", nullable: true),
                    default_vat_rate = table.Column<decimal>(type: "numeric(5,2)", nullable: true),
                    invoice_notes_template = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    profile_visibility = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    show_last_activity = table.Column<bool>(type: "boolean", nullable: false),
                    show_email = table.Column<bool>(type: "boolean", nullable: false),
                    keyboard_shortcuts = table.Column<string>(type: "jsonb", nullable: true),
                    custom_css = table.Column<string>(type: "character varying(5000)", maxLength: 5000, nullable: true),
                    additional_settings = table.Column<string>(type: "jsonb", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    created_by = table.Column<Guid>(type: "uuid", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    updated_by = table.Column<Guid>(type: "uuid", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DeletedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    RowVersion = table.Column<byte[]>(type: "bytea", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_user_preferences", x => x.Id);
                    table.ForeignKey(
                        name: "FK_user_preferences_companies_company_id",
                        column: x => x.company_id,
                        principalTable: "companies",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_user_preferences_users_user_id",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "ix_ip_blacklist_blocked_until",
                table: "ip_blacklist",
                column: "blocked_until");

            migrationBuilder.CreateIndex(
                name: "ix_company_settings_company",
                table: "company_settings",
                column: "company_id",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_dashboard_widgets_user_order",
                table: "dashboard_widgets",
                columns: new[] { "user_id", "order" });

            migrationBuilder.CreateIndex(
                name: "ix_dashboard_widgets_user_visible",
                table: "dashboard_widgets",
                columns: new[] { "user_id", "is_visible" });

            migrationBuilder.CreateIndex(
                name: "ix_user_preferences_company_language",
                table: "user_preferences",
                columns: new[] { "company_id", "language" });

            migrationBuilder.CreateIndex(
                name: "ix_user_preferences_user",
                table: "user_preferences",
                column: "user_id",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "company_settings");

            migrationBuilder.DropTable(
                name: "dashboard_widgets");

            migrationBuilder.DropTable(
                name: "user_preferences");

            migrationBuilder.DropIndex(
                name: "ix_ip_blacklist_blocked_until",
                table: "ip_blacklist");

            migrationBuilder.RenameColumn(
                name: "blocked_until",
                table: "ip_blacklist",
                newName: "ix_ip_blacklist_blocked_until");
        }
    }
}
