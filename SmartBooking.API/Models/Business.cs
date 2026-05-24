using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SmartBooking.API.Models
{
    public class Business
    {
        [Key]
        public int Id { get; set; }

        // Updated to match the React frontend
        [Required, MaxLength(150)]
        public string Name { get; set; } = string.Empty;

        public string BusinessType { get; set; }=string.Empty;
        public string OwnerName { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public string City { get; set; } = string.Empty;
        public string OpeningTime { get; set; } = "09:00";
        public string ClosingTime { get; set; } = "18:00";
        public string? LogoUrl { get; set; } // Added field
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Foreign Key to User
        public int UserId { get; set; }
        [ForeignKey("UserId")]
        public User? Owner { get; set; }

        public ICollection<Offer> Offers { get; set; } = new List<Offer>();
    }
}