# 🚀 SmartBooking - Notification Service Platform

<div align="center">
  <img src="./frontend/public/logo.png" alt="SmartBooking Logo" width="250"/>
</div>

<br/>

A modern, full-stack booking and real-time notification management system designed for seamless business operations.

## 🔗 Live Application
* **Frontend (User Interface):** [SmartBooking Portal](https://smart-booking-dun-pi.vercel.app/)
* **Backend (API Service):** [SmartBooking API](https://smartbooking-pmww.onrender.com)

---

## 📸 Project Showcase & Key Features

### 1. 📊 Dashboard
![Admin Dashboard](./images/frontend%20images/Dashboard%20(2).png)
**Real-time Business Insights:** The central command center for business owners. It provides live tracking of total bookings, generated revenue, and active offers. The modern dark-theme with glassmorphism UI ensures metrics are easy to read and visually engaging.

### 2. 🏷️ Active Deals & Offer Management
![Offer Management](./images/frontend%20images/ActiveDeals.png)
**Dynamic Business Control:** Admins can seamlessly create, pause, or update service offers on the fly. All service images are securely processed and permanently hosted via the **Cloudinary API**, ensuring no data loss during server restarts.

### 3. 📅 Customer Booking Experience
![Explore Deals](./images/frontend%20images/BookingPage.png)
**Seamless User Journey:** Customers can browse active services, view real-time availability slots, and book instantly. Every successful booking triggers the **Notification Engine**, sending an automated confirmation alert straight to the customer's email!

---

## 🛠️ Tech Stack Architecture
- **Backend Infrastructure:** ASP.NET Core 8 & PostgreSQL (Robust & Reliable Data Storage).
- **Frontend Interface:** React 19 + TypeScript + Tailwind CSS (Highly responsive UI).
- **Media Pipeline:** Cloudinary Integration (Persistent, cloud-based Image Hosting).
- **Notification Engine:** Gmail SMTP Integration (Automated Transactional Emails).
- **Interactive UX:** Framer Motion for buttery-smooth animations and state feedback.

---

## 🔐 Local Setup & Installation
1. **Clone the repository:** `git clone https://github.com/mittalsaks/SmartBooking.git`
2. **Environment Setup:** Add your `Cloudinary`, `JWT`, and `SMTP` credentials in your backend configuration (or Render Environment Variables).
3. **Run the Services:** - Backend: `dotnet run` 
   - Frontend: `npm run dev`

---

## 👨‍💻 Developed By
**Sakshi Mittal** | [GitHub: @mittalsaks](https://github.com/mittalsaks)

*Built with ❤️ for the Hackathon. Focused on clean architecture and scalable solutions.*
