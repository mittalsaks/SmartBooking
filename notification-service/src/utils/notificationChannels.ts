import nodemailer from 'nodemailer';
import twilio from 'twilio';

// ── Email (Gmail SMTP via Nodemailer) ─────────────────────────────────────

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD, // use an App Password, not your real password
  },
});

export const sendEmail = async (to: string, subject: string, html: string): Promise<void> => {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    console.warn('[Email] GMAIL_USER or GMAIL_APP_PASSWORD not set – skipping send');
    return;
  }

  await transporter.sendMail({
    from: `"SmartBooking" <${process.env.GMAIL_USER}>`,
    to,
    subject,
    html,
  });

  console.log(`[Email] Sent to ${to}: ${subject}`);
};

// ── SMS (Twilio) ───────────────────────────────────────────────────────────

const getTwilioClient = () => {
  const sid   = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;

  if (!sid || !token) {
    throw new Error('TWILIO_ACCOUNT_SID or TWILIO_AUTH_TOKEN not set');
  }
  return twilio(sid, token);
};

export const sendSms = async (to: string, payload: Record<string, any>): Promise<void> => {
  const client = getTwilioClient();
  const from   = process.env.TWILIO_SMS_FROM;

  if (!from) throw new Error('TWILIO_SMS_FROM not set');

  // Build a plain-text SMS body from the payload
  const body = payload.message
    || (payload.offerTitle ? `SmartBooking: ${payload.offerTitle}` : 'You have a new SmartBooking notification.');

  await client.messages.create({ body, from, to });
  console.log(`[SMS] Sent to ${to}`);
};

// ── WhatsApp (Twilio WhatsApp sandbox) ────────────────────────────────────

export const sendWhatsApp = async (to: string, payload: Record<string, any>): Promise<void> => {
  const client = getTwilioClient();
  const from   = process.env.TWILIO_WHATSAPP_FROM;
  if (!from) throw new Error('TWILIO_WHATSAPP_FROM not set');

  // ✅ Booking confirmation ka proper message
  const body = payload.message ?? buildWhatsAppBody(payload);

  await client.messages.create({
    body,
    from: `whatsapp:${from}`,
    to:   `whatsapp:${to}`,
  });
  console.log(`[WhatsApp] Sent to ${to}`);
};

// ✅ Yeh helper function add karo — same file mein
function buildWhatsAppBody(payload: Record<string, any>): string {
  if (payload.bookingRef) {
    return [
      `✅ *Booking Confirmed!*`,
      ``,
      `Hi ${payload.customerName || 'Customer'}!`,
      ``,
      `📋 Ref: *${payload.bookingRef}*`,
      `🎯 ${payload.offerTitle ?? ''}${payload.businessName ? ' @ ' + payload.businessName : ''}`,
      `📅 ${payload.slotDate ?? ''} | ${payload.startTime ?? ''} – ${payload.endTime ?? ''}`,
      `👥 ${payload.peopleCount ?? 1} person(s)`,
      payload.offerPrice ? `💰 ₹${payload.offerPrice} per person` : '',
      ``,
      `Show this at the venue to redeem. 🙌`,
    ].filter(Boolean).join('\n');
  }
  return payload.offerTitle
    ? `SmartBooking: ${payload.offerTitle}`
    : 'You have a new SmartBooking notification.';
}