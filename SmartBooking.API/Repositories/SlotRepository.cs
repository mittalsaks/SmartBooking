using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using SmartBooking.API.Data;
using SmartBooking.API.Interfaces;
using SmartBooking.API.Models;

namespace SmartBooking.API.Repositories
{
    public class SlotRepository : ISlotRepository
    {
        private readonly AppDbContext _context;

        public SlotRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<OfferSlot>> GetSlotsByOfferIdAsync(int offerId)
        {
            return await _context.OfferSlots
                .Where(s => s.OfferId == offerId)
                .OrderBy(s => s.SlotDate)
                .ThenBy(s => s.StartTime)
                .ToListAsync();
        }

        public async Task<OfferSlot?> GetByIdAsync(int id)
        {
            return await _context.OfferSlots
                .Include(s => s.Offer)
                .FirstOrDefaultAsync(s => s.Id == id);
        }

        public async Task<OfferSlot> AddAsync(OfferSlot slot)
        {
            _context.OfferSlots.Add(slot);
            await _context.SaveChangesAsync();
            return slot;
        }

        // ✅ Update
        public async Task<OfferSlot?> UpdateAsync(OfferSlot slot)
        {
            _context.OfferSlots.Update(slot);
            await _context.SaveChangesAsync();
            return slot;
        }

        // ✅ Delete
        public async Task<bool> DeleteAsync(int id)
        {
            var slot = await _context.OfferSlots.FindAsync(id);
            if (slot == null) return false;
            _context.OfferSlots.Remove(slot);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}