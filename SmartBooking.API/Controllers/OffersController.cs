using System;
using System.IO;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SmartBooking.API.DTOs;
using SmartBooking.API.Services;
using System.Security.Claims;
using System.IdentityModel.Tokens.Jwt;
namespace SmartBooking.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class OffersController : ControllerBase
    {
        private readonly IOfferService _offerService;

        public OffersController(IOfferService offerService)
        {
            _offerService = offerService;
        }

        // GET: api/offers
        // This now returns the enriched data (Business details + Available Slots)
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var offers = await _offerService.GetAllOffersAsync();
            return Ok(offers);
        }
        // GET: api/offers/my-offers
[HttpGet("my-offers")]
[Authorize]
public async Task<IActionResult> GetMyOffers()
{
    var userIdClaim = User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value
                       ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

    if (!int.TryParse(userIdClaim, out int userId))
        return Unauthorized();

    var offers = await _offerService.GetOffersByUserIdAsync(userId);
    return Ok(offers);
}
        // GET: api/offers/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var offer = await _offerService.GetOfferByIdAsync(id);
            if (offer == null) return NotFound();
            return Ok(offer);
        }

        // POST: api/offers
        [HttpPost]
        [Authorize]
        public async Task<IActionResult> Create([FromForm] CreateOfferDto request)
        {
            try
            {
                // CRITICAL BUSINESS LOGIC VALIDATIONS
                if (request.OfferPrice >= request.OriginalPrice)
                    return BadRequest("Offer price must be less than the original price.");

                if (request.EndDate < request.StartDate)
                    return BadRequest("End date must be after the start date.");

                if (request.TotalCapacity <= 0)
                    return BadRequest("Total capacity must be greater than zero.");

                if (request.ImageFile != null && request.ImageFile.Length > 0)
                {
                    request.ImageUrl = await SaveOfferImageAsync(request.ImageFile);
                }

                var response = await _offerService.CreateOfferAsync(request);
                return CreatedAtAction(nameof(GetById), new { id = response.Id }, response);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        // PUT: api/offers/{id}
        [HttpPut("{id}")]
        [Authorize]
        public async Task<IActionResult> Update(int id, [FromForm] UpdateOfferDto request)
        {
            try
            {
                if (request.OfferPrice >= request.OriginalPrice)
                    return BadRequest("Offer price must be less than the original price.");

                if (request.ImageFile != null && request.ImageFile.Length > 0)
                {
                    request.ImageUrl = await SaveOfferImageAsync(request.ImageFile);
                }

                var success = await _offerService.UpdateOfferAsync(id, request);
                if (!success) return NotFound();
                return NoContent();
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        private async Task<string> SaveOfferImageAsync(IFormFile imageFile)
        {
            var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "offers");
            if (!Directory.Exists(uploadsFolder))
            {
                Directory.CreateDirectory(uploadsFolder);
            }

            var fileName = Guid.NewGuid().ToString() + Path.GetExtension(imageFile.FileName);
            var filePath = Path.Combine(uploadsFolder, fileName);

            await using var stream = new FileStream(filePath, FileMode.Create);
            await imageFile.CopyToAsync(stream);

            return $"/uploads/offers/{fileName}";
        }

        // DELETE: api/offers/{id}
        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> Delete(int id)
        {
            var success = await _offerService.DeleteOfferAsync(id);
            if (!success) return NotFound();
            return NoContent();
        }
    }
}