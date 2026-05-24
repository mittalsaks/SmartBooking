using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SmartBooking.API.Migrations
{
    /// <inheritdoc />
    public partial class AddBookingDetailsAndRelationships : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Bookings_OfferSlots_SlotId",
                table: "Bookings");

            migrationBuilder.DropForeignKey(
                name: "FK_Offers_Businesses_BusinessId",
                table: "Offers");

            migrationBuilder.AddColumn<int>(
                name: "BusinessId1",
                table: "Offers",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CustomerEmail",
                table: "Bookings",
                type: "character varying(200)",
                maxLength: 200,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "CustomerName",
                table: "Bookings",
                type: "character varying(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "CustomerPhone",
                table: "Bookings",
                type: "character varying(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "OfferId",
                table: "Bookings",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "PeopleCount",
                table: "Bookings",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "SpecialNote",
                table: "Bookings",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateIndex(
                name: "IX_Offers_BusinessId1",
                table: "Offers",
                column: "BusinessId1");

            migrationBuilder.CreateIndex(
                name: "IX_Bookings_OfferId",
                table: "Bookings",
                column: "OfferId");

            migrationBuilder.AddForeignKey(
                name: "FK_Bookings_OfferSlots_SlotId",
                table: "Bookings",
                column: "SlotId",
                principalTable: "OfferSlots",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Bookings_Offers_OfferId",
                table: "Bookings",
                column: "OfferId",
                principalTable: "Offers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Offers_Businesses_BusinessId",
                table: "Offers",
                column: "BusinessId",
                principalTable: "Businesses",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Offers_Businesses_BusinessId1",
                table: "Offers",
                column: "BusinessId1",
                principalTable: "Businesses",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Bookings_OfferSlots_SlotId",
                table: "Bookings");

            migrationBuilder.DropForeignKey(
                name: "FK_Bookings_Offers_OfferId",
                table: "Bookings");

            migrationBuilder.DropForeignKey(
                name: "FK_Offers_Businesses_BusinessId",
                table: "Offers");

            migrationBuilder.DropForeignKey(
                name: "FK_Offers_Businesses_BusinessId1",
                table: "Offers");

            migrationBuilder.DropIndex(
                name: "IX_Offers_BusinessId1",
                table: "Offers");

            migrationBuilder.DropIndex(
                name: "IX_Bookings_OfferId",
                table: "Bookings");

            migrationBuilder.DropColumn(
                name: "BusinessId1",
                table: "Offers");

            migrationBuilder.DropColumn(
                name: "CustomerEmail",
                table: "Bookings");

            migrationBuilder.DropColumn(
                name: "CustomerName",
                table: "Bookings");

            migrationBuilder.DropColumn(
                name: "CustomerPhone",
                table: "Bookings");

            migrationBuilder.DropColumn(
                name: "OfferId",
                table: "Bookings");

            migrationBuilder.DropColumn(
                name: "PeopleCount",
                table: "Bookings");

            migrationBuilder.DropColumn(
                name: "SpecialNote",
                table: "Bookings");

            migrationBuilder.AddForeignKey(
                name: "FK_Bookings_OfferSlots_SlotId",
                table: "Bookings",
                column: "SlotId",
                principalTable: "OfferSlots",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Offers_Businesses_BusinessId",
                table: "Offers",
                column: "BusinessId",
                principalTable: "Businesses",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
