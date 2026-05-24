using System.Collections.Generic;
using System.Threading.Tasks;
using SmartBooking.API.Models;

namespace SmartBooking.API.Interfaces
{
    public interface ISlotRepository
    {
        Task<IEnumerable<OfferSlot>> GetSlotsByOfferIdAsync(int offerId);
        Task<OfferSlot?> GetByIdAsync(int id);
        Task<OfferSlot> AddAsync(OfferSlot slot);
        Task<OfferSlot?> UpdateAsync(OfferSlot slot);   // ✅ added
        Task<bool> DeleteAsync(int id);                  // ✅ added
    }
}