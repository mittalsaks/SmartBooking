using System;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartBooking.API.DTOs;
using SmartBooking.API.Services;

namespace SmartBooking.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BookingsController : ControllerBase  // ❌ Removed [Authorize] from class level
    {
        private readonly IBookingService _bookingService;

        public BookingsController(IBookingService bookingService)
        {
            _bookingService = bookingService;
        }

        // POST /api/bookings — PUBLIC (no login needed for customers)
        [HttpPost]
        [AllowAnonymous]  // ✅ Public customers can book without logging in
        public async Task<IActionResult> CreateBooking(CreateBookingDto request)
        {
            try
            {
                 var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                // ✅ null for guests, real ID for logged-in users
                int? customerId = null;
                if (!string.IsNullOrEmpty(userIdClaim) && int.TryParse(userIdClaim, out int parsedId))
                    customerId = parsedId;

                var response = await _bookingService.BookSlotAsync(customerId, request);
                return Ok(response);
            }
            catch (ArgumentException ex) { return BadRequest(new { message = ex.Message }); }
            catch (Exception ex) { return StatusCode(500, new { message = ex.Message, inner = ex.InnerException?.Message }); }
        }

        // GET /api/bookings — Admin only
        [HttpGet]
        [Authorize]  // ✅ Only admins can list all bookings
        public async Task<IActionResult> GetAllBookings()
        {
            try
            {
                var bookings = await _bookingService.GetAllBookingsAsync();
                return Ok(bookings);
            }
            catch (Exception ex) { return StatusCode(500, new { message = $"Failed: {ex.Message}" }); }
        }

        // GET /api/bookings/{id}
        [HttpGet("{id}")]
        [Authorize]
        public async Task<IActionResult> GetBookingById(int id)
        {
            try
            {
                var booking = await _bookingService.GetBookingByIdAsync(id);
                if (booking == null) return NotFound("Booking not found.");
                return Ok(booking);
            }
            catch (Exception ex) { return StatusCode(500, new { message = $"Failed: {ex.Message}" }); }
        }

        // GET /api/bookings/offer/{offerId}
        [HttpGet("offer/{offerId}")]
        [Authorize]
        public async Task<IActionResult> GetBookingsByOffer(int offerId)
        {
            try
            {
                var bookings = await _bookingService.GetBookingsByOfferAsync(offerId);
                return Ok(bookings);
            }
            catch (Exception ex) { return StatusCode(500, new { message = $"Failed: {ex.Message}" }); }
        }

        // PUT /api/bookings/{id}/status
        [HttpPut("{id}/status")]
        [Authorize]
        public async Task<IActionResult> UpdateBookingStatusPut(int id, [FromBody] UpdateBookingStatusDto request)
        {
            try
            {
                var result = await _bookingService.UpdateBookingStatusAsync(id, request.Status);
                if (result == null) return NotFound("Booking not found.");
                return Ok(result);
            }
            catch (ArgumentException ex) { return BadRequest(new { message = ex.Message }); }
            catch (Exception ex) { return StatusCode(500, new { message = $"Failed: {ex.Message}" }); }
        }

        // PATCH /api/bookings/{id}/status
        [HttpPatch("{id}/status")]
        [Authorize]
        public async Task<IActionResult> UpdateBookingStatusPatch(int id, [FromBody] UpdateBookingStatusDto request)
        {
            try
            {
                var result = await _bookingService.UpdateBookingStatusAsync(id, request.Status);
                if (result == null) return NotFound("Booking not found.");
                return Ok(result);
            }
            catch (ArgumentException ex) { return BadRequest(new { message = ex.Message }); }
            catch (Exception ex) { return StatusCode(500, new { message = $"Failed: {ex.Message}" }); }
        }
        // GET /api/bookings/my-dashboard-stats
        [HttpGet("my-dashboard-stats")]
        [Authorize]
        public async Task<IActionResult> GetMyDashboardStats()
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier) ?? User.FindFirst("sub");
                if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
                    return Unauthorized("User identity could not be resolved.");
                var stats = await _bookingService.GetDashboardStatsByUserAsync(userId);
                return Ok(stats);
            }
            catch (Exception ex) { return StatusCode(500, new { message = $"Failed: {ex.Message}" }); }
        }
        // GET /api/bookings/dashboard-stats
        [HttpGet("dashboard-stats")]
        [Authorize]
        public async Task<IActionResult> GetDashboardStats()
        {
            try
            {
               var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier) ?? User.FindFirst("sub");
                    if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
                        return Unauthorized("User identity could not be resolved.");

                    var stats = await _bookingService.GetDashboardStatsByUserAsync(userId);
                    return Ok(stats);
            }
            catch (Exception ex) { return StatusCode(500, new { message = $"Failed: {ex.Message}" }); }
        }
    }
}