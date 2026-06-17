using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using SmartBooking.API.DTOs;
using SmartBooking.API.Interfaces;
using SmartBooking.API.Models;

namespace SmartBooking.API.Services
{
    public interface IOfferService
    {
        Task<IEnumerable<OfferResponseDto>> GetAllOffersAsync();
        Task<OfferResponseDto?> GetOfferByIdAsync(int id);
        Task<OfferResponseDto> CreateOfferAsync(CreateOfferDto request);
        Task<bool> UpdateOfferAsync(int id, UpdateOfferDto request);
        Task<bool> DeleteOfferAsync(int id);
    }

    public class OfferService : IOfferService
    {
        private readonly IOfferRepository _repository;

        public OfferService(IOfferRepository repository)
        {
            _repository = repository;
        }

        public async Task<IEnumerable<OfferResponseDto>> GetAllOffersAsync()
        {
            var offers = await _repository.GetAllAsync();
            return offers.Select(MapToResponseDto);
            // .Where(o => o.BusinessId == businessId)  // ✅ Filter
            //     .Select(MapToResponseDto);
        }

        public async Task<OfferResponseDto?> GetOfferByIdAsync(int id)
        {
            var offer = await _repository.GetByIdAsync(id);
            if (offer == null) return null;
            return MapToResponseDto(offer);
        }

        public async Task<OfferResponseDto> CreateOfferAsync(CreateOfferDto request)
        {
            if (request.OfferPrice >= request.OriginalPrice)
                throw new ArgumentException("Offer price must be less than original price.");

            var offer = new Offer
            {
                BusinessId = request.BusinessId,
                Title = request.Title,
                Description = request.Description,
                Category = request.Category,
                OriginalPrice = request.OriginalPrice,
                OfferPrice = request.OfferPrice,
                DiscountPercentage = request.DiscountPercentage,
                StartDate = request.StartDate.ToUniversalTime(),
                EndDate = request.EndDate.ToUniversalTime(),
                StartTime = request.StartTime,
                EndTime = request.EndTime,
                TotalCapacity = request.TotalCapacity,
                MaxBookingPerCustomer = request.MaxBookingPerCustomer,
                TermsAndConditions = request.TermsAndConditions,
                Status = request.Status ?? "Active",
                ImageUrl = request.ImageUrl,
                // ✅ Generate slots on creation
                Slots = GenerateSlots(
                    request.TotalCapacity,
                    request.StartDate.ToUniversalTime(),
                    request.EndDate.ToUniversalTime(),
                    request.StartTime,
                    request.EndTime
                )
            };

            var createdOffer = await _repository.AddAsync(offer);
            return MapToResponseDto(createdOffer);
        }

        public async Task<bool> UpdateOfferAsync(int id, UpdateOfferDto request)
        {
            if (request.OfferPrice >= request.OriginalPrice)
                throw new ArgumentException("Offer price must be less than original price.");

            var offer = await _repository.GetByIdAsync(id);
            if (offer == null) return false;

            offer.Title = request.Title;
            offer.Description = request.Description;
            offer.Category = request.Category;
            offer.OriginalPrice = request.OriginalPrice;
            offer.OfferPrice = request.OfferPrice;
            offer.DiscountPercentage = request.DiscountPercentage;
            offer.StartDate = request.StartDate.ToUniversalTime();
            offer.EndDate = request.EndDate.ToUniversalTime();
            offer.StartTime = request.StartTime;
            offer.EndTime = request.EndTime;
            offer.MaxBookingPerCustomer = request.MaxBookingPerCustomer;
            offer.TermsAndConditions = request.TermsAndConditions;
            offer.Status = request.Status;
            offer.ImageUrl = request.ImageUrl;

            // ✅ Sync slots if TotalCapacity changed
            if (request.TotalCapacity != offer.TotalCapacity)
            {
                offer.TotalCapacity = request.TotalCapacity;

                int bookedCount = offer.Slots?.Count(s => s.Status == "Booked") ?? 0;

                // Remove available slots, keep booked ones
                if (offer.Slots != null)
                {
                    var toRemove = offer.Slots.Where(s => s.Status == "Available").ToList();
                    foreach (var slot in toRemove)
                        offer.Slots.Remove(slot);
                }
                else
                {
                    offer.Slots = new List<OfferSlot>();
                }

                // Add new available slots
                int newAvailable = Math.Max(0, request.TotalCapacity - bookedCount);
                var newSlots = GenerateSlots(
                    newAvailable,
                    request.StartDate.ToUniversalTime(),
                    request.EndDate.ToUniversalTime(),
                    request.StartTime,
                    request.EndTime
                );
                foreach (var slot in newSlots)
                    offer.Slots.Add(slot);
            }

            await _repository.UpdateAsync(offer);
            return true;
        }

        public async Task<bool> DeleteOfferAsync(int id)
        {
            var offer = await _repository.GetByIdAsync(id);
            if (offer == null) return false;
            await _repository.DeleteAsync(offer);
            return true;
        }

        // ✅ Generates slots spread across offer date range
        private List<OfferSlot> GenerateSlots(
            int totalCapacity,
            DateTime startDate,
            DateTime endDate,
            TimeSpan startTime,
            TimeSpan endTime)
        {
            var slots = new List<OfferSlot>();
            int numberOfSlots = Math.Max(1, Math.Min(3, totalCapacity));
            int capacityPerSlot = (int)Math.Ceiling((double)totalCapacity / numberOfSlots);

            var daysBetween = (int)(endDate.Date - startDate.Date).TotalDays;
            var daysPerSlot = Math.Max(1, daysBetween / numberOfSlots);

            for (int i = 0; i < numberOfSlots; i++)
            {
                var slotDate = startDate.Date.AddDays(i * daysPerSlot);
                if (slotDate > endDate.Date) break;

                slots.Add(new OfferSlot
                {
                    SlotDate = slotDate,
                    StartTime = startTime,
                    EndTime = endTime,
                    Capacity = capacityPerSlot,
                    BookedCount = 0,
                    AvailableCount = capacityPerSlot, // ✅ Fixed
                    Status = "Available"
                });
            }

            return slots;
        }

        private OfferResponseDto MapToResponseDto(Offer offer)
        {
            // ✅ Count available slots by Status OR by AvailableCount
            var availableCount = offer.Slots?
                .Where(s => s.Status == "Available")
                .Sum(s => s.AvailableCount) ?? 0;

            return new OfferResponseDto
            {
                Id = offer.Id,
                BusinessId = offer.BusinessId,
                BusinessName = offer.Business?.Name ?? "Premium Store",
                BusinessType = offer.Business?.BusinessType ?? "Services",
                BusinessAddress = offer.Business?.Address ?? string.Empty,
                BusinessCity = offer.Business?.City ?? string.Empty,
                BusinessLogoUrl = offer.Business?.LogoUrl,
                Title = offer.Title,
                Description = offer.Description,
                Category = offer.Category,
                OriginalPrice = offer.OriginalPrice,
                OfferPrice = offer.OfferPrice,
                DiscountPercentage = offer.DiscountPercentage,
                StartDate = offer.StartDate,
                EndDate = offer.EndDate,
                StartTime = offer.StartTime,
                EndTime = offer.EndTime,
                TotalCapacity = offer.TotalCapacity,
                MaxBookingPerCustomer = offer.MaxBookingPerCustomer,
                AvailableSlotsCount = availableCount,
                CanBook = offer.Status == "Active" && availableCount > 0,
                ImageUrl = offer.ImageUrl,
                TermsAndConditions = offer.TermsAndConditions,
                Status = offer.Status,
                CreatedAt = offer.CreatedAt
            };
        }
    }
}