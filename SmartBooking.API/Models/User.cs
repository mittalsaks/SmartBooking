// Models/User.cs
using System.ComponentModel.DataAnnotations;
using SmartBooking.API.Models.Enums;

namespace SmartBooking.API.Models
{
    public class User
    {
        [Key]
        public int Id { get; set; }

        [Required, MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        [Required, EmailAddress, MaxLength(150)]
        public string Email { get; set; } = string.Empty;

        [Required]
        public string PasswordHash { get; set; } = string.Empty;

        public string? Phone { get; set; }

        public UserRole Role { get; set; } = UserRole.Customer;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Relationships: One User can have many Businesses and Bookings
        public ICollection<Business> Businesses { get; set; } = new List<Business>();
        public ICollection<Booking> Bookings { get; set; } = new List<Booking>();
    }
}