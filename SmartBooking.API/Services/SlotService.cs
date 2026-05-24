using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using SmartBooking.API.DTOs;
using SmartBooking.API.Interfaces;
using SmartBooking.API.Models;

namespace SmartBooking.API.Services
{
    public interface ISlotService
    {
        Task<IEnumerable<SlotResponseDto>> GetSlotsForOfferAsync(int offerId);
        Task<SlotResponseDto?> GetSlotByIdAsync(int id);          // ✅ ADDED
        Task<SlotResponseDto> CreateSlotAsync(CreateSlotDto request);
        Task<SlotResponseDto?> UpdateSlotAsync(int id, UpdateSlotDto request);
        Task<bool> DeleteSlotAsync(int id);
    }

    public class SlotService : ISlotService
    {
        private readonly ISlotRepository _slotRepository;
        private readonly IOfferRepository _offerRepository;

        public SlotService(ISlotRepository slotRepository, IOfferRepository offerRepository)
        {
            _slotRepository = slotRepository;
            _offerRepository = offerRepository;
        }

        public async Task<IEnumerable<SlotResponseDto>> GetSlotsForOfferAsync(int offerId)
        {
            var slots = await _slotRepository.GetSlotsByOfferIdAsync(offerId);
            return slots.Select(MapToResponseDto);
        }

        // ✅ ADDED - fixes 405 error on GET /api/slots/{id}
        public async Task<SlotResponseDto?> GetSlotByIdAsync(int id)
        {
            var slot = await _slotRepository.GetByIdAsync(id);
            if (slot == null) return null;
            return MapToResponseDto(slot);
        }

        public async Task<SlotResponseDto> CreateSlotAsync(CreateSlotDto request)
        {
            if (request.StartTime >= request.EndTime)
                throw new ArgumentException("Start time must be before end time.");

            var offer = await _offerRepository.GetByIdAsync(request.OfferId);
            if (offer == null)
                throw new ArgumentException("Offer does not exist.");

            var slot = new OfferSlot
            {
                OfferId        = request.OfferId,
                SlotDate       = request.SlotDate.ToUniversalTime(),
                StartTime      = request.StartTime,
                EndTime        = request.EndTime,
                Capacity       = request.Capacity,
                BookedCount    = 0,
                AvailableCount = request.Capacity,
                Status         = "Available"
            };

            var created = await _slotRepository.AddAsync(slot);
            return MapToResponseDto(created);
        }

        public async Task<SlotResponseDto?> UpdateSlotAsync(int id, UpdateSlotDto request)
        {
            var slot = await _slotRepository.GetByIdAsync(id);
            if (slot == null) return null;

            if (request.StartTime >= request.EndTime)
                throw new ArgumentException("Start time must be before end time.");

            slot.SlotDate      = request.SlotDate.ToUniversalTime();
            slot.StartTime     = request.StartTime;
            slot.EndTime       = request.EndTime;
            slot.Capacity      = request.Capacity;
            slot.AvailableCount = request.Capacity - slot.BookedCount;
            slot.Status        = slot.AvailableCount <= 0 ? "Full" : "Available";

            var updated = await _slotRepository.UpdateAsync(slot);
            return updated == null ? null : MapToResponseDto(updated);
        }

        public async Task<bool> DeleteSlotAsync(int id)
        {
            return await _slotRepository.DeleteAsync(id);
        }

        private SlotResponseDto MapToResponseDto(OfferSlot slot)
        {
            return new SlotResponseDto
            {
                Id             = slot.Id,
                OfferId        = slot.OfferId,
                SlotDate       = slot.SlotDate,
                StartTime      = slot.StartTime,
                EndTime        = slot.EndTime,
                Capacity       = slot.Capacity,
                BookedCount    = slot.BookedCount,
                AvailableCount = slot.AvailableCount,
                Status         = slot.Status
            };
        }
    }
}