# 🚀 SmartBooking - Advanced Notification Service Platform

<div align="center">
  <img src="./frontend/public/logo.png" alt="SmartBooking Logo" width="220"/>
  <br/>
  
  [![Frontend Deployment](https://img.shields.io/badge/Deployment-Vercel-blue?style=for-the-badge&logo=vercel)](https://smart-booking-dun-pi.vercel.app/)
  [![Backend Service](https://img.shields.io/badge/API-Render-green?style=for-the-badge&logo=render)](https://smartbooking-pmww.onrender.com)
</div>

<br/>

SmartBooking is an enterprise-grade, full-stack scheduling ecosystem and real-time notification engine. Designed with a sleek, high-performance glassmorphism interface, it allows businesses to dynamically deploy service offers, manage customer capacity, and instantly broadcast transactional notifications.

## 🔗 Live Deployments
* **⚡ Production Frontend Portal:** [SmartBooking Client UI](https://smart-booking-dun-pi.vercel.app/)
* **⚙️ Production Core API Gateway:** [SmartBooking API Hub](https://smartbooking-pmww.onrender.com)

---

## 📸 Deep-Dive Feature Walkthrough & UI Showcase

### 1. 📊 Executive Admin Analytics Dashboard
![Admin Dashboard](./images/frontend%20images/Dashboard%20(2).png)
**Real-time Metrics Aggregator:** Instantly monitors critical business indicators including Total Revenue Generated, Total Booking Inflow, and Active Marketing Offers in a Glassmorphic Command Center.

### 2. 🏷️ Dynamic Active Deals & Cloudinary Asset Control
![Offer Management](./images/frontend%20images/ActiveDeals.png)
**Persistent Media Pipeline:** Integrates natively with the Cloudinary API to guarantee that user-uploaded high-resolution offer banners remain online permanently.

### 3. 📅 Frictionless Customer Booking Engine & Advanced Filtering
![Explore Deals](./images/frontend%20images/ExploreDeals.png)
**Live Countdown Clocks:** Integrated micro-timers display real-time hour/minute/second ticks for active sales, creating a psychological sense of urgency.

---

## 🏗️ Technical Architecture & Ecosystem

```text
[ React 19 Frontend Client ] 
       │ (Secured Axios TLS Requests & Local JWT Validation)
       ▼
[ ASP.NET Core 8 Web API Gateway ]
       │
       ├─► [ PostgreSQL Relational Cluster ] ———► (Persistent App Data)
       ├─► [ Cloudinary Image Content CDN ] ———► (Permanent Asset Storage)
       └─► [ Google SMTP Mail Server Engine ] ──► (Instant Automated Notifications)