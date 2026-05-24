// DTOs/AuthDTOs.cs
using System.ComponentModel.DataAnnotations;
using SmartBooking.API.Models.Enums;

namespace SmartBooking.API.DTOs
{
    public class RegisterRequestDto
    {
        [Required] 
        public string Name { get; set; } = string.Empty;
        
        [Required]
        [EmailAddress] 
        public string Email { get; set; } = string.Empty;
        
        [Required]
        [MinLength(6, ErrorMessage = "Password must be at least 6 characters long.")] 
        public string Password { get; set; } = string.Empty;
        
        public UserRole Role { get; set; } = UserRole.Customer;
    }

    public class LoginRequestDto
    {
        [Required]
        [EmailAddress] 
        public string Email { get; set; } = string.Empty;
        
        [Required] 
        public string Password { get; set; } = string.Empty;
    }

    public class AuthResponseDto
    {
        // Added to support the Result Pattern in your AuthController
        public bool IsSuccess { get; set; }
        
        public string Message { get; set; } = string.Empty;
        
        // Nullable because a failed request won't generate a token
        public string? Token { get; set; } 
        
        public UserRole Role { get; set; }
    }
}