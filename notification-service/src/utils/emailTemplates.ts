export const buildNotificationHtml = (type: string, payload: Record<string, any>) => {
  const baseButton = (text: string, href = '#') => `
    <a href="${href}" style="display:inline-block;padding:14px 28px;border-radius:12px;background:#10b981;color:#fff;text-decoration:none;font-weight:700;box-shadow:0 18px 32px rgba(16,185,129,0.18);">${text}</a>
  `;

  const header = `
    <div style="padding:24px;background:#0f172a;border-radius:24px 24px 0 0;text-align:center;box-shadow:0 20px 60px rgba(0,0,0,0.25);">
      <h1 style="margin:0;color:#a7f3d0;font-family:Inter,sans-serif;letter-spacing:0.02em;">SmartBooking Notification</h1>
      <p style="margin:8px 0 0;color:#cbd5e1;">${type.replace(/_/g, ' ').toUpperCase()}</p>
    </div>
  `;

  const footer = `
    <div style="padding:24px;text-align:center;color:#94a3b8;font-family:Inter,sans-serif;font-size:13px;">
      <p style="margin:0;">You are receiving this message because you subscribed to SmartBooking notifications.</p>
    </div>
  `;

  switch (type) {
    case 'registration':
      return {
        subject: 'Welcome to SmartBooking',
        html: `
          <div style="max-width:700px;margin:0 auto;background:#040714;border-radius:28px;overflow:hidden;border:1px solid rgba(16,185,129,0.14);">
            ${header}
            <div style="padding:32px;color:#e2e8f0;font-family:Inter,sans-serif;line-height:1.7;">
              <p>Thanks for joining SmartBooking. Your account is ready to receive premium offers, booking alerts, and reminders.</p>
              <p>${payload.message || 'Stay tuned for exclusive deals near you.'}</p>
              ${baseButton('Browse Offers', payload.url || 'https://yourapp.example.com')}
            </div>
            ${footer}
          </div>
        `,
      };
    case 'otp':
      return {
        subject: 'Your SmartBooking OTP Code',
        html: `
          <div style="max-width:700px;margin:0 auto;background:#040714;border-radius:28px;overflow:hidden;border:1px solid rgba(16,185,129,0.14);">
            ${header}
            <div style="padding:32px;color:#e2e8f0;font-family:Inter,sans-serif;line-height:1.7;">
              <p>Your one-time passcode is:</p>
              <p style="font-size:32px;font-weight:700;color:#10b981;margin:22px 0;letter-spacing:1px;">${payload.code || '000000'}</p>
              <p>This code expires in 10 minutes.</p>
            </div>
            ${footer}
          </div>
        `,
      };
    case 'booking_confirmation':
      return {
        subject: 'Booking Confirmed',
        html: `
          <div style="max-width:700px;margin:0 auto;background:#040714;border-radius:28px;overflow:hidden;border:1px solid rgba(16,185,129,0.14);">
            ${header}
            <div style="padding:32px;color:#e2e8f0;font-family:Inter,sans-serif;line-height:1.7;">
              <p>Great news — your booking is confirmed.</p>
              <p><strong>Offer:</strong> ${payload.offerTitle || 'Smart Offer'}</p>
              <p><strong>Date:</strong> ${payload.date || 'TBD'} | <strong>Time:</strong> ${payload.time || 'TBD'}</p>
              <p>${payload.message || 'Our team will contact you if any changes occur.'}</p>
              ${baseButton('View Booking', payload.url || 'https://yourapp.example.com/bookings')}
            </div>
            ${footer}
          </div>
        `,
      };
    case 'booking_cancellation':
      return {
        subject: 'Booking Cancelled',
        html: `
          <div style="max-width:700px;margin:0 auto;background:#040714;border-radius:28px;overflow:hidden;border:1px solid rgba(16,185,129,0.14);">
            ${header}
            <div style="padding:32px;color:#e2e8f0;font-family:Inter,sans-serif;line-height:1.7;">
              <p>Your booking has been cancelled.</p>
              <p><strong>Offer:</strong> ${payload.offerTitle || 'Smart Offer'}</p>
              <p>${payload.reason || 'No reason provided.'}</p>
              ${baseButton('Browse New Offers', payload.url || 'https://yourapp.example.com')}
            </div>
            ${footer}
          </div>
        `,
      };
    case 'offer_reminder':
      return {
        subject: 'Offer Reminder',
        html: `
          <div style="max-width:700px;margin:0 auto;background:#040714;border-radius:28px;overflow:hidden;border:1px solid rgba(16,185,129,0.14);">
            ${header}
            <div style="padding:32px;color:#e2e8f0;font-family:Inter,sans-serif;line-height:1.7;">
              <p>Reminder: one of your saved offers is about to expire.</p>
              <p><strong>Offer:</strong> ${payload.offerTitle || 'Smart Offer'}</p>
              <p>Expires on ${payload.expiryDate || 'soon'}.</p>
              ${baseButton('Book Now', payload.url || 'https://yourapp.example.com/offers')}
            </div>
            ${footer}
          </div>
        `,
      };
    case 'expiry_alert':
      return {
        subject: 'Offer Expiring Soon',
        html: `
          <div style="max-width:700px;margin:0 auto;background:#040714;border-radius:28px;overflow:hidden;border:1px solid rgba(16,185,129,0.14);">
            ${header}
            <div style="padding:32px;color:#e2e8f0;font-family:Inter,sans-serif;line-height:1.7;">
              <p>Hurry! Your saved offer is about to expire.</p>
              <p><strong>Offer:</strong> ${payload.offerTitle || 'Smart Offer'}</p>
              <p>Expires in ${payload.timeRemaining || 'a few hours'}.</p>
              ${baseButton('Redeem Offer', payload.url || 'https://yourapp.example.com/offers')}
            </div>
            ${footer}
          </div>
        `,
      };
    case 'new_offer':
    default:
      return {
        subject: 'New Offer Available',
        html: `
          <div style="max-width:700px;margin:0 auto;background:#040714;border-radius:28px;overflow:hidden;border:1px solid rgba(16,185,129,0.14);">
            ${header}
            <div style="padding:32px;color:#e2e8f0;font-family:Inter,sans-serif;line-height:1.7;">
              <p>A new offer has arrived that matches your preferences.</p>
              <p><strong>Offer:</strong> ${payload.offerTitle || 'New Deal'}</p>
              <p>${payload.message || 'Check it before it sells out.'}</p>
              ${baseButton('View Offer', payload.url || 'https://yourapp.example.com/offers')}
            </div>
            ${footer}
          </div>
        `,
      };
  }
};
