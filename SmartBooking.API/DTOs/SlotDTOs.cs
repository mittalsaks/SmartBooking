using System;
using System.ComponentModel.DataAnnotations;

namespace SmartBooking.API.DTOs
{
    public class CreateSlotDto
    {
        [Required]
        public int OfferId { get; set; }
        [Required]
        public DateTime SlotDate { get; set; }
        [Required]
        public TimeSpan StartTime { get; set; }
        [Required]
        public TimeSpan EndTime { get; set; }
        [Required, Range(1, 1000)]
        public int Capacity { get; set; }
    }

    // ✅ New
    public class UpdateSlotDto
    {
        [Required]
        public DateTime SlotDate { get; set; }
        [Required]
        public TimeSpan StartTime { get; set; }
        [Required]
        public TimeSpan EndTime { get; set; }
        [Required, Range(1, 1000)]
        public int Capacity { get; set; }
    }

    public class SlotResponseDto
    {
        public int Id { get; set; }
        public int OfferId { get; set; }
        public DateTime SlotDate { get; set; }
        public TimeSpan StartTime { get; set; }
        public TimeSpan EndTime { get; set; }
        public int Capacity { get; set; }
        public int BookedCount { get; set; }
        public int AvailableCount { get; set; }
        public string Status { get; set; } = string.Empty;
    }
}