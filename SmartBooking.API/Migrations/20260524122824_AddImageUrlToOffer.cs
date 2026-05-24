using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SmartBooking.API.Migrations
{
    /// <inheritdoc />
    public partial class AddImageUrlToOffer : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ImageUrl",
                table: "Offers",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ImageUrl",
                table: "Offers");
        }
    }
}
