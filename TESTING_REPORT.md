# 🧪 CareBook AI — Testing Report

**Project:** CareBook AI - Healthcare Member Portal  
**Version:** 1.0.0  
**Date:** February 16, 2026  
**Tester:** Development Team  
**Environment:** Windows 11 / Node.js v24.13.0 / Chrome latest

---

## 1. Executive Summary

CareBook AI underwent comprehensive functional, security, and UI/UX testing across all application features. The testing covered **105 test items** across 6 pages, 3 API route groups, and the full booking lifecycle. All critical and high-severity bugs were identified and resolved. The application is production-ready with all security measures implemented.

| Metric | Result |
|--------|--------|
| Total Test Cases | 105 |
| Passed | 105 |
| Failed (Fixed) | 7 |
| Blocked | 0 |
| Security Vulnerabilities Found | 7 |
| Security Vulnerabilities Fixed | 7 |

---

## 2. Testing Scope

### 2.1 In Scope
- Frontend UI functionality (React components, pages, navigation)
- Backend API endpoints (REST API, Express routes)
- Database operations (SQLite CRUD, transactions)
- Input validation (client-side and server-side)
- Security audit (OWASP Top 10 review)
- Responsive design (mobile, tablet, desktop)
- Error handling and loading states
- AI intent parser functionality

### 2.2 Out of Scope
- Load/performance testing at scale
- Penetration testing by third-party
- Real email/SMS delivery (notifications are simulated)
- Payment processing (not applicable)
- HIPAA compliance audit (would require formal certification)

---

## 3. Features Tested

### 3.1 Navigation & Layout

| # | Test Case | Status | Notes |
|---|-----------|--------|-------|
| 1 | CareBook AI logo navigates to Home | ✅ Pass | |
| 2 | "Find Providers" nav link | ✅ Pass | |
| 3 | "My Appointments" nav link | ✅ Pass | |
| 4 | "Book Now" button (navbar) | ✅ Pass | |
| 5 | Mobile hamburger menu toggle | ✅ Pass | |
| 6 | Mobile nav items close menu on click | ✅ Pass | |
| 7 | Sticky navbar with glassmorphism effect | ✅ Pass | |
| 8 | Footer renders on all pages | ✅ Pass | |

### 3.2 Home Page

| # | Test Case | Status | Notes |
|---|-----------|--------|-------|
| 9 | Hero section renders with CTA buttons | ✅ Pass | |
| 10 | "Find a Provider" button → /providers | ✅ Pass | |
| 11 | "View My Appointments" button → /appointments | ✅ Pass | |
| 12 | AI Assistant text input accepts input | ✅ Pass | |
| 13 | AI "Analyze" button triggers API call | ✅ Pass | |
| 14 | AI returns appointment type suggestions | ✅ Pass | Tested with "headaches and dizziness" |
| 15 | AI returns specialty recommendations | ✅ Pass | Correctly identified Neurology |
| 16 | AI confidence scores display (0-99%) | ✅ Pass | |
| 17 | AI disclaimer text visible | ✅ Pass | |
| 18 | Feature cards render (3 cards) | ✅ Pass | |
| 19 | Stats section displays correctly | ✅ Pass | |

### 3.3 Provider Search Page

| # | Test Case | Status | Notes |
|---|-----------|--------|-------|
| 20 | All 8 providers load on page open | ✅ Pass | |
| 21 | Search by provider name (text input) | ✅ Pass | |
| 22 | Filter by specialty dropdown | ✅ Pass | All 8 specialties available |
| 23 | "All Specialties" resets filter | ✅ Pass | |
| 24 | Search with no results shows empty state | ✅ Pass | |
| 25 | Provider card shows name, title | ✅ Pass | |
| 26 | Provider card shows specialty badge | ✅ Pass | |
| 27 | Provider card shows rating & review count | ✅ Pass | |
| 28 | Provider card shows location | ✅ Pass | |
| 29 | "Accepting New Patients" badge | ✅ Pass | |
| 30 | "Book Appointment" button → /book/:id | ✅ Pass | |
| 31 | Provider count text updates correctly | ✅ Pass | |
| 32 | Loading spinner during data fetch | ✅ Pass | |

### 3.4 Book Appointment Page

| # | Test Case | Status | Notes |
|---|-----------|--------|-------|
| 33 | Provider info header displays correctly | ✅ Pass | |
| 34 | Breadcrumb navigation back to providers | ✅ Pass | |
| 35 | Appointment type dropdown (10 types) | ✅ Pass | |
| 36 | Selected type shows duration | ✅ Pass | |
| 37 | Date selection loads time slots | ✅ Pass | |
| 38 | Time slot buttons highlight on selection | ✅ Pass | |
| 39 | First Name input — required validation | ✅ Pass | |
| 40 | Last Name input — required validation | ✅ Pass | |
| 41 | Email input — format validation | ✅ Pass | |
| 42 | Phone input — format validation | ✅ Pass | |
| 43 | Date of Birth input | ✅ Pass | |
| 44 | Reason for Visit textarea | ✅ Pass | |
| 45 | Interpreter checkbox toggles language dropdown | ✅ Pass | |
| 46 | Language dropdown (10+ options incl. ASL) | ✅ Pass | |
| 47 | Uncheck interpreter hides language dropdown | ✅ Pass | |
| 48 | Notification preference selector | ✅ Pass | |
| 49 | Submit with missing fields — validation errors | ✅ Pass | Server returns 400 |
| 50 | Submit without date/time — error message | ✅ Pass | |
| 51 | Successful booking — loading state | ✅ Pass | |
| 52 | Confirmation modal shows confirmation # | ✅ Pass | Format: CB-XXXXXXXX |
| 53 | Confirmation modal shows correct details | ✅ Pass | |
| 54 | "View Appointment" button in modal | ✅ Pass | |
| 55 | "Book Another" button in modal | ✅ Pass | |
| 56 | Double-booking same slot returns 409 error | ✅ Pass | Transactional safety works |

### 3.5 My Appointments Page

| # | Test Case | Status | Notes |
|---|-----------|--------|-------|
| 57 | "By Email" / "By Confirmation #" toggle | ✅ Pass | |
| 58 | Email search returns matching appointments | ✅ Pass | |
| 59 | Confirmation # search returns exact match | ✅ Pass | |
| 60 | "Look Up" button triggers search | ✅ Pass | |
| 61 | No results shows empty state | ✅ Pass | |
| 62 | "Book Your First Appointment" link | ✅ Pass | |
| 63 | Status badge — Confirmed (green) | ✅ Pass | |
| 64 | Status badge — Rescheduled (blue) | ✅ Pass | |
| 65 | Status badge — Cancelled (red) | ✅ Pass | |
| 66 | "Upcoming" tag for future appointments | ✅ Pass | |
| 67 | Appointment card displays all info | ✅ Pass | |
| 68 | Click card navigates to details | ✅ Pass | |
| 69 | Multiple appointments with same email | ✅ Pass | |

### 3.6 Appointment Details Page

| # | Test Case | Status | Notes |
|---|-----------|--------|-------|
| 70 | Breadcrumb navigation | ✅ Pass | |
| 71 | Confirmation number display | ✅ Pass | |
| 72 | Status badge with correct color | ✅ Pass | |
| 73 | Date displayed in readable format | ✅ Pass | |
| 74 | Time displayed in 12-hour format | ✅ Pass | |
| 75 | Visit type and duration display | ✅ Pass | |
| 76 | Location and address display | ✅ Pass | |
| 77 | Interpreter banner (when applicable) | ✅ Pass | |
| 78 | Reason for visit (when provided) | ✅ Pass | |
| 79 | Provider info card with avatar | ✅ Pass | |
| 80 | Patient info card | ✅ Pass | |
| 81 | Visit checklist (4 items) | ✅ Pass | |

### 3.7 Reschedule Flow

| # | Test Case | Status | Notes |
|---|-----------|--------|-------|
| 82 | "Reschedule" button opens section | ✅ Pass | |
| 83 | Date dropdown shows available dates | ✅ Pass | |
| 84 | Time slots load for selected date | ✅ Pass | |
| 85 | "Confirm Reschedule" updates appointment | ✅ Pass | Status → "Rescheduled" |
| 86 | Old time slot freed up after reschedule | ✅ Pass | Transactional |
| 87 | "Cancel" button closes reschedule section | ✅ Pass | |

### 3.8 Cancel Flow

| # | Test Case | Status | Notes |
|---|-----------|--------|-------|
| 88 | "Cancel Appointment" opens modal | ✅ Pass | |
| 89 | Cancel modal shows warning text | ✅ Pass | |
| 90 | Reason textarea (optional) | ✅ Pass | |
| 91 | "Yes, Cancel" confirms cancellation | ✅ Pass | Status → "Cancelled" |
| 92 | "Keep It" closes modal without change | ✅ Pass | |
| 93 | Cancelled state hides action buttons | ✅ Pass | |
| 94 | "Book New Appointment" link appears | ✅ Pass | |
| 95 | Cancelled slot becomes available again | ✅ Pass | Transactional |

### 3.9 Responsive Design

| # | Test Case | Status | Notes |
|---|-----------|--------|-------|
| 96 | Mobile (375px) — no horizontal scroll | ✅ Pass | |
| 97 | Tablet (768px) — grid adapts | ✅ Pass | |
| 98 | Desktop (1280px) — full layout | ✅ Pass | |
| 99 | Navigation collapses to hamburger | ✅ Pass | |
| 100 | Time slot grid wraps on mobile | ✅ Pass | |
| 101 | Cards stack vertically on mobile | ✅ Pass | |

### 3.10 Error Handling & Edge Cases

| # | Test Case | Status | Notes |
|---|-----------|--------|-------|
| 102 | Loading spinners on all async operations | ✅ Pass | |
| 103 | Backend down — error messages display | ✅ Pass | |
| 104 | Empty states render gracefully | ✅ Pass | |
| 105 | Render cold start (~30s) still works | ✅ Pass | Free tier behavior |

---

## 4. API Endpoint Testing

### 4.1 Provider Endpoints

| Method | Endpoint | Test | Status |
|--------|----------|------|--------|
| GET | `/api/providers` | Returns all 8 providers | ✅ Pass |
| GET | `/api/providers?q=sarah` | Search filter works | ✅ Pass |
| GET | `/api/providers?specialty=Cardiology` | Specialty filter works | ✅ Pass |
| GET | `/api/providers/specialties` | Returns 8 specialties | ✅ Pass |
| GET | `/api/providers/1` | Returns single provider | ✅ Pass |
| GET | `/api/providers/999` | Returns 404 | ✅ Pass |
| GET | `/api/providers/1/slots` | Returns grouped time slots | ✅ Pass |
| GET | `/api/health` | Returns status: ok | ✅ Pass |

### 4.2 Appointment Endpoints

| Method | Endpoint | Test | Status |
|--------|----------|------|--------|
| POST | `/api/appointments` | Books appointment with valid data | ✅ Pass |
| POST | `/api/appointments` | Rejects missing required fields | ✅ Pass |
| POST | `/api/appointments` | Rejects invalid email format | ✅ Pass |
| POST | `/api/appointments` | Rejects past dates | ✅ Pass |
| POST | `/api/appointments` | Returns 409 for unavailable slot | ✅ Pass |
| GET | `/api/appointments?email=...` | Returns appointments by email | ✅ Pass |
| GET | `/api/appointments?confirmation_number=...` | Returns by confirmation # | ✅ Pass |
| GET | `/api/appointments/1` | Returns appointment details | ✅ Pass |
| PATCH | `/api/appointments/1/cancel` | Cancels appointment | ✅ Pass |
| PATCH | `/api/appointments/1/cancel` | Rejects double-cancel | ✅ Pass |
| PATCH | `/api/appointments/1/reschedule` | Reschedules appointment | ✅ Pass |

### 4.3 AI Endpoint

| Method | Endpoint | Test | Status |
|--------|----------|------|--------|
| POST | `/api/ai/suggest` | Returns suggestions for symptoms | ✅ Pass |
| POST | `/api/ai/suggest` | Rejects empty description | ✅ Pass |
| POST | `/api/ai/suggest` | Rejects >1000 char input | ✅ Pass |
| POST | `/api/ai/suggest` | Strips HTML tags (security) | ✅ Pass |

---

## 5. Bugs Found & Fixed

| # | Bug Description | Severity | Root Cause | Fix Applied |
|---|----------------|----------|------------|-------------|
| 1 | `better-sqlite3` fails to install (no Visual Studio C++ tools) | 🔴 Critical | Native module requires build tools | Switched to `sql.js` (pure JS SQLite) |
| 2 | CORS allows all origins (else branch was permissive) | 🔴 Critical | Open CORS policy in else branch | Strict origin checking with 403 rejection |
| 3 | No rate limiting on any endpoints | 🔴 Critical | No middleware installed | Added `express-rate-limit` (100/10/20 tiers) |
| 4 | No HTTP security headers | 🔴 High | Missing `helmet` middleware | Added `helmet` for XSS, clickjack, MIME protection |
| 5 | User text inputs stored without sanitization | 🟡 Medium | No XSS prevention | Added `sanitizeText()` for HTML entity encoding |
| 6 | No request body size limit | 🟡 Medium | `express.json()` unlimited | Limited to `10kb` max payload |
| 7 | Error handler leaks stack traces | 🟡 Medium | `err.message` exposed in dev mode | Generic error messages in all environments |

---

## 6. Test Environment

| Component | Details |
|-----------|---------|
| **OS** | Windows 11 (Build 22631) |
| **Node.js** | v24.13.0 |
| **npm** | v10.x |
| **Browser** | Google Chrome (latest) |
| **Frontend URL** | https://main.d19si1wituug8p.amplifyapp.com |
| **Backend URL** | https://carebook-ai.onrender.com |
| **Database** | SQLite via sql.js (in-memory with disk persistence) |
| **Hosting** | AWS Amplify (frontend) + Render.com (backend) |

---

## 7. Conclusion

CareBook AI has passed all 105 test cases across functional, security, and responsive design categories. All 7 identified vulnerabilities have been resolved. The application is production-ready with proper input validation, security hardening, error handling, and responsive design implemented throughout.

---

*Report generated: February 16, 2026*  
*CareBook AI v1.0.0*
