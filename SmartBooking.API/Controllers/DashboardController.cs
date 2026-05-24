using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartBooking.API.Services;

namespace SmartBooking.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class DashboardController : ControllerBase
    {
        private readonly IBookingService _bookingService;

        public DashboardController(IBookingService bookingService)
        {
            _bookingService = bookingService;
        }

        // ✅ GET /api/dashboard/summary
        [HttpGet("summary")]
        public async Task<IActionResult> GetSummary()
        {
            try
            {
                var stats = await _bookingService.GetDashboardStatsAsync();
                return Ok(stats);
            }
            catch (Exception ex) { return StatusCode(500, $"Failed: {ex.Message}"); }
        }
    }
}