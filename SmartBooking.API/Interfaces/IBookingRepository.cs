using System.Collections.Generic;
using System.Threading.Tasks;
using SmartBooking.API.Models;

namespace SmartBooking.API.Interfaces
{
    public interface IBookingRepository
    {
        Task<Booking> AddAsync(Booking booking);
        Task<Booking?> GetByIdAsync(int id);
        Task<IEnumerable<Booking>> GetAllAsync();
        Task<IEnumerable<Booking>> GetByOfferIdAsync(int offerId);
        Task<Booking?> UpdateAsync(Booking booking);
    }
}