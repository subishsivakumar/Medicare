# MediCare — Modern Healthcare & Doctor Appointment Platform

**MediCare** is a modern, responsive, full-stack medical healthcare web application built with **React**, **Vite**, **React Router**, and **CSS3**. It provides a real-world startup-grade UI for patients to find doctors, explore medical departments, book clinical appointments, and manage healthcare records.

---

## 🌟 Key Features

### 1. Public Portal
- **Hero Section**: Modern clinical visual, instant statistics, and direct CTA actions.
- **Quick Services**: 1-click access to Doctor search, Booking, Departments, and Pharmacy.
- **Why Choose MediCare**: 4 core healthcare excellence value cards.
- **Doctor Directory (`/doctors`)**: Real-time filtering by name, medical specialization (Cardiologist, Dermatologist, Pediatrician, Orthopedic, Neurologist, Dentist, General Physician), and same-day availability.
- **Doctor Profile (`/doctors/:id`)**: Comprehensive qualifications, hospital affiliation, patient reviews, fee breakdown, available days, and interactive time slot scheduler.
- **Appointment Booking (`/appointments`)**: Live doctor selection, dynamic time slot picker, real-time appointment summary review, and instant confirmation receipt with local persistence.
- **Services Page (`/services`)**: Clinical care departments with interactive modal dialogs detailing procedures, inclusions, and starting prices.
- **About Page (`/about`)**: Platform mission, vision, clinical values, and impact statistics.
- **Contact Page (`/contact`)**: Clinical inquiry form, direct emergency helpline contacts, and campus location card.

### 2. User Dashboards
- **Patient Dashboard (`/patient/dashboard`)**:
  - Upcoming appointments & past consultation history.
  - Appointment cancellation and reschedule tracking.
  - Health profile editor (Blood group, emergency contacts, date of birth, address).
  - Notification and privacy settings.
- **Doctor Dashboard (`/doctor/dashboard`)**:
  - Daily consultation schedule and appointment statistics.
  - Actionable pending requests with **Accept** and **Reject** buttons.
  - Status updater to mark visits as **Completed**.
  - Interactive schedule & working hours availability manager.
- **Admin Dashboard (`/admin/dashboard`)**:
  - System-wide metrics (Total Patients, Doctors, Appointments, Completion rate).
  - Centralized management tables for Doctors, Patients, Appointments, and Services.
  - Modal to onboard and register new doctors.

### 3. Quick Role Switcher
- The top navigation bar includes an embedded **Quick Role Switcher** (`Guest`, `Patient View`, `Doctor View`, `Admin View`), allowing instant switching between portals for evaluation.

---

## 🏗️ Architecture & Technology Stack

- **Frontend**: React 18, Vite, React Router v6, Lucide React icons.
- **Design System**: Vanilla CSS tokens in `src/styles/index.css` (custom clinical color palette, clean typography using Google Fonts *Plus Jakarta Sans* & *Inter*, responsive layouts).
- **Backend Readiness**: Designed for **Java Spring Boot REST APIs** (`/api/doctors`, `/api/appointments`, `/api/auth`).
- **Database Preparation**: Configured for **MySQL 8.0** through Spring Data JPA entities.

### Project Structure
```
medicare-frontend/
├── src/
│   ├── assets/              # Static media
│   ├── components/
│   │   ├── cards/           # DoctorCard, ServiceCard, AppointmentCard, DashboardCard
│   │   ├── common/          # Navbar, Footer, Button, FormInput, Modal, SearchBar
│   ├── context/             # AuthContext (session state & role management)
│   ├── data/                # Realistic mock data (Doctors, Services, Appointments, Users)
│   ├── layouts/             # RootLayout and DashboardLayout
│   ├── pages/
│   │   ├── admin/           # AdminDashboard.jsx
│   │   ├── doctor/          # DoctorDashboard.jsx
│   │   ├── patient/         # PatientDashboard.jsx
│   │   ├── About.jsx
│   │   ├── Appointments.jsx
│   │   ├── Contact.jsx
│   │   ├── DoctorProfile.jsx
│   │   ├── Doctors.jsx
│   │   ├── Home.jsx
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   └── Services.jsx
│   ├── services/            # Spring Boot REST API service layers (apiClient, doctorService, etc.)
│   ├── styles/              # CSS design system and page-specific stylesheets
│   ├── App.jsx              # Main routing hub
│   └── main.jsx             # Entry point
├── index.html
├── package.json
└── vite.config.js
```

---

## 🚀 How to Run Locally

1. **Ensure Node.js is in your environment** (Node 18+ or Node 20+).
2. **Start the development server**:
   ```bash
   npm run dev
   ```
3. Open your browser and navigate to:
   ```
   http://127.0.0.1:5173/
   ```
4. **To build for production**:
   ```bash
   npm run build
   ```

---

## 🔌 Connecting to Java Spring Boot & MySQL

The application is structured so connecting to your Spring Boot REST backend is straightforward:

1. Open `src/services/apiClient.js`.
2. Set:
   ```javascript
   export const USE_MOCK_DATA = false;
   ```
   Or set `VITE_USE_MOCK=false` in a `.env` file.
3. Your Spring Boot controllers should expose:
   - `GET /api/doctors` — List doctors with filter parameters
   - `GET /api/doctors/{id}` — Get single doctor profile
   - `GET /api/appointments` — List appointments
   - `POST /api/appointments` — Create new appointment
   - `PATCH /api/appointments/{id}/status` — Update appointment status (`Confirmed`, `Rejected`, `Completed`)
   - `POST /api/auth/login` — Authenticate and return JWT token
   - `POST /api/auth/register` — Create patient or doctor user account

---

## 🔑 Demo Login Credentials

For quick evaluation, you can use the one-click demo buttons on `/login` or enter:
- **Patient**: `patient@medicare.com` / Password: `Patient@123`
- **Doctor**: `doctor@medicare.com` / Password: `Doctor@123`
- **Admin**: `admin@medicare.com` / Password: `Admin@123`
