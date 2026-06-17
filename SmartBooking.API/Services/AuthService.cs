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
            if (await _context.Users.AnyAsync(u => u.Email == request.Email))
                return new AuthResponseDto { IsSuccess = false, Message = "Email already exists." };

            // 🛑 STRICT FIX: TRANSACTION START (Agar ek fail, toh sab fail)
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var user = new User
                {
                    Name = request.Name,
                    Email = request.Email,
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
                    Role = request.Role
                };

                _context.Users.Add(user);
                await _context.SaveChangesAsync();

                var business = new Business
                {
                    Name = user.Name + " Business",
                    BusinessType = "Default",
                    OwnerName = user.Name,
                    Email = user.Email,
                    Phone = "1234567890",
                    Address = "Default Address",
                    City = "Default City",
                    OpeningTime = "09:00",
                    ClosingTime = "18:00",
                    UserId = user.Id
                };

                _context.Businesses.Add(business);
                await _context.SaveChangesAsync();

                // Sab theek raha toh DB mein permanently save kar do
                await transaction.CommitAsync(); 
                return new AuthResponseDto { IsSuccess = true, Message = "User and Business registered successfully!" };
            }
            catch (Exception ex)
            {
                // Agar DB ne Business reject kiya, toh User ko bhi Rollback (Delete) kar do
                await transaction.RollbackAsync(); 
                
                // 🚨 ASLI BIMARI KO PAKAD KAR FRONTEND PAR BHEJO
                var exactError = ex.InnerException != null ? ex.InnerException.Message : ex.Message;
                return new AuthResponseDto { IsSuccess = false, Message = "Database Error: " + exactError };
            }
        }

        public async Task<AuthResponseDto> LoginAsync(LoginRequestDto request)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
            if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
                return new AuthResponseDto { IsSuccess = false, Message = "Invalid credentials." };

            var business = await _context.Businesses.FirstOrDefaultAsync(b => b.UserId == user.Id);
            
            var token = GenerateJwtToken(user, business?.Id);
            return new AuthResponseDto
            {
                IsSuccess = true,
                Token = token,
                Message = "Login successful."
            };
        }

        private string GenerateJwtToken(User user, int? businessId)
        {
            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["JwtSettings:Key"]!));
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

            var claims = new List<Claim>
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.Name),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Role, user.Role.ToString())
            };

            if (businessId.HasValue)
            {
                claims.Add(new Claim("businessId", businessId.Value.ToString()));
            }

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