using Microsoft.EntityFrameworkCore;
using SmartBooking.API.Data;
using SmartBooking.API.Models;

namespace SmartBooking.API;

public static class SlotSeeder
{
    public static async Task SeedSlotsAsync(AppDbContext context)
    {
        // ✅ Use Include so Slots collection is loaded
        var offersWithoutSlots = await context.Offers
            .Include(o => o.Slots)
            .Where(o => o.Status == "Active" && o.Slots.Count == 0)
            .ToListAsync();

        if (offersWithoutSlots.Count == 0)
        {
            Console.WriteLine("✅ All offers already have slots. Skipping seed.");
            return;
        }

        Console.WriteLine($"📅 Creating slots for {offersWithoutSlots.Count} offers...");

        foreach (var offer in offersWithoutSlots)
        {
            var startDate = offer.StartDate.Date;
            var endDate = offer.EndDate.Date;
            var daysBetween = (int)(endDate - startDate).TotalDays;
            var daysPerSlot = Math.Max(1, daysBetween / 3);
            int slotCapacity = Math.Max(5, offer.TotalCapacity / 3);

            for (int i = 0; i < 3; i++)
            {
                var slotDate = startDate.AddDays(i * daysPerSlot);
                if (slotDate > endDate) break;

                var slot = new OfferSlot
                {
                    OfferId = offer.Id,
                    SlotDate = slotDate,
                    StartTime = offer.StartTime,
                    EndTime = offer.EndTime,
                    Capacity = slotCapacity,
                    BookedCount = 0,
                    AvailableCount = slotCapacity, // ✅ Fixed
                    Status = "Available"
                };

                context.OfferSlots.Add(slot);
                Console.WriteLine($"  ✅ Slot for '{offer.Title}' on {slotDate:MMM dd, yyyy}");
            }
        }

        await context.SaveChangesAsync();
        Console.WriteLine("🎉 Slots seeded successfully!");
    }
}