using System.Collections.Generic;
using System.Threading.Tasks;
using SmartBooking.API.Models;

namespace SmartBooking.API.Interfaces
{
    public interface IOfferRepository
    {
        Task<IEnumerable<Offer>> GetAllAsync();
        Task<Offer?> GetByIdAsync(int id);
        Task<Offer> AddAsync(Offer offer);
        Task UpdateAsync(Offer offer);
        Task DeleteAsync(Offer offer);
    }
}