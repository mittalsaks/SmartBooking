    using System;
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;
    using System.ComponentModel.DataAnnotations.Schema;

    namespace SmartBooking.API.Models
    {
        public class OfferSlot
        {
            [Key]
            public int Id { get; set; }

            public DateTime SlotDate { get; set; }
            public TimeSpan StartTime { get; set; }
            public TimeSpan EndTime { get; set; }

            public int Capacity { get; set; }
            public int BookedCount { get; set; } = 0;
            public int AvailableCount { get; set; }

            public string Status { get; set; } = "Available"; // Available, Full, Closed, Expired, Cancelled

            // Foreign Key to Offer
            public int OfferId { get; set; }
            [ForeignKey("OfferId")]
            public Offer Offer { get; set; } = null!;

            public ICollection<Booking> Bookings { get; set; } = new List<Booking>();
        }
    }