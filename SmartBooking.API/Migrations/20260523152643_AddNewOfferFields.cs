using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SmartBooking.API.Migrations
{
    /// <inheritdoc />
    public partial class AddNewOfferFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "DiscountPrice",
                table: "Offers",
                newName: "OfferPrice");

            migrationBuilder.AlterColumn<string>(
                name: "Status",
                table: "Offers",
                type: "text",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AddColumn<string>(
                name: "Category",
                table: "Offers",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<decimal>(
                name: "DiscountPercentage",
                table: "Offers",
                type: "numeric(5,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<DateTime>(
                name: "EndDate",
                table: "Offers",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<TimeSpan>(
                name: "EndTime",
                table: "Offers",
                type: "interval",
                nullable: false,
                defaultValue: new TimeSpan(0, 0, 0, 0, 0));

            migrationBuilder.AddColumn<int>(
                name: "MaxBookingPerCustomer",
                table: "Offers",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<DateTime>(
                name: "StartDate",
                table: "Offers",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<TimeSpan>(
                name: "StartTime",
                table: "Offers",
                type: "interval",
                nullable: false,
                defaultValue: new TimeSpan(0, 0, 0, 0, 0));

            migrationBuilder.AddColumn<string>(
                name: "TermsAndConditions",
                table: "Offers",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "TotalCapacity",
                table: "Offers",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Category",
                table: "Offers");

            migrationBuilder.DropColumn(
                name: "DiscountPercentage",
                table: "Offers");

            migrationBuilder.DropColumn(
                name: "EndDate",
                table: "Offers");

            migrationBuilder.DropColumn(
                name: "EndTime",
                table: "Offers");

            migrationBuilder.DropColumn(
                name: "MaxBookingPerCustomer",
                table: "Offers");

            migrationBuilder.DropColumn(
                name: "StartDate",
                table: "Offers");

            migrationBuilder.DropColumn(
                name: "StartTime",
                table: "Offers");

            migrationBuilder.DropColumn(
                name: "TermsAndConditions",
                table: "Offers");

            migrationBuilder.DropColumn(
                name: "TotalCapacity",
                table: "Offers");

            migrationBuilder.RenameColumn(
                name: "OfferPrice",
                table: "Offers",
                newName: "DiscountPrice");

            migrationBuilder.AlterColumn<int>(
                name: "Status",
                table: "Offers",
                type: "integer",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");
        }
    }
}
