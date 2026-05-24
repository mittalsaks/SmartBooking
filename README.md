# 📱 SmartBooking - Notification Service Platform

<div align="center">

**A Modern Full-Stack Booking & Notification Management System**

![License](https://img.shields.io/badge/License-MIT-green.svg)
![Status](https://img.shields.io/badge/Status-Active-success.svg)
![Node](https://img.shields.io/badge/Node.js-20+-green)
![.NET](https://img.shields.io/badge/.NET-8.0-blueviolet)
![React](https://img.shields.io/badge/React-19-blue)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791)

</div>

## 📋 Table of Contents

- [Overview](#overview)
- [Problem Statement & Solution](#problem-statement--solution)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Screenshots](#screenshots)
- [Setup & Installation](#setup--installation)
- [Environment Variables](#environment-variables)
- [Backend Setup](#backend-setup)
- [Frontend Setup](#frontend-setup)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [Contributing](#contributing)
- [License](#license)

---

## 🎯 Overview

**SmartBooking Notification Service** is a comprehensive full-stack solution for managing service bookings, real-time notifications, and admin dashboards. Built for the hackathon, this platform combines a powerful ASP.NET Core backend with a modern React frontend to deliver a seamless booking experience with intelligent notification delivery.

The system enables businesses to:
- Create and manage service offers
- Handle customer bookings with real-time updates
- Send notifications via Email, SMS, and WhatsApp
- Track booking history and analytics
- Manage capacity and availability slots

---

## 🔍 Problem Statement & Solution

### **The Problem**
Traditional booking systems lack:
- Real-time notification delivery
- Integrated multi-channel communication (Email, SMS, WhatsApp)
- Comprehensive analytics for businesses
- User-friendly admin dashboards
- Scalable architecture for handling concurrent bookings

### **Our Solution**
SmartBooking provides:
✅ **Real-time Notifications** - Instant updates via multiple channels  
✅ **Admin Dashboard** - Complete business analytics and management  
✅ **Multi-Channel Delivery** - Email, SMS, and WhatsApp integration  
✅ **Scalable Architecture** - Built with modern technologies for high performance  
✅ **Responsive Design** - Works seamlessly on desktop and mobile  

---

## ✨ Key Features

### 📊 Admin Dashboard
- **Overview Statistics** - Real-time metrics for bookings, offers, and revenue
- **Booking Management** - View, filter, and manage all bookings
- **Offer Management** - Create, update, and manage service offers
- **Capacity Tracking** - Monitor available slots and capacity
- **Real-time Updates** - Live dashboard with auto-refresh capabilities

### 🔔 Notification System
- **Multi-Channel Delivery** - Email, SMS, and WhatsApp notifications
- **Smart Scheduling** - Delayed and scheduled notifications
- **Notification History** - Complete audit trail of all notifications
- **Template Management** - Customizable notification templates

### 🛡️ Authentication & Security
- **JWT Authentication** - Secure token-based authentication
- **Role-Based Access** - Admin and user roles with permissions
- **Password Hashing** - BCrypt encryption for user passwords
- **Data Validation** - Server-side and client-side validation

### 📱 Responsive UI
- **Modern Design** - Dark theme with neon glassmorphism effects
- **Framer Motion Animations** - Smooth, engaging user interactions
- **Mobile-First** - Fully responsive on all devices
- **Accessibility** - WCAG compliant interface

---

## 🛠️ Tech Stack

### **Backend**
| Technology | Purpose |
|-----------|---------|
| **ASP.NET Core 8** | Web API framework |
| **Entity Framework Core** | ORM for database operations |
| **PostgreSQL** | Primary database |
| **Swagger/OpenAPI** | API documentation |
| **BCrypt.NET** | Password hashing |
| **JWT Bearer** | Authentication |

### **Frontend**
| Technology | Purpose |
|-----------|---------|
| **React 19** | UI library |
| **TypeScript** | Type-safe JavaScript |
| **Vite** | Build tool and dev server |
| **Tailwind CSS** | Utility-first CSS framework |
| **Framer Motion** | Animation library |
| **React Router** | Client-side routing |
| **Axios** | HTTP client |
| **Lucide React** | Icon library |

### **Infrastructure**
| Service | Purpose |
|---------|---------|
| **PostgreSQL** | Relational database |
| **Redis** | Caching and job queues |
| **Twilio** | SMS delivery |
| **Gmail SMTP** | Email delivery |
| **Upstash Redis** | Cloud Redis service |

---

## 📁 Project Structure

```
SmartBooking/
├── frontend/                          # React TypeScript frontend
│   ├── src/
│   │   ├── components/               # Reusable UI components
│   │   ├── pages/                    # Page components
│   │   │   ├── admin/               # Admin dashboard pages
│   │   │   ├── Home.tsx             # Landing page
│   │   │   ├── Login.tsx            # Authentication
│   │   │   └── OfferDetail.tsx      # Offer details
│   │   ├── api/                      # API client setup
│   │   ├── services/                # Business logic
│   │   ├── store/                   # Zustand state management
│   │   ├── layouts/                 # Layout components
│   │   ├── types/                   # TypeScript definitions
│   │   └── utils/                   # Utility functions
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── tsconfig.json
│
├── SmartBooking.API/                 # ASP.NET Core backend
│   ├── Controllers/                  # API endpoints
│   │   ├── AuthController.cs
│   │   ├── BookingsController.cs
│   │   ├── OffersController.cs
│   │   ├── SlotsController.cs
│   │   └── BusinessController.cs
│   ├── Models/                       # Data models
│   │   ├── User.cs
│   │   ├── Business.cs
│   │   ├── Offer.cs
│   │   ├── Booking.cs
│   │   └── OfferSlot.cs
│   ├── Data/                         # Database context
│   │   └── AppDbContext.cs
│   ├── DTOs/                         # Data transfer objects
│   ├── Services/                     # Business services
│   ├── Repositories/                 # Data access layer
│   ├── Migrations/                   # EF Core migrations
│   ├── Program.cs                    # App configuration
│   └── appsettings.json
│
├── notification-service/              # Node.js notification service
│   ├── src/
│   │   ├── services/                # Notification services
│   │   ├── workers/                 # Background job processing
│   │   └── routes/                  # API routes
│   ├── .env.example
│   └── package.json
│
└── images/                           # Screenshots and media
    ├── frontend images/              # UI screenshots
    └── Swagger images/               # API documentation
```

---

## 📸 Screenshots

### 📊 Admin Dashboard

The heart of SmartBooking - a comprehensive admin interface for managing bookings, offers, and business metrics.

![Admin Dashboard - Overview](./images/frontend%20images/Screenshot%202026-05-24%20235727.png)

**Dashboard Features:**
- Real-time statistics (15 bookings, 10 offers, 7 slots)
- Conversion rate tracking (85.7%)
- Recent bookings with status indicators
- Quick navigation sidebar
- Admin profile management

### 📋 Booking Management

Complete booking management with filtering, sorting, and status updates.

![Booking Management](./images/frontend%20images/Screenshot%202026-05-24%20235734.png)

**Capabilities:**
- View all bookings in table format
- Filter by status (COMPLETED, CANCELLED, PENDING)
- Real-time status updates
- Booking details and history
- Customer information display

### 🔧 API Documentation

Interactive Swagger/OpenAPI documentation for all backend endpoints.

![Swagger API Documentation](./images/Swagger%20images/Screenshot%202026-05-24%20225418.png)

**Available Endpoints:**
- **Auth**: User registration and login
- **Bookings**: Create, read, update, delete bookings
- **Offers**: Manage service offers and pricing
- **Slots**: Manage availability and capacity
- **Business**: Manage business profile information

---

## 🚀 Setup & Installation

### Prerequisites

Ensure you have the following installed:
- **Node.js** 18+ ([Download](https://nodejs.org/))
- **.NET SDK** 8.0+ ([Download](https://dotnet.microsoft.com/download))
- **PostgreSQL** 14+ ([Download](https://www.postgresql.org/download/))
- **Git** ([Download](https://git-scm.com/))

### Clone Repository

```bash
git clone https://github.com/mittalsaks/SmartBooking.git
cd SmartBooking
```

### Install Dependencies

#### Frontend Dependencies
```bash
cd frontend
npm install
cd ..
```

#### Backend Dependencies
```bash
cd SmartBooking.API
dotnet restore
cd ..
```

#### Notification Service Dependencies
```bash
cd notification-service
npm install
cd ..
```

---

## 🔐 Environment Variables

### Backend Configuration (`SmartBooking.API/appsettings.json`)

Create or update the configuration file:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=smartbooking;Username=postgres;Password=your_password"
  },
  "Jwt": {
    "Secret": "your-super-secret-jwt-key-minimum-32-characters",
    "ExpiresInDays": 7
  },
  "Swagger": {
    "Enabled": true
  }
}
```

### Notification Service Configuration (`.env`)

Copy `.env.example` and create `.env`:

```bash
cp notification-service/.env.example notification-service/.env
```

Edit `notification-service/.env`:

```env
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/smartbooking_notifications"

# Service
PORT=4000
FRONTEND_ORIGIN=http://localhost:5173

# JWT
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=7d

# Gmail SMTP
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-app-specific-password

# Redis (for job queue)
REDIS_URL="redis://localhost:6379"

# Twilio SMS/WhatsApp
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_SMS_FROM=+1234567890
TWILIO_WHATSAPP_FROM=+1234567890
```

---

## 💾 Database Setup

### Create PostgreSQL Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE smartbooking;
CREATE DATABASE smartbooking_notifications;

# Exit psql
\q
```

### Apply Entity Framework Migrations

```bash
cd SmartBooking.API

# Add migrations (if needed)
dotnet ef migrations add InitialCreate

# Update database
dotnet ef database update

cd ..
```

---

## 🖥️ Backend Setup

### Run ASP.NET Core API

```bash
cd SmartBooking.API
dotnet run
```

**Expected Output:**
```
info: Microsoft.Hosting.Lifetime[14]
      Now listening on: https://localhost:5001
      Now listening on: http://localhost:5000
```

**API will be available at:**
- HTTP: `http://localhost:5000`
- HTTPS: `https://localhost:5001`
- Swagger UI: `http://localhost:5000/swagger/index.html`

### Common Issues

| Issue | Solution |
|-------|----------|
| Port 5000 already in use | Change port in `launchSettings.json` or kill the process |
| Database connection failed | Verify PostgreSQL is running and credentials in `appsettings.json` are correct |
| Migrations failed | Run `dotnet ef database drop` then `dotnet ef database update` |

---

## 🎨 Frontend Setup

### Run React Development Server

```bash
cd frontend
npm run dev
```

**Expected Output:**
```
  VITE v8.0.12  ready in 1234 ms

  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

**Frontend will be available at:** `http://localhost:5173`

### Build for Production

```bash
npm run build
npm run preview
```

---

## 📡 API Documentation

### Swagger UI

Once the backend is running, access the interactive API documentation:

```
http://localhost:5000/swagger/index.html
```

### Key Endpoint Groups

#### Authentication
```
POST /api/Auth/register
POST /api/Auth/login
```

#### Bookings
```
GET    /api/Bookings
POST   /api/Bookings
GET    /api/Bookings/{id}
PUT    /api/Bookings/{id}
PATCH  /api/Bookings/{id}/status
DELETE /api/Bookings/{id}
```

#### Offers
```
GET    /api/Offers
POST   /api/Offers
GET    /api/Offers/{id}
PUT    /api/Offers/{id}
DELETE /api/Offers/{id}
```

#### Slots
```
GET    /api/Slots
POST   /api/Slots
PUT    /api/Slots/{id}
DELETE /api/Slots/{id}
```

---

## 🗄️ Database Schema

The SmartBooking platform uses a relational PostgreSQL database with the following core entities:

### Entity Relationships

```
┌─────────────┐
│    User     │
└──────┬──────┘
       │
       ├─────────────────┬──────────────┐
       │                 │              │
    ┌──▼───────────┐ ┌───▼────────┐ ┌──▼────────┐
    │   Business   │ │   Booking  │ │ BookingStatus
    └──┬───────────┘ └───┬────────┘ └───────────┘
       │                 │
    ┌──▼───────┐      ┌──▼──────────┐
    │  Offer   │      │ Notification│
    └──┬───────┘      └──────────────┘
       │
    ┌──▼──────────┐
    │ OfferSlot   │
    └─────────────┘
```

### Core Tables

**Users** - User accounts and authentication
- id, email, password_hash, role, created_at

**Businesses** - Business profiles
- id, user_id, name, logo_url, description, created_at

**Offers** - Service offerings
- id, business_id, title, description, price, capacity, status, created_at

**OfferSlots** - Availability slots
- id, offer_id, start_time, end_time, capacity, booked_count

**Bookings** - Customer bookings
- id, user_id, offer_id, slot_id, status, created_at

---

## 🤝 Contributing

We welcome contributions! Here's how to contribute:

1. **Fork the repository**
   ```bash
   git clone https://github.com/YOUR-USERNAME/SmartBooking.git
   ```

2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```

3. **Make your changes and commit**
   ```bash
   git add .
   git commit -m "Add amazing feature"
   ```

4. **Push to your fork**
   ```bash
   git push origin feature/amazing-feature
   ```

5. **Open a Pull Request**

### Code Style Guidelines
- Use meaningful commit messages
- Follow existing code conventions
- Add comments for complex logic
- Test your changes before submitting

---

## 📝 License

This project is licensed under the **MIT License** - see the LICENSE file for details.

---

## 👨‍💻 Authors

- **Sakshi Mittal** - Full-Stack Developer
- **GitHub:** [@mittalsaks](https://github.com/mittalsaks)

---

## 🙏 Acknowledgments

- Built with ❤️ for the hackathon
- Special thanks to the open-source community
- Inspired by modern booking platforms like Calendly and Stripe

---

<div align="center">

**⭐ If you found this helpful, please star the repository!**

[View on GitHub](https://github.com/mittalsaks/SmartBooking) | [Live Demo](https://smartbooking-demo.com)

</div>
