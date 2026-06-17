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
                await _context.SaveChangesAsync(); // user.Id populated here

                // ✅ All defaults hardcoded — RegisterRequestDto has no business fields
                var business = new Business
                {
                    Name = user.Name + "'s Business",
                    BusinessType = "General",
                    OwnerName = user.Name,
                    Email = user.Email,
                    Phone = "0000000000",
                    Address = "Not provided",
                    City = "Not provided",
                    OpeningTime = "09:00",
                    ClosingTime = "18:00",
                    UserId = user.Id  // ✅ FK set AFTER SaveChanges gives us user.Id
                };

                _context.Businesses.Add(business);
                await _context.SaveChangesAsync(); // business.Id populated here

                await transaction.CommitAsync();

                // ✅ Return token on register so frontend has businessId immediately
                var token = GenerateJwtToken(user, business.Id);

                return new AuthResponseDto
                {
                    IsSuccess = true,
                    Token = token,
                    Role = user.Role,
                    Message = "Registration successful."
                };
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                var exactError = ex.InnerException?.Message ?? ex.Message;
                return new AuthResponseDto
                {
                    IsSuccess = false,
                    Message = "Registration failed: " + exactError
                };
            }
        }

        public async Task<AuthResponseDto> LoginAsync(LoginRequestDto request)
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Email == request.Email);

            if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
                return new AuthResponseDto { IsSuccess = false, Message = "Invalid credentials." };

            var business = await _context.Businesses
                .AsNoTracking()
                .FirstOrDefaultAsync(b => b.UserId == user.Id);

            var token = GenerateJwtToken(user, business?.Id);

            return new AuthResponseDto
            {
                IsSuccess = true,
                Token = token,
                Role = user.Role,
                Message = "Login successful."
            };
        }

        private string GenerateJwtToken(User user, int? businessId)
        {
            var key = _config["JwtSettings:Key"]
                ?? throw new InvalidOperationException("JWT Key is not configured.");

            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key));
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

            var claims = new List<Claim>
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()), // ✅ explicit for controller
                new Claim(ClaimTypes.Name, user.Name),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Role, user.Role.ToString()),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };

            if (businessId.HasValue)
                claims.Add(new Claim("businessId", businessId.Value.ToString()));

            var token = new JwtSecurityToken(
                issuer: _config["JwtSettings:Issuer"],
                audience: _config["JwtSettings:Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddHours(2),
                signingCredentials: credentials);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}