using System;
using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;

namespace SmartBooking.API.DTOs
{
    public class CreateOfferDto
    {
        [Required] public string Title { get; set; } = string.Empty;
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
        public int MaxBookingPerCustomer { get; set; } = 1;
        public string TermsAndConditions { get; set; } = string.Empty;
        public string Status { get; set; } = "Draft";
        public int BusinessId { get; set; }
        public IFormFile? ImageFile { get; set; }
        public string? ImageUrl { get; set; }
    }

    public class UpdateOfferDto
    {
        [Required] public string Title { get; set; } = string.Empty;
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
        public int MaxBookingPerCustomer { get; set; } = 1;
        public string TermsAndConditions { get; set; } = string.Empty;
        public string Status { get; set; } = "Draft";
        public IFormFile? ImageFile { get; set; }
        public string? ImageUrl { get; set; }
    }
}