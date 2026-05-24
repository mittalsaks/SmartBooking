using System;

namespace SmartBooking.API.DTOs
{
    public class OfferResponseDto
    {
        public int Id { get; set; }
        public int BusinessId { get; set; }
        public string BusinessName { get; set; } = string.Empty;
        public string BusinessType { get; set; } = string.Empty;
        public string BusinessAddress { get; set; } = string.Empty;
        public string BusinessCity { get; set; } = string.Empty;
        public string? BusinessLogoUrl { get; set; }
        
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Category { get; set; } = "Other";
        
        public decimal OriginalPrice { get; set; }
        public decimal OfferPrice { get; set; }
        public decimal DiscountPercentage { get; set; }
        
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public TimeSpan StartTime { get; set; }
        public TimeSpan EndTime { get; set; }
        
        public int TotalCapacity { get; set; }
        public int MaxBookingPerCustomer { get; set; }
        
        public int AvailableSlotsCount { get; set; }
        public bool CanBook { get; set; }
        public string? ImageUrl { get; set; }
        
        public string TermsAndConditions { get; set; } = string.Empty;
        public string Status { get; set; } = "Draft";
        public DateTime CreatedAt { get; set; }
    }
}