using System.Threading.Tasks;
using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;
using Microsoft.Extensions.Configuration;

namespace SmartBooking.API.Services
{
    public interface IEmailService
    {
        Task SendBookingConfirmationAsync(
            string toEmail,
            string customerName,
            string bookingReference,
            string offerTitle,
            string businessName,
            string slotDate,
            string slotTime
        );
    }

    public class EmailService : IEmailService
    {
        private readonly IConfiguration _config;

        public EmailService(IConfiguration config)
        {
            _config = config;
        }

        public async Task SendBookingConfirmationAsync(
            string toEmail,
            string customerName,
            string bookingReference,
            string offerTitle,
            string businessName,
            string slotDate,
            string slotTime)
        {
            // Isko yeh karo:
            var gmailUser = _config["GMAIL_USER"];        // ✅ New
            var gmailPass = _config["GMAIL_APP_PASSWORD"]; // ✅ New

            var message = new MimeMessage();
            message.From.Add(new MailboxAddress("SmartBooking", gmailUser));
            message.To.Add(new MailboxAddress(customerName, toEmail));
            message.Subject = $"✅ Booking Confirmed — {bookingReference}";

            message.Body = new TextPart("html")
            {
                Text = $@"
                <div style='font-family:sans-serif; max-width:500px; margin:auto;'>
                    <h2 style='color:#2563eb;'>Booking Confirmed! 🎉</h2>
                    <p>Hi <b>{customerName}</b>, your booking is confirmed.</p>
                    <table style='width:100%; border-collapse:collapse;'>
                        <tr><td style='padding:8px; color:#6b7280;'>Reference #</td>
                            <td style='padding:8px; font-weight:bold; color:#2563eb;'>{bookingReference}</td></tr>
                        <tr style='background:#f9fafb;'>
                            <td style='padding:8px; color:#6b7280;'>Offer</td>
                            <td style='padding:8px; font-weight:bold;'>{offerTitle}</td></tr>
                        <tr><td style='padding:8px; color:#6b7280;'>Business</td>
                            <td style='padding:8px; font-weight:bold;'>{businessName}</td></tr>
                        <tr style='background:#f9fafb;'>
                            <td style='padding:8px; color:#6b7280;'>Date</td>
                            <td style='padding:8px; font-weight:bold;'>{slotDate}</td></tr>
                        <tr><td style='padding:8px; color:#6b7280;'>Time</td>
                            <td style='padding:8px; font-weight:bold;'>{slotTime}</td></tr>
                    </table>
                    <p style='color:#6b7280; font-size:12px; margin-top:24px;'>
                        Thank you for booking with SmartBooking!
                    </p>
                </div>"
            };

            using var smtp = new SmtpClient();
            await smtp.ConnectAsync("smtp.gmail.com", 587, SecureSocketOptions.StartTls);
            await smtp.AuthenticateAsync(gmailUser, gmailPass);
            await smtp.SendAsync(message);
            await smtp.DisconnectAsync(true);
        }
    }
}