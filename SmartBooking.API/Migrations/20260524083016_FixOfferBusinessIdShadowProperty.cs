using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SmartBooking.API.Migrations
{
    /// <inheritdoc />
    public partial class FixOfferBusinessIdShadowProperty : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Offers_Businesses_BusinessId",
                table: "Offers");

            migrationBuilder.DropForeignKey(
                name: "FK_Offers_Businesses_BusinessId1",
                table: "Offers");

            migrationBuilder.DropIndex(
                name: "IX_Offers_BusinessId1",
                table: "Offers");

            migrationBuilder.DropColumn(
                name: "BusinessId1",
                table: "Offers");

            migrationBuilder.AddForeignKey(
                name: "FK_Offers_Businesses_BusinessId",
                table: "Offers",
                column: "BusinessId",
                principalTable: "Businesses",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Offers_Businesses_BusinessId",
                table: "Offers");

            migrationBuilder.AddColumn<int>(
                name: "BusinessId1",
                table: "Offers",
                type: "integer",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Offers_BusinessId1",
                table: "Offers",
                column: "BusinessId1");

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
    }
}
