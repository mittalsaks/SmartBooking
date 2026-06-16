using Microsoft.AspNetCore.Mvc;
using SmartBooking.API.DTOs;
using SmartBooking.API.Services;
using System.Threading.Tasks;

namespace SmartBooking.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequestDto request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var response = await _authService.RegisterAsync(request);
            
            // Evaluates the boolean flag instead of a hardcoded string
            if (!response.IsSuccess) 
            {
                // Wraps the error in an anonymous object for clean JSON output
                return BadRequest(new { message = response.Message }); 
            }
            
            return Ok(response);
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequestDto request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var response = await _authService.LoginAsync(request);
            
            // Checks for overall success
            if (!response.IsSuccess) 
            {
                return Unauthorized(new { message = response.Message ?? "Invalid credentials" });
            }
            
            return Ok(response);
        }

        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordDto request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            await _authService.ForgotPasswordAsync(request.Email);
            return Ok(new { message = "If this email exists, a reset link has been sent." });
        }
    }
}