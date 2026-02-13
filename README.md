# 🏥 CareBook AI - Smart Healthcare Scheduling Portal

CareBook AI is a full-stack healthcare member portal that enables online self-service appointment scheduling. Members can search providers, view availability, book appointments, and manage their healthcare visits — all powered by AI-assisted intent parsing.

## 📋 Table of Contents

- [Business Problem](#business-problem)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [API Endpoints](#api-endpoints)
- [Screenshots](#screenshots)

## 🎯 Business Problem

Members must call providers to schedule appointments, causing long call times and poor user experience. CareBook AI solves this by providing an intelligent self-service booking portal.

## ✨ Features

### Core Features
- **Provider Search** - Search providers by name, specialty, or location
- **Book Appointments** - Interactive calendar with real-time availability for the next 90 days
- **Appointment Types** - 10 different appointment types (Annual Physical, Sick Visit, etc.)
- **Interpreter Support** - Request interpreters in 10+ languages
- **Confirmation System** - Unique confirmation number generation (CB-XXXXXXXX format)
- **Notifications** - Simulated email/SMS appointment confirmations
- **Cancel & Reschedule** - Full appointment management with reason tracking
- **Input Validation** - Comprehensive client & server-side validation
- **AI Intent Parser** - Describe symptoms → get appointment type suggestions

### Technical Features
- Error handling with user-friendly messages
- Loading states on all async operations
- Mobile responsive design
- Professional UI with glassmorphism and micro-animations
- RESTful API architecture
- SQLite database with proper indexes and foreign keys
- Transaction-based booking to prevent double bookings

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Router 7 |
| Styling | Tailwind CSS 3 |
| Backend | Node.js, Express 4 |
| Database | SQLite (better-sqlite3) |
| Build Tool | Vite 6 |
| AI Feature | Custom NLP intent parser (mock) |

## 📁 Project Structure

```
carebook-ai/
├── backend/
│   ├── src/
│   │   ├── db/
│   │   │   ├── database.js      # Database connection & init
│   │   │   ├── schema.sql       # Table definitions
│   │   │   └── seed.js          # Sample data (8 providers, 10 types, 90 days of slots)
│   │   ├── routes/
│   │   │   ├── providers.js     # Provider search & details
│   │   │   ├── appointments.js  # CRUD for appointments
│   │   │   ├── appointmentTypes.js  # Appointment type listing
│   │   │   └── ai.js            # AI intent parser
│   │   ├── middleware/
│   │   │   └── validation.js    # Express-validator rules
│   │   └── utils/
│   │       └── helpers.js       # Confirmation numbers, notifications
│   ├── server.js                # Express server entry
│   ├── package.json
│   └── .env                     # Environment variables
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx       # Sticky navigation with glassmorphism
│   │   │   ├── Footer.jsx       # Site footer
│   │   │   ├── ProviderCard.jsx # Provider listing card
│   │   │   ├── ConfirmationModal.jsx  # Booking success modal
│   │   │   ├── LoadingSpinner.jsx     # Animated spinner
│   │   │   └── ErrorMessage.jsx       # Error display
│   │   ├── pages/
│   │   │   ├── HomePage.jsx     # Landing page + AI assistant
│   │   │   ├── SearchProviders.jsx    # Provider search & filter
│   │   │   ├── BookAppointment.jsx    # Calendar + booking form
│   │   │   ├── MyAppointments.jsx     # Appointment lookup
│   │   │   └── AppointmentDetails.jsx # View/cancel/reschedule
│   │   ├── services/
│   │   │   └── api.js           # API client functions
│   │   ├── App.jsx              # Router setup
│   │   ├── main.jsx             # React entry
│   │   └── index.css            # Tailwind + design system
│   ├── index.html               # HTML template
│   ├── vite.config.js           # Vite + proxy config
│   ├── tailwind.config.js       # Custom theme
│   ├── postcss.config.js
│   └── package.json
├── .gitignore
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- **Node.js** 18+ installed
- **npm** 9+ installed

### Installation & Running

#### 1. Clone the repository
```bash
cd carebook-ai
```

#### 2. Start the Backend
```bash
cd backend
npm install
npm run dev
```
The backend server starts at **http://localhost:5000**. The database is auto-created and seeded on first run.

#### 3. Start the Frontend (new terminal)
```bash
cd frontend
npm install
npm run dev
```
The frontend starts at **http://localhost:5173** with API proxy to the backend.

#### 4. Open in Browser
Navigate to **http://localhost:5173** to use the app.

## 📡 API Endpoints

### Providers
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/providers` | List all providers (supports `?q=` and `?specialty=`) |
| GET | `/api/providers/specialties` | List unique specialties |
| GET | `/api/providers/:id` | Get provider details |
| GET | `/api/providers/:id/slots` | Get available time slots (`?date=` or `?month=`) |

### Appointments
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/appointments` | Book a new appointment |
| GET | `/api/appointments` | Get appointments by `?email=` or `?confirmation_number=` |
| GET | `/api/appointments/:id` | Get appointment details |
| PATCH | `/api/appointments/:id/cancel` | Cancel an appointment |
| PATCH | `/api/appointments/:id/reschedule` | Reschedule an appointment |

### AI
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/ai/suggest` | Get AI appointment type suggestions |

### Other
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/appointment-types` | List all appointment types |
| GET | `/api/health` | Health check |

## 🧪 Sample Seed Data

The database is seeded with:
- **8 providers** across specialties: Family Medicine, Cardiology, Dermatology, Orthopedics, Pediatrics, Internal Medicine, OB/GYN, Neurology
- **10 appointment types**: Annual Physical, Sick Visit, Follow-up, New Patient Consultation, Specialist Referral, Preventive Screening, Vaccination, Telehealth, Urgent Care, Lab Work
- **Time slots** for the next 90 weekdays with realistic availability

## 🔑 Environment Variables

### Backend (`.env`)
```
PORT=5000
NODE_ENV=development
DATABASE_PATH=./carebook.db
FRONTEND_URL=http://localhost:5173
```

## 📝 License

This project is part of a Capstone project for Indiana Wesleyan University MS 2024.

---

Built with ❤️ by CareBook AI Team
