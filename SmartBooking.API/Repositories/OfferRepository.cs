using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using SmartBooking.API.Data;
using SmartBooking.API.Interfaces;
using SmartBooking.API.Models;

namespace SmartBooking.API.Repositories
{
    public class OfferRepository : IOfferRepository
    {
        private readonly AppDbContext _context;

        public OfferRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Offer>> GetAllAsync()
        {
            // Filter for Active offers only for public listing
            return await _context.Offers
                .Where(o => o.Status == "Active")
                .Include(o => o.Business)
                .Include(o => o.Slots)
                .OrderByDescending(o => o.CreatedAt)
                .ToListAsync();
        }

        public async Task<Offer?> GetByIdAsync(int id)
        {
            return await _context.Offers
                .Include(o => o.Business)
                .Include(o => o.Slots)
                .FirstOrDefaultAsync(o => o.Id == id);
        }

        public async Task<Offer> AddAsync(Offer offer)
        {
            _context.Offers.Add(offer);
            await _context.SaveChangesAsync();
            return offer;
        }

        public async Task UpdateAsync(Offer offer)
        {
            _context.Offers.Update(offer);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(Offer offer)
        {
            _context.Offers.Remove(offer);
            await _context.SaveChangesAsync();
        }
    }
}