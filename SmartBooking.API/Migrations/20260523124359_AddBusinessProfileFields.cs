using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SmartBooking.API.Migrations
{
    /// <inheritdoc />
    public partial class AddBusinessProfileFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Description",
                table: "Businesses");

            migrationBuilder.RenameColumn(
                name: "CompanyName",
                table: "Businesses",
                newName: "Name");

            migrationBuilder.AddColumn<string>(
                name: "Address",
                table: "Businesses",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "BusinessType",
                table: "Businesses",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "City",
                table: "Businesses",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "ClosingTime",
                table: "Businesses",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Email",
                table: "Businesses",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "OpeningTime",
                table: "Businesses",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "OwnerName",
                table: "Businesses",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Phone",
                table: "Businesses",
                type: "text",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Address",
                table: "Businesses");

            migrationBuilder.DropColumn(
                name: "BusinessType",
                table: "Businesses");

            migrationBuilder.DropColumn(
                name: "City",
                table: "Businesses");

            migrationBuilder.DropColumn(
                name: "ClosingTime",
                table: "Businesses");

            migrationBuilder.DropColumn(
                name: "Email",
                table: "Businesses");

            migrationBuilder.DropColumn(
                name: "OpeningTime",
                table: "Businesses");

            migrationBuilder.DropColumn(
                name: "OwnerName",
                table: "Businesses");

            migrationBuilder.DropColumn(
                name: "Phone",
                table: "Businesses");

            migrationBuilder.RenameColumn(
                name: "Name",
                table: "Businesses",
                newName: "CompanyName");

            migrationBuilder.AddColumn<string>(
                name: "Description",
                table: "Businesses",
                type: "character varying(500)",
                maxLength: 500,
                nullable: false,
                defaultValue: "");
        }
    }
}
