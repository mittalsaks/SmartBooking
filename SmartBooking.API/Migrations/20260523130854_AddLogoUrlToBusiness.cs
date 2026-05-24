using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SmartBooking.API.Migrations
{
    /// <inheritdoc />
    public partial class AddLogoUrlToBusiness : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "LogoUrl",
                table: "Businesses",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "LogoUrl",
                table: "Businesses");
        }
    }
}
