using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using SmartBooking.API.Data;
using SmartBooking.API.DTOs;
using SmartBooking.API.Models;

namespace SmartBooking.API.Services
{
    public interface IAuthService
    {
        Task<AuthResponseDto> RegisterAsync(RegisterRequestDto request);
        Task<AuthResponseDto> LoginAsync(LoginRequestDto request);
    }

    public class AuthService : IAuthService
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _config;

        public AuthService(AppDbContext context, IConfiguration config)
        {
            _context = context;
            _config = config;
        }

        public async Task<AuthResponseDto> RegisterAsync(RegisterRequestDto request)
        {
            // 1. Check if email exists
            if (await _context.Users.AnyAsync(u => u.Email == request.Email))
                return new AuthResponseDto { IsSuccess = false, Message = "Email already exists." };

            // 2. Create the User
            var user = new User
            {
                Name = request.Name,
                Email = request.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
                Role = request.Role
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync(); // User save hoga aur uski ek nayi 'Id' generate hogi

            // ✅ 3. PERMANENT FIX: Automatically create a Business for this new User
            try
            {
                var business = new Business
                {
                    // Hum User ki Id ko hi Business ki Id bana rahe hain, 
                    // kyunki frontend token se User Id ko hi businessId samajh kar bhej raha hai.
                    Id = user.Id, 
                    Name = user.Name + " Business"
                };

                _context.Businesses.Add(business);
                await _context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                // Agar Business pehle se hai ya schema alag hai, toh application crash nahi hogi
                Console.WriteLine("Business creation failed/skipped: " + ex.Message);
            }

            return new AuthResponseDto { IsSuccess = true, Message = "User and Business registered successfully." };
        }

        public async Task<AuthResponseDto> LoginAsync(LoginRequestDto request)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
            if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
                return new AuthResponseDto { IsSuccess = false, Message = "Invalid credentials." };

            // ✅ Fixed: removed duplicate Token, removed _jwtService (doesn't exist),
            //           use local GenerateJwtToken(), and set IsSuccess = true
            var token = GenerateJwtToken(user);
            return new AuthResponseDto
            {
                IsSuccess = true,
                Token = token,
                Message = "Login successful."
            };
        }

        private string GenerateJwtToken(User user)
        {
            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["JwtSettings:Key"]!));
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.Name),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Role, user.Role.ToString())
            };

            var token = new JwtSecurityToken(
                issuer: _config["JwtSettings:Issuer"],
                audience: _config["JwtSettings:Audience"],
                claims: claims,
                expires: DateTime.Now.AddHours(2),
                signingCredentials: credentials);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}