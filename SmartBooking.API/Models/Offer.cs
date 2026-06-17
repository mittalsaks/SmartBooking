using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SmartBooking.API.Models
{
    public class Offer
    {
        [Key]
        public int Id { get; set; }

        [Required, MaxLength(200)]
        public string Title { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;

        public string Category { get; set; } = "Other";

        [Column(TypeName = "decimal(18,2)")]
        public decimal OriginalPrice { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal OfferPrice { get; set; }

        [Column(TypeName = "decimal(5,2)")]
        // Purani line hata kar ye daalo:
        private decimal _discountPercentage;

        [Column(TypeName = "decimal(5,2)")]
        public decimal DiscountPercentage
        {
            get => _discountPercentage;
            // Agar value minus (-) mein aayi, toh usko 0 kar dega, warna normal save karega
            set => _discountPercentage = value < 0 ? 0 : value; 
        }

        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public TimeSpan StartTime { get; set; }
        public TimeSpan EndTime { get; set; }
        
        public int TotalCapacity { get; set; }
        public int MaxBookingPerCustomer { get; set; } = 1;
        
        public string TermsAndConditions { get; set; } = string.Empty;

        // Using string for Status to easily map to frontend values: Draft, Active, Paused, Expired, Cancelled
        public string Status { get; set; } = "Draft";

        public string? ImageUrl { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public int BusinessId { get; set; }
        [ForeignKey("BusinessId")]
        public Business Business { get; set; } = null!;

        public ICollection<OfferSlot> Slots { get; set; } = new List<OfferSlot>();
    }
}