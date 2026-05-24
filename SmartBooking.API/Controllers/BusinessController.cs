using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SmartBooking.API.Data;
using SmartBooking.API.Models;

namespace SmartBooking.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BusinessController : ControllerBase
    {
        private readonly AppDbContext _context;

        public BusinessController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/Business
        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetAll()
        {
            var businesses = await _context.Businesses
                .Select(b => new {
                    b.Id,
                    b.Name,
                    b.BusinessType,
                    b.OwnerName,        // ✅ ADDED
                    b.Address,
                    b.City,
                    b.Phone,
                    b.Email,
                    b.OpeningTime,      // ✅ ADDED
                    b.ClosingTime,      // ✅ ADDED
                    b.LogoUrl
                })
                .ToListAsync();
            return Ok(businesses);
        }

        // POST: api/Business
        [HttpPost]
        [Authorize]
        public async Task<IActionResult> Create([FromBody] CreateBusinessRequest request)
        {
            try
            {
                var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
                    return Unauthorized("Invalid user token.");

                var business = new Business
                {
                    Name = request.Name,
                    BusinessType = request.BusinessType,
                    OwnerName = request.OwnerName ?? string.Empty,      // ✅ ADDED
                    Address = request.Address ?? string.Empty,
                    City = request.City ?? string.Empty,
                    Phone = request.Phone ?? string.Empty,
                    Email = request.Email ?? string.Empty,
                    OpeningTime = request.OpeningTime ?? "09:00",        // ✅ ADDED
                    ClosingTime = request.ClosingTime ?? "18:00",        // ✅ ADDED
                    LogoUrl = request.LogoUrl,
                    UserId = userId
                };

                _context.Businesses.Add(business);
                await _context.SaveChangesAsync();
                return Ok(business);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Failed to create business: {ex.Message}");
            }
        }

        // PUT: api/Business/{id}
        [HttpPut("{id}")]
        [Authorize]
        public async Task<IActionResult> Update(int id, [FromBody] CreateBusinessRequest request)
        {
            try
            {
                var business = await _context.Businesses.FindAsync(id);
                if (business == null) return NotFound("Business not found.");

                business.Name = request.Name;
                business.BusinessType = request.BusinessType;
                business.OwnerName = request.OwnerName ?? string.Empty;      // ✅ ADDED
                business.Address = request.Address ?? string.Empty;
                business.City = request.City ?? string.Empty;
                business.Phone = request.Phone ?? string.Empty;
                business.Email = request.Email ?? string.Empty;
                business.OpeningTime = request.OpeningTime ?? "09:00";        // ✅ ADDED
                business.ClosingTime = request.ClosingTime ?? "18:00";        // ✅ ADDED
                business.LogoUrl = request.LogoUrl;

                await _context.SaveChangesAsync();
                return Ok(business);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Failed to update business: {ex.Message}");
            }
        }
    }

    public class CreateBusinessRequest
    {
        public string Name { get; set; } = string.Empty;
        public string BusinessType { get; set; } = string.Empty;
        public string? OwnerName { get; set; }       // ✅ ADDED
        public string? Address { get; set; }
        public string? City { get; set; }
        public string? Phone { get; set; }
        public string? Email { get; set; }
        public string? OpeningTime { get; set; }     // ✅ ADDED
        public string? ClosingTime { get; set; }     // ✅ ADDED
        public string? LogoUrl { get; set; }
    }
}