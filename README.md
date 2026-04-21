# 🏠 Green Home Properties | Server-Side

The robust backend engine for **Green Home Properties**, a full-stack responsive property booking platform.  
This API handles secure authentication, property lifecycle management, booking operations, and role-based access control.

---

## 🚀 Live Links

🔗 **Live API:** [View Live](https://green-home-server-side.vercel.app/)  
🔗 **Frontend Repository:** [View Repository](https://github.com/shoieb-dev/green-home-client-side)

---

## 📖 Table of Contents

- [Features](#features)  
- [Tech Stack](#tech-stack)  
- [Architecture](#architecture)  
- [API Endpoints](#api-endpoints)  
- [Security & Optimization](#security)

---

## 📌 Features <a id="features"></a>

### 🔐 Authentication & Authorization
- JWT-based authentication system  
- Google Sign-In integration (Firebase Admin)  
- Role-Based Access Control (RBAC) for Users & Admins  

---

### 🏢 Property & Booking Management
- Apartment CRUD operations (Admin only)  
- Booking system with user-specific data handling  
- Users can manage their booking history  
- Review system with dynamic homepage display  

---

## ⚙️ Tech Stack <a id="tech-stack"></a>

| Category      | Tools                          |
|--------------|-------------------------------|
| Runtime       | Node.js                        |
| Framework     | Express.js                     |
| Database      | MongoDB (Mongoose)             |
| Authentication| JWT & Firebase Admin           |
| Middleware    | CORS, dotenv, cookie-parser    |

---

## 🏗️ Architecture <a id="architecture"></a>

The project follows a **Modular MVC (Model-View-Controller)** pattern for scalability and maintainability.

---

## 🔑 API Endpoints <a id="api-endpoints"></a>

### 🛡️ Authentication
| Method | Endpoint            | Description                     |
|--------|--------------------|---------------------------------|
| POST   | /api/auth/login    | Authenticate user & return JWT |

---

### 🏠 Apartments
| Method | Endpoint                | Access  |
|--------|------------------------|---------|
| GET    | /api/apartments        | Public  |
| POST   | /api/apartments        | Admin   |
| DELETE | /api/apartments/:id    | Admin   |

---

### 📅 Bookings
| Method | Endpoint           | Access      |
|--------|--------------------|-------------|
| POST   | /api/bookings      | User        |
| GET    | /api/bookings      | User/Admin  |

---

### ⭐ Reviews
| Method | Endpoint           | Access |
|--------|--------------------|--------|
| POST   | /api/reviews       | User   |
| GET    | /api/reviews       | Public |

---

## 🔐 Security & Optimization <a id="security"></a>

To ensure the safety and performance of the system:

- ✅ JWT verification for protected routes  
- ✅ Helmet.js for secure HTTP headers  
- ✅ MongoDB sanitization (NoSQL injection protection)  
- ✅ Rate limiting to prevent abuse and brute-force attacks  

---
