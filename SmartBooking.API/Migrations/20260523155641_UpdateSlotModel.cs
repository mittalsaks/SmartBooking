using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SmartBooking.API.Migrations
{
    /// <inheritdoc />
    public partial class UpdateSlotModel : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // 1. Alter the Status column from Enum (int) to String (text)
            migrationBuilder.AlterColumn<string>(
                name: "Status",
                table: "OfferSlots",
                type: "text",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer");

            // 2. Drop the old DateTime columns that PostgreSQL refuses to cast
            migrationBuilder.DropColumn(
                name: "StartTime",
                table: "OfferSlots");

            migrationBuilder.DropColumn(
                name: "EndTime",
                table: "OfferSlots");

            // 3. Add them back as the new TimeSpan (interval) type
            migrationBuilder.AddColumn<TimeSpan>(
                name: "StartTime",
                table: "OfferSlots",
                type: "interval",
                nullable: false,
                defaultValue: new TimeSpan(0, 0, 0, 0, 0));

            migrationBuilder.AddColumn<TimeSpan>(
                name: "EndTime",
                table: "OfferSlots",
                type: "interval",
                nullable: false,
                defaultValue: new TimeSpan(0, 0, 0, 0, 0));

            // 4. Add the brand new columns for the Hackathon requirements
            migrationBuilder.AddColumn<int>(
                name: "BookedCount",
                table: "OfferSlots",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<DateTime>(
                name: "SlotDate",
                table: "OfferSlots",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(name: "BookedCount", table: "OfferSlots");
            migrationBuilder.DropColumn(name: "SlotDate", table: "OfferSlots");
            migrationBuilder.DropColumn(name: "StartTime", table: "OfferSlots");
            migrationBuilder.DropColumn(name: "EndTime", table: "OfferSlots");

            migrationBuilder.AddColumn<DateTime>(
                name: "StartTime",
                table: "OfferSlots",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<DateTime>(
                name: "EndTime",
                table: "OfferSlots",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AlterColumn<int>(
                name: "Status",
                table: "OfferSlots",
                type: "integer",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");
        }
    }
}