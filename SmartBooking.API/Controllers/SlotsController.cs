using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartBooking.API.DTOs;
using SmartBooking.API.Services;

namespace SmartBooking.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class SlotsController : ControllerBase
    {
        private readonly ISlotService _slotService;

        public SlotsController(ISlotService slotService)
        {
            _slotService = slotService;
        }

        // GET /api/slots/offer/{offerId}
        [HttpGet("offer/{offerId}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetSlotsForOffer(int offerId)
        {
            var slots = await _slotService.GetSlotsForOfferAsync(offerId);
            return Ok(slots);
        }

        // POST /api/slots
        [HttpPost]
        public async Task<IActionResult> Create(CreateSlotDto request)
        {
            try
            {
                var response = await _slotService.CreateSlotAsync(request);
                return Ok(response);
            }
            catch (ArgumentException ex) { return BadRequest(ex.Message); }
            catch (Exception ex) { return StatusCode(500, $"Failed: {ex.Message}"); }
        }

        // ✅ PUT /api/slots/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateSlot(int id, [FromBody] UpdateSlotDto request)
        {
            try
            {
                var result = await _slotService.UpdateSlotAsync(id, request);
                if (result == null) return NotFound("Slot not found.");
                return Ok(result);
            }
            catch (ArgumentException ex) { return BadRequest(ex.Message); }
            catch (Exception ex) { return StatusCode(500, $"Failed: {ex.Message}"); }
        }

        // ✅ DELETE /api/slots/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteSlot(int id)
        {
            try
            {
                var deleted = await _slotService.DeleteSlotAsync(id);
                if (!deleted) return NotFound("Slot not found.");
                return Ok(new { message = "Slot deleted successfully." });
            }
            catch (Exception ex) { return StatusCode(500, $"Failed: {ex.Message}"); }
        }
        // Add this endpoint — was completely missing, causing 405:
            [HttpGet("{id}")]
            [AllowAnonymous]  // ✅ Public customers need to see slot details
            public async Task<IActionResult> GetSlotById(int id)
            {
                try
                {
                    var slot = await _slotService.GetSlotByIdAsync(id);
                    if (slot == null) return NotFound("Slot not found.");
                    return Ok(slot);
                }
                catch (Exception ex) { return StatusCode(500, $"Failed: {ex.Message}"); }
        }
    }
}