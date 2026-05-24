# SmartBooking Notification Service

A dedicated Node.js + Express + TypeScript notification service for SmartBooking.

## Features

- Gmail email notifications using Nodemailer
- SMS notifications using Twilio
- WhatsApp messages using Twilio WhatsApp API
- Queue-based processing with BullMQ + Redis
- JWT-secured APIs
- Notification history persistence with Prisma + PostgreSQL
- User preference settings for channels/types
- Retry / error handling
- HTML email templates

## Setup

1. Copy `.env.example` to `.env` and fill in your credentials.
2. Run `npm install`.
3. Generate Prisma client:

```bash
cd notification-service
npx prisma generate
```

4. Create the database schema with Prisma migration:

```bash
npx prisma migrate dev --name init
```

5. Start Redis locally or connect to your Redis instance.
6. Run the service:

```bash
npm run dev
```

## Available APIs

### Authentication

- `POST /api/auth/register`
- `POST /api/auth/login`

### User preferences

- `GET /api/preferences`
- `PUT /api/preferences`

### Notifications

- `POST /api/notifications/send`
- `GET /api/notifications/history`

## Notification payload examples

### Booking confirmation

```json
{
  "userId": 1,
  "type": "booking_confirmation",
  "payload": {
    "offerTitle": "Premium Haircut",
    "date": "2026-06-01",
    "time": "14:00",
    "url": "https://yourapp.example.com/bookings/123"
  }
}
```

### New offer

```json
{
  "userId": 1,
  "type": "new_offer",
  "payload": {
    "offerTitle": "50% Off Coaching",
    "message": "A new limited-time offer is live.",
    "url": "https://yourapp.example.com/offers/42"
  }
}
```

## Notes

- This service is independent from your existing .NET backend and can be wired into booking flows via HTTP requests.
- The queue worker processes retries automatically and stores failure details in notification history.
- Use the notification history endpoint to display user-facing delivery records.
