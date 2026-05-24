using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using SmartBooking.API.Models.Enums;

namespace SmartBooking.API.Models
{
    public class Booking
    {
        [Key]
        public int Id { get; set; }

        [Required, MaxLength(50)]
        public string BookingReference { get; set; }
            = Guid.NewGuid().ToString("N").Substring(0, 8).ToUpper();

        public BookingStatus Status { get; set; } = BookingStatus.Pending;

        public DateTime BookedAt { get; set; } = DateTime.UtcNow;

        [MaxLength(100)]
        public string CustomerName { get; set; } = string.Empty;

        [MaxLength(20)]
        public string CustomerPhone { get; set; } = string.Empty;

        [MaxLength(200)]
        public string CustomerEmail { get; set; } = string.Empty;

        public int PeopleCount { get; set; } = 1;

        public string SpecialNote { get; set; } = string.Empty;

        // FK to Offer
        public int OfferId { get; set; }
        [ForeignKey("OfferId")]
        public Offer Offer { get; set; } = null!;

        // ✅ FIXED: Nullable so guest bookings (no login) don't crash the DB
        public int? CustomerId { get; set; }
        [ForeignKey("CustomerId")]
        public User? Customer { get; set; }  // ✅ Also nullable

        // FK to OfferSlot
        public int SlotId { get; set; }
        [ForeignKey("SlotId")]
        public OfferSlot Slot { get; set; } = null!;
    }
}