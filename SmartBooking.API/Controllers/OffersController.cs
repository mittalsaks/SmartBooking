using System;
using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using System.IdentityModel.Tokens.Jwt;
using System.IO;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SmartBooking.API.Data;
using SmartBooking.API.DTOs;
using SmartBooking.API.Services;

namespace SmartBooking.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class OffersController : ControllerBase
    {
        private readonly IOfferService _offerService;
        private readonly AppDbContext _context;
        private readonly IConfiguration _configuration;
        public OffersController(IOfferService offerService, AppDbContext context,IConfiguration configuration)
        {
            _offerService = offerService;
            _context = context;
            _configuration = configuration;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var offers = await _offerService.GetAllOffersAsync();
            return Ok(offers);
        }
        [HttpGet("my-offers")]
[Authorize]
public async Task<IActionResult> GetMyOffers()
{
    var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)
                   ?? User.FindFirst(JwtRegisteredClaimNames.Sub)
                   ?? User.FindFirst("sub");

    if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
        return Unauthorized("User identity could not be resolved from token.");

    var business = await _context.Businesses
        .AsNoTracking()
        .FirstOrDefaultAsync(b => b.UserId == userId);

    if (business == null)
        return BadRequest("No business profile found.");

    var offers = await _context.Offers
        .Where(o => o.BusinessId == business.Id)
        .ToListAsync();

    return Ok(offers);
}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var offer = await _offerService.GetOfferByIdAsync(id);
            if (offer == null) return NotFound();
            return Ok(offer);
        }

        [HttpPost]
        [Authorize]
        public async Task<IActionResult> Create([FromForm] CreateOfferDto request)
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)
                               ?? User.FindFirst(JwtRegisteredClaimNames.Sub)
                               ?? User.FindFirst("sub");

                if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
                    return Unauthorized("User identity could not be resolved from token.");

                var businessIdClaim = User.FindFirst("businessId");
                int businessId;

                if (businessIdClaim != null && int.TryParse(businessIdClaim.Value, out int claimedBusinessId))
                {
                    businessId = claimedBusinessId;
                }
                else
                {
                    var business = await _context.Businesses
                        .AsNoTracking()
                        .FirstOrDefaultAsync(b => b.UserId == userId);

                    if (business == null)
                        return BadRequest("No business profile found. Please logout and login again.");

                    businessId = business.Id;
                }

                request.BusinessId = businessId;

                if (request.OfferPrice >= request.OriginalPrice)
                    return BadRequest("Offer price must be less than the original price.");

                if (request.EndDate < request.StartDate)
                    return BadRequest("End date must be after the start date.");

                if (request.TotalCapacity <= 0)
                    return BadRequest("Total capacity must be greater than zero.");

                if (request.ImageFile != null && request.ImageFile.Length > 0)
                    request.ImageUrl = await SaveOfferImageAsync(request.ImageFile);

                var response = await _offerService.CreateOfferAsync(request);
                return CreatedAtAction(nameof(GetById), new { id = response.Id }, response);
            }
            catch (ArgumentException ex) { return BadRequest(ex.Message); }
            catch (Exception ex) { return StatusCode(500, "An unexpected error occurred: " + ex.Message); }
        }

        [HttpPut("{id}")]
        [Authorize]
        public async Task<IActionResult> Update(int id, [FromForm] UpdateOfferDto request)
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
                if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
                    return Unauthorized("User identity could not be resolved from token.");

                var business = await _context.Businesses.AsNoTracking().FirstOrDefaultAsync(b => b.UserId == userId);
                if (business == null) return BadRequest("No business profile found for this user.");

                var existingOffer = await _context.Offers.AsNoTracking().FirstOrDefaultAsync(o => o.Id == id);
                if (existingOffer == null) return NotFound("Offer not found.");
                if (existingOffer.BusinessId != business.Id) return Forbid();

                if (request.OfferPrice >= request.OriginalPrice)
                    return BadRequest("Offer price must be less than the original price.");

                if (request.ImageFile != null && request.ImageFile.Length > 0)
                    request.ImageUrl = await SaveOfferImageAsync(request.ImageFile);

                var success = await _offerService.UpdateOfferAsync(id, request);
                if (!success) return NotFound();
                return NoContent();
            }
            catch (ArgumentException ex) { return BadRequest(ex.Message); }
        }

        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> Delete(int id)
        {
            var success = await _offerService.DeleteOfferAsync(id);
            if (!success) return NotFound();
            return NoContent();
        }

        private async Task<string> SaveOfferImageAsync(IFormFile imageFile)
        {
            // Ab yeh securely appsettings ya Render se aayega
            var account = new Account(
                _configuration["CloudinarySettings:CloudName"],
                _configuration["CloudinarySettings:ApiKey"],
                _configuration["CloudinarySettings:ApiSecret"]
            );

            var cloudinary = new Cloudinary(account);
            cloudinary.Api.Secure = true;

            using var stream = imageFile.OpenReadStream();
            var uploadParams = new ImageUploadParams()
            {
                File = new FileDescription(imageFile.FileName, stream),
                Folder = "SmartBooking_Offers"
            };

            var uploadResult = await cloudinary.UploadAsync(uploadParams);

            if (uploadResult.Error != null)
            {
                throw new Exception("Image upload failed: " + uploadResult.Error.Message);
            }

            return uploadResult.SecureUrl.ToString();
        }
    }
}
