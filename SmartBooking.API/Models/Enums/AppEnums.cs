// Models/Enums/AppEnums.cs
namespace SmartBooking.API.Models.Enums
{
    public enum UserRole { Admin, BusinessOwner, Customer }
    public enum OfferStatus { Active, Expired, Cancelled }
    public enum SlotStatus { Available, FullyBooked, Cancelled }
    public enum BookingStatus { Pending, Confirmed, Cancelled, Completed }
}