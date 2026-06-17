using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using SmartBooking.API.Data;
using SmartBooking.API.DTOs;
using SmartBooking.API.Interfaces;
using SmartBooking.API.Models;
using SmartBooking.API.Models.Enums;

namespace SmartBooking.API.Services
{
    public interface IBookingService
    {
        Task<BookingResponseDto> BookSlotAsync(int? customerId, CreateBookingDto request); // ✅ nullable
        Task<IEnumerable<BookingResponseDto>> GetAllBookingsAsync();
        Task<BookingResponseDto?> GetBookingByIdAsync(int id);
        Task<IEnumerable<BookingResponseDto>> GetBookingsByOfferAsync(int offerId);
        Task<BookingResponseDto?> UpdateBookingStatusAsync(int bookingId, string status);
        Task<DashboardStatsDto> GetDashboardStatsAsync();
        Task<DashboardStatsDto> GetDashboardStatsByUserAsync(int userId);
    }

    public class BookingService : IBookingService
    {
        private readonly AppDbContext _context;
        private readonly IBookingRepository _bookingRepository;
        private readonly IEmailService _emailService;

        public BookingService(AppDbContext context, IBookingRepository bookingRepository,IEmailService emailService)
        {
            _context = context;
            _bookingRepository = bookingRepository;
            _emailService = emailService; 
        }

        public async Task<BookingResponseDto> BookSlotAsync(int? customerId, CreateBookingDto request)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var slot = await _context.OfferSlots
                    .Include(s => s.Offer)
                        .ThenInclude(o => o.Business)
                    .FirstOrDefaultAsync(s => s.Id == request.SlotId);

                if (slot == null)
                    throw new ArgumentException("Slot not found.");
                if (slot.Offer.Status != "Active")
                    throw new ArgumentException("This offer is no longer active.");
                if (slot.Status != "Available" || slot.AvailableCount <= 0)
                    throw new ArgumentException("This slot is fully booked.");
                if (slot.AvailableCount < request.PeopleCount)
                    throw new ArgumentException($"Only {slot.AvailableCount} seats available.");

                // ✅ Auto-resolve OfferId from slot if frontend didn't send it
                var offerId = request.OfferId > 0 ? request.OfferId : slot.OfferId;

                slot.AvailableCount -= request.PeopleCount;
                slot.BookedCount += request.PeopleCount;
                if (slot.AvailableCount == 0)
                    slot.Status = "Full";

                var booking = new Booking
                {
                    // ✅ null for guests, actual ID for logged-in admin
                    CustomerId    = customerId > 0 ? customerId : null,
                    SlotId        = request.SlotId,
                    OfferId       = offerId,
                    CustomerName  = request.CustomerName,
                    CustomerPhone = request.CustomerPhone ?? "",
                    CustomerEmail = request.CustomerEmail ?? "",
                    PeopleCount   = request.PeopleCount,
                    SpecialNote   = request.SpecialNote ?? "",
                    Status        = BookingStatus.Confirmed
                };

                await _bookingRepository.AddAsync(booking);
                await transaction.CommitAsync();
                if (!string.IsNullOrWhiteSpace(booking.CustomerEmail))
{
    try
    {
        await _emailService.SendBookingConfirmationAsync(
            toEmail: booking.CustomerEmail,
            customerName: booking.CustomerName,
            bookingReference: booking.BookingReference,
            offerTitle: slot.Offer?.Title ?? "Your Offer",
            businessName: slot.Offer?.Business?.Name ?? "Business",
            slotDate: slot.SlotDate.ToString("ddd, dd MMM yyyy"),
            slotTime: $"{slot.StartTime:hh\\:mm} – {slot.EndTime:hh\\:mm}"
        );
    }
    catch (Exception emailEx)
    {
        // Email fail hone se booking cancel nahi hogi
        Console.WriteLine($"[Email] Failed to send: {emailEx.Message}");
    }
}

                return new BookingResponseDto
                {
                    Id               = booking.Id,
                    BookingReference = booking.BookingReference,
                    SlotId           = booking.SlotId,
                    OfferId          = booking.OfferId,
                    CustomerId       = booking.CustomerId ?? 0,
                    CustomerName     = booking.CustomerName,
                    CustomerEmail    = booking.CustomerEmail,
                    CustomerPhone    = booking.CustomerPhone,
                    PeopleCount      = booking.PeopleCount,
                    SpecialNote      = booking.SpecialNote,
                    OfferTitle       = slot.Offer?.Title ?? "",
                    BusinessName     = slot.Offer?.Business?.Name ?? "",
                    OfferPrice       = slot.Offer?.OfferPrice ?? 0,
                    SlotDate         = slot.SlotDate,
                    SlotStartTime    = slot.StartTime,
                    SlotEndTime      = slot.EndTime,
                    Status           = booking.Status.ToString(),
                    BookedAt         = booking.BookedAt
                };
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        public async Task<IEnumerable<BookingResponseDto>> GetAllBookingsAsync()
        {
            var bookings = await _bookingRepository.GetAllAsync();
            return bookings.Select(MapToDto);
        }

        public async Task<BookingResponseDto?> GetBookingByIdAsync(int id)
        {
            var booking = await _bookingRepository.GetByIdAsync(id);
            if (booking == null) return null;
            return MapToDto(booking);
        }

        public async Task<IEnumerable<BookingResponseDto>> GetBookingsByOfferAsync(int offerId)
        {
            var bookings = await _bookingRepository.GetByOfferIdAsync(offerId);
            return bookings.Select(MapToDto);
        }

        public async Task<BookingResponseDto?> UpdateBookingStatusAsync(int bookingId, string status)
        {
            var booking = await _bookingRepository.GetByIdAsync(bookingId);
            if (booking == null) return null;

            if (!Enum.TryParse<BookingStatus>(status, true, out var parsedStatus))
                throw new ArgumentException($"Invalid status: {status}");

            booking.Status = parsedStatus;
            await _bookingRepository.UpdateAsync(booking);
            return MapToDto(booking);
        }

        public async Task<DashboardStatsDto> GetDashboardStatsAsync()
        {
            var today = DateTime.UtcNow.Date;
            var allOffers = await _context.Offers.ToListAsync();
            var allBookings = (await _bookingRepository.GetAllAsync()).ToList();
            var allSlots = await _context.OfferSlots.ToListAsync();

            var confirmedCount = allBookings.Count(b => b.Status == BookingStatus.Confirmed);
            var conversionRate = allBookings.Count > 0
                ? Math.Round((double)confirmedCount / allBookings.Count * 100, 1)
                : 0;

            var recentBookings = allBookings
                .OrderByDescending(b => b.BookedAt)
                .Take(5)
                .Select(b => new RecentBookingDto
                {
                    Id               = b.Id,
                    BookingReference = b.BookingReference,
                    CustomerName     = b.CustomerName,
                    CustomerEmail    = b.CustomerEmail,
                    OfferTitle       = b.Slot?.Offer?.Title ?? "",
                    SlotTime         = b.Slot != null
                        ? $"{b.Slot.StartTime:hh\\:mm} - {b.Slot.EndTime:hh\\:mm}"
                        : "",
                    PeopleCount      = b.PeopleCount,
                    Status           = b.Status.ToString(),
                    BookedAt         = b.BookedAt
                })
                .ToList();

            return new DashboardStatsDto
            {
                TotalOffers    = allOffers.Count,
                ActiveOffers   = allOffers.Count(o => o.Status == "Active"),
                TotalBookings  = allBookings.Count,
                TodaysBookings = allBookings.Count(b => b.BookedAt.Date == today),
                TotalCapacity  = allSlots.Sum(s => s.Capacity),
                BookedSeats    = allSlots.Sum(s => s.BookedCount),
                AvailableSeats = allSlots.Sum(s => s.AvailableCount),
                ConversionRate = conversionRate,
                RecentBookings = recentBookings
            };
        }
        public async Task<DashboardStatsDto> GetDashboardStatsByUserAsync(int userId)
{
    var today = DateTime.UtcNow.Date;
    var business = await _context.Businesses.AsNoTracking().FirstOrDefaultAsync(b => b.UserId == userId);
    if (business == null) return new DashboardStatsDto();
    var myOffers = await _context.Offers.Where(o => o.BusinessId == business.Id).ToListAsync();
    var myOfferIds = myOffers.Select(o => o.Id).ToList();
    var mySlots = await _context.OfferSlots.Where(s => myOfferIds.Contains(s.OfferId)).ToListAsync();
    var mySlotIds = mySlots.Select(s => s.Id).ToList();
    var myBookings = await _context.Bookings.Include(b => b.Slot).ThenInclude(s => s.Offer).Where(b => mySlotIds.Contains(b.SlotId)).OrderByDescending(b => b.BookedAt).ToListAsync();
    var confirmedCount = myBookings.Count(b => b.Status == BookingStatus.Confirmed);
    var conversionRate = myBookings.Count > 0 ? Math.Round((double)confirmedCount / myBookings.Count * 100, 1) : 0;
    var recentBookings = myBookings.Take(5).Select(b => new RecentBookingDto
    {
        Id = b.Id, BookingReference = b.BookingReference, CustomerName = b.CustomerName,
        CustomerEmail = b.CustomerEmail, OfferTitle = b.Slot?.Offer?.Title ?? "",
        SlotTime = b.Slot != null ? $"{b.Slot.StartTime:hh\\:mm} - {b.Slot.EndTime:hh\\:mm}" : "",
        PeopleCount = b.PeopleCount, Status = b.Status.ToString(), BookedAt = b.BookedAt
    }).ToList();
    return new DashboardStatsDto
    {
        TotalOffers = myOffers.Count, ActiveOffers = myOffers.Count(o => o.Status == "Active"),
        TotalBookings = myBookings.Count, TodaysBookings = myBookings.Count(b => b.BookedAt.Date == today),
        TotalCapacity = mySlots.Sum(s => s.Capacity), BookedSeats = mySlots.Sum(s => s.BookedCount),
        AvailableSeats = mySlots.Sum(s => s.AvailableCount), ConversionRate = conversionRate,
        RecentBookings = recentBookings
    };
}
        private BookingResponseDto MapToDto(Booking booking)
        {
            return new BookingResponseDto
            {
                Id               = booking.Id,
                BookingReference = booking.BookingReference,
                SlotId           = booking.SlotId,
                OfferId          = booking.OfferId,
                CustomerId       = booking.CustomerId ?? 0,
                CustomerName     = booking.CustomerName,
                CustomerEmail    = booking.CustomerEmail,
                CustomerPhone    = booking.CustomerPhone,
                PeopleCount      = booking.PeopleCount,
                SpecialNote      = booking.SpecialNote,
                OfferTitle       = booking.Slot?.Offer?.Title ?? "",
                BusinessName     = booking.Slot?.Offer?.Business?.Name ?? "",
                OfferPrice       = booking.Slot?.Offer?.OfferPrice ?? 0,
                SlotDate         = booking.Slot?.SlotDate ?? DateTime.UtcNow,
                SlotStartTime    = booking.Slot?.StartTime ?? TimeSpan.Zero,
                SlotEndTime      = booking.Slot?.EndTime ?? TimeSpan.Zero,
                Status           = booking.Status.ToString(),
                BookedAt         = booking.BookedAt
            };
        }
    }
}