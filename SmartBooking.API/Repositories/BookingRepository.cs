using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using SmartBooking.API.Data;
using SmartBooking.API.Interfaces;
using SmartBooking.API.Models;

namespace SmartBooking.API.Repositories
{
    public class BookingRepository : IBookingRepository
    {
        private readonly AppDbContext _context;

        public BookingRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<Booking> AddAsync(Booking booking)
        {
            _context.Bookings.Add(booking);
            await _context.SaveChangesAsync();
            return booking;
        }

        public async Task<Booking?> GetByIdAsync(int id)
        {
            return await _context.Bookings
                .Include(b => b.Customer)
                .Include(b => b.Slot)
                    .ThenInclude(s => s.Offer)
                        .ThenInclude(o => o.Business)
                .FirstOrDefaultAsync(b => b.Id == id);
        }

        public async Task<IEnumerable<Booking>> GetAllAsync()
        {
            return await _context.Bookings
                .Include(b => b.Customer)
                .Include(b => b.Slot)
                    .ThenInclude(s => s.Offer)
                        .ThenInclude(o => o.Business)
                .OrderByDescending(b => b.BookedAt)
                .ToListAsync();
        }

        public async Task<IEnumerable<Booking>> GetByOfferIdAsync(int offerId)
        {
            return await _context.Bookings
                .Include(b => b.Customer)
                .Include(b => b.Slot)
                    .ThenInclude(s => s.Offer)
                        .ThenInclude(o => o.Business)
                .Where(b => b.Slot.OfferId == offerId)
                .OrderByDescending(b => b.BookedAt)
                .ToListAsync();
        }

        public async Task<Booking?> UpdateAsync(Booking booking)
        {
            _context.Bookings.Update(booking);
            await _context.SaveChangesAsync();
            return booking;
        }
    }
}