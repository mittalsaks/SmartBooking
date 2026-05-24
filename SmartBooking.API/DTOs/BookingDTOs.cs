using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace SmartBooking.API.DTOs
{
    public class CreateBookingDto
    {
        [Required]
        public int SlotId { get; set; }

        public int OfferId { get; set; }  // ✅ Removed [Required] - service can look it up from slot

        [Required, MaxLength(100)]
        public string CustomerName { get; set; } = string.Empty;

        [MaxLength(20)]
        public string CustomerPhone { get; set; } = string.Empty;  // ✅ Optional now

        [EmailAddress]
        public string? CustomerEmail { get; set; }  // ✅ Removed [Required] - optional for customers

        [Range(1, 20)]
        public int PeopleCount { get; set; } = 1;

        public string SpecialNote { get; set; } = string.Empty;
    }

    public class UpdateBookingStatusDto
    {
        [Required]
        public string Status { get; set; } = string.Empty;
    }

    public class BookingResponseDto
    {
        public int Id { get; set; }
        public string BookingReference { get; set; } = string.Empty;
        public string ReferenceNumber => BookingReference; // ✅ Frontend reads referenceNumber
        public int SlotId { get; set; }
        public int OfferId { get; set; }
        public int CustomerId { get; set; }
        public string CustomerName { get; set; } = string.Empty;
        public string CustomerEmail { get; set; } = string.Empty;
        public string CustomerPhone { get; set; } = string.Empty;
        public int PeopleCount { get; set; }
        public string SpecialNote { get; set; } = string.Empty;
        public string OfferTitle { get; set; } = string.Empty;
        public string BusinessName { get; set; } = string.Empty;
        public decimal OfferPrice { get; set; }
        public DateTime SlotDate { get; set; }
        public TimeSpan SlotStartTime { get; set; }
        public TimeSpan SlotEndTime { get; set; }
        public string Status { get; set; } = string.Empty;
        public DateTime BookedAt { get; set; }
    }

    public class DashboardStatsDto
    {
        public int TotalOffers { get; set; }
        public int ActiveOffers { get; set; }
        public int TotalBookings { get; set; }
        public int TodaysBookings { get; set; }
        public int TotalCapacity { get; set; }
        public int BookedSeats { get; set; }
        public int AvailableSeats { get; set; }
        public double ConversionRate { get; set; }
        public IEnumerable<RecentBookingDto> RecentBookings { get; set; }
            = new List<RecentBookingDto>();
    }

    public class RecentBookingDto
    {
        public int Id { get; set; }
        public string BookingReference { get; set; } = string.Empty;
        public string CustomerName { get; set; } = string.Empty;
        public string CustomerEmail { get; set; } = string.Empty;
        public string OfferTitle { get; set; } = string.Empty;
        public string SlotTime { get; set; } = string.Empty;
        public int PeopleCount { get; set; }
        public string Status { get; set; } = string.Empty;
        public DateTime BookedAt { get; set; }
    }
}