using Microsoft.EntityFrameworkCore;
using SmartBooking.API.Models;

namespace SmartBooking.API.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<User> Users { get; set; }
        public DbSet<Business> Businesses { get; set; }
        public DbSet<Offer> Offers { get; set; }
        public DbSet<OfferSlot> OfferSlots { get; set; }
        public DbSet<Booking> Bookings { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // ✅ Booking → Customer
            modelBuilder.Entity<Booking>()
                .HasOne(b => b.Customer)
                .WithMany(u => u.Bookings)
                .HasForeignKey(b => b.CustomerId)
                .OnDelete(DeleteBehavior.Restrict);

            // ✅ Booking → Offer
            modelBuilder.Entity<Booking>()
                .HasOne(b => b.Offer)
                .WithMany()
                .HasForeignKey(b => b.OfferId)
                .OnDelete(DeleteBehavior.Restrict);

            // ✅ Booking → OfferSlot
            modelBuilder.Entity<Booking>()
                .HasOne(b => b.Slot)
                .WithMany(s => s.Bookings)
                .HasForeignKey(b => b.SlotId)
                .OnDelete(DeleteBehavior.Restrict);

            // ✅ OfferSlot → Offer (NO explicit Offer→Business here — already via attribute)
            modelBuilder.Entity<OfferSlot>()
                .HasOne(s => s.Offer)
                .WithMany(o => o.Slots)
                .HasForeignKey(s => s.OfferId)
                .OnDelete(DeleteBehavior.Cascade);

            // ❌ REMOVED: Offer → Business config (causes BusinessId1 shadow property)
            // It's already handled by [ForeignKey("BusinessId")] in Offer.cs
        }
    }
}