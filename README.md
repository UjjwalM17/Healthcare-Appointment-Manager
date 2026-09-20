# 🏥 Healthcare Appointment & AI Clinical Triage Manager

[![Java](https://img.shields.io/badge/Java-17-orange.svg)](https://www.oracle.com/java/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-4.1.0-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18.x-61dafb.svg)](https://react.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-18-blue.svg)](https://www.postgresql.org/)
[![Groq AI](https://img.shields.io/badge/Groq%20AI-GPT--OSS--20B-purple.svg)](https://groq.com/)
[![Google Calendar](https://img.shields.io/badge/Google%20Calendar-v3%20API-4285F4.svg)](https://developers.google.com/calendar)
[![Brevo](https://img.shields.io/badge/Brevo-Email%20API-0092FF.svg)](https://www.brevo.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

An enterprise-grade, full-stack healthcare management platform engineered to eliminate clinical bottlenecks, prevent scheduling conflicts, and deliver automated diagnostic preparation. Built with **Spring Boot 4**, **React**, **PostgreSQL**, and powered by **Groq Cloud LLMs**, **Google Calendar API**, and **Brevo Transactional Email**.

---

## 👨‍💻 Author & Repository

* **Developer**: Ujjwal Manocha
* **GitHub**: [@UjjwalM17](https://github.com/UjjwalM17)
* **Repository**: [Healthcare-Appointment-Manager](https://github.com/UjjwalM17/Healthcare-Appointment-Manager)
* **Backend Production API**: `https://healthcare-appointment-manager-2-wnyt.onrender.com`

---

## 📌 Problem Statement & Solution

### The Challenge
Traditional healthcare booking systems suffer from critical operational inefficiencies:
1. **Administrative Overload & Double-Booking**: Manual slot management frequently causes overlapping appointments and doctor schedule conflicts.
2. **Unprepared Consultations**: Doctors meet patients without prior clinical triage, spending 30–50% of the consultation extracting basic symptom history.
3. **Fragmented Communication**: Appointments exist in isolated databases without syncing to personal schedules or delivering reliable transactional notifications.

### The Solution
The **Healthcare Appointment Manager** solves these issues through an end-to-end automated platform:
* **Real-time Slot Booking**: Conflict-free slot reservation powered by PostgreSQL partial unique indexes.
* **AI Clinical Pre-Visit Triage**: Real-time analysis of patient symptoms using Groq LLMs (`openai/gpt-oss-20b`) to classify urgency (Low/Medium/High/Emergency), extract chief complaints, and generate 3 targeted diagnostic questions for the physician.
* **Doctor Calendar Sync**: Automated server-to-server synchronization with Google Calendar via Service Account.
* **Transactional Notifications**: Instant styled HTML booking confirmations and doctor alerts dispatched via Brevo REST API.
* **Post-Visit Patient Summaries**: Doctors enter clinical notes; AI converts complex medical jargon into plain-language instructions with medication schedules and lifestyle advice.

---

## 🏛️ System Architecture

```
                                  +---------------------------------------+
                                  |     React / Vite Client (Vercel)      |
                                  |  (Patient, Doctor, Admin Dashboards)  |
                                  +---------------------------------------+
                                                      |
                                           HTTPS / REST (JWT Auth)
                                                      v
                                  +---------------------------------------+
                                  |    Spring Boot 4.1.0 Backend (Render) |
                                  |     - Spring Security & JWT Filter    |
                                  |     - Slot & Booking Service          |
                                  |     - Spring Data JPA / Hibernate     |
                                  +---------------------------------------+
                                     /             |             \
            +-----------------------+              |              +-----------------------+
            |                                      |                                      |
            v                                      v                                      v
+------------------------+      +------------------------+      +-------------------------------+
|  PostgreSQL Database   |      |    Groq Cloud LLM      |      |  Cloud Notification Pipeline  |
|  - Managed on Render   |      |  - openai/gpt-oss-20b  |      |  - Google Calendar v3 API     |
|  - Relational Schema   |      |  - Triage & Summaries  |      |  - Brevo Transactional Email  |
+------------------------+      +------------------------+      +-------------------------------+
```

---

## 🚀 Key Features

### 1. Patient Portal
* **Doctor Discovery**: Filter physicians by medical specialization (Cardiology, Dermatology, Neurology, etc.).
* **Live Slot Reservation**: Select available dates and dynamically generated 30-minute time slots.
* **Symptom Reporting**: Describe ailments in advance to initiate automated pre-visit triage.
* **Appointment Tracking**: View status (`CONFIRMED`, `PENDING`, `CANCELLED`) and doctor's post-visit instructions.

### 2. Doctor Portal
* **Schedule Management**: Set working hours and slot durations.
* **Leave Management**: Mark leave dates to automatically block appointment bookings.
* **Pre-Visit Clinical Intelligence**: Review AI-generated urgency rating, chief complaint, and recommended diagnostic questions prior to patient consultation.
* **Consultation Notes & Prescriptions**: Submit clinical findings and generate patient-friendly summaries.

### 3. Administrator Portal
* **Practitioner Onboarding**: Create and manage doctor profiles and specialties.
* **System Monitoring**: View all registered patients, active appointments, and clinic analytics.

### 4. Advanced Integrations
* **Groq AI Engine**: Sub-second LLM inference with automatic fallback chains across multiple candidate models (`openai/gpt-oss-20b`, `openai/gpt-oss-120b`, `qwen/qwen3.8-27b`).
* **Google Calendar Service Account**: Seamless event insertion with automatic fallback for service-account attendee constraints.
* **Brevo Transactional Email**: High-deliverability HTML cards for booking confirmations, cancellations, and doctor notifications.

---

## 🛠️ Technology Stack

| Layer | Technology | Details |
| :--- | :--- | :--- |
| **Backend Framework** | Java 17 / Spring Boot 4.1.0 | REST API, Spring Security, Spring Data JPA |
| **Authentication** | JWT (`jjwt-api 0.12.6`) | Stateless Bearer token authentication & BCrypt hashing |
| **Database** | PostgreSQL 18 | Hosted on Render with custom partial indexes |
| **AI / LLM** | Groq Cloud API | `openai/gpt-oss-20b` with multi-model fallback |
| **Calendar Sync** | Google Calendar API v3 | Google Cloud Service Account (Server-to-Server) |
| **Email Service** | Brevo REST API v3 | Transactional SMTP API with responsive HTML templates |
| **Frontend** | React 18, Vite, Axios | Tailwind CSS, responsive single-page architecture |
| **Deployment** | Render & Vercel | Render (Spring Boot & PostgreSQL), Vercel (React Frontend) |

---

## 📂 Project Structure

```
Healthcare-Appointment-Manager/
├── health/                               # Spring Boot Backend Application
│   ├── src/main/java/com/navneet/health/
│   │   ├── config/                       # Security, JWT, CORS, Google Calendar configs
│   │   ├── controller/                   # REST Endpoints (Auth, Doctor, Appointment, Admin)
│   │   ├── dto/                          # Data Transfer Objects (Groq, Auth, Requests)
│   │   ├── entity/                       # JPA Entities (User, Doctor, Appointment, etc.)
│   │   ├── repository/                   # Spring Data JPA Repositories
│   │   └── service/                      # Business Services (AiService, CalenderService, EmailService)
│   ├── src/main/resources/
│   │   ├── application.properties        # Application configuration & secrets
│   │   └── service-account.json          # Google Cloud Service Account credentials
│   └── pom.xml                           # Maven dependencies
├── frontend/                             # React / Vite Frontend Application
│   ├── src/
│   │   ├── components/                   # Reusable UI components
│   │   ├── pages/                        # Patient, Doctor, Admin dashboards & Auth views
│   │   └── services/                     # Axios API integration
│   ├── package.json                      # Frontend dependencies
│   └── vite.config.js                    # Vite build configuration
└── README.md                             # Project documentation
```

---

## ⚙️ Local Development Setup

### 1. Prerequisites
* **JDK 17+** installed
* **Maven 3.8+** installed
* **Node.js 18+** & npm installed
* **PostgreSQL 15+** running locally or in cloud

### 2. Database Configuration
Create the PostgreSQL database:
```sql
CREATE DATABASE healthdb;
```

Run the partial unique index to guarantee double-booking prevention:
```sql
CREATE UNIQUE INDEX uq_doctor_slot_active
ON appointment (doctor_id, appointment_date, appointment_time)
WHERE status <> 'CANCELLED';
```

### 3. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd health
   ```
2. Configure environment variables or edit `src/main/resources/application.properties`:
   ```properties
   # Database Configuration
   spring.datasource.url=jdbc:postgresql://localhost:5432/healthdb
   spring.datasource.username=postgres
   spring.datasource.password=your_password
   spring.jpa.hibernate.ddl-auto=update

   # Server Port
   server.port=8081

   # JWT Security
   jwt.secret=your_base64_or_hex_jwt_secret_key_minimum_256_bits
   jwt.expiration=86400000

   # Groq AI Service
   groq.api.key=your_groq_api_key
   groq.api.url=https://api.groq.com/openai/v1/chat/completions
   groq.model=openai/gpt-oss-20b

   # Brevo Email Service
   brevo.api.key=your_brevo_api_key
   brevo.from.email=your_verified_brevo_email@domain.com
   brevo.from.name=Healthcare Appointment Manager

   # Google Calendar Service Account
   google.calendar.service-account.json={"type":"service_account",...}
   google.calendar.calendar-id=your_doctor_calendar@gmail.com
   ```
3. Run the Spring Boot application:
   ```bash
   ./mvnw spring-boot:run
   ```
   Backend will start at `http://localhost:8081`.

### 4. Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   Frontend will start at `http://localhost:5173`.

---

## 📡 API Reference

### Authentication (`/api/auth`)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register a new user (`PATIENT`, `DOCTOR`, `ADMIN`) | Public |
| `POST` | `/api/auth/login` | Authenticate credentials and return JWT token | Public |

### Doctors & Scheduling (`/api/doctors`, `/api/admin/doctors`)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/doctors` | List doctors, filterable by `?specialization=` | Authenticated |
| `GET` | `/api/doctors/{id}/slots?date=YYYY-MM-DD` | Get available 30-min slots for a specific date | Authenticated |
| `POST` | `/api/admin/doctors` | Create doctor profile with working hours | `ADMIN` |
| `POST` | `/api/admin/doctors/{id}/leave` | Register doctor leave date | `ADMIN` / `DOCTOR` |

### Appointments (`/api/appointments`)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/appointments/book` | Book slot, trigger AI triage, Calendar & Email sync | `PATIENT` |
| `GET` | `/api/appointments/patient/{id}` | Retrieve patient appointment history | `PATIENT` |
| `GET` | `/api/appointments/doctor/{id}` | Retrieve doctor appointment queue with AI triage | `DOCTOR` |
| `PUT` | `/api/appointments/{id}/cancel` | Cancel appointment and notify both parties | Authenticated |
| `PUT` | `/api/appointments/{id}/notes` | Submit doctor notes & trigger AI post-visit summary | `DOCTOR` |

---

## 💡 Engineering Highlights & Problem Solving

1. **Resilient Google Calendar Synchronization**:
   Standard Google Cloud Service Accounts cannot invite external attendees without Google Workspace Domain-Wide Delegation (returning `403 Forbidden`). Our `CalenderService` implements an automatic fallback mechanism: if attendee invitation is restricted, it seamlessly injects the event directly into the target calendar with patient details embedded in the title and description, ensuring zero downtime.

2. **Fault-Tolerant AI Triage Chain**:
   To prevent single-point-of-failure issues caused by cloud LLM deprecations or rate limits, `AiService` incorporates an automated candidate fallback chain (`openai/gpt-oss-20b` $\rightarrow$ `openai/gpt-oss-120b` $\rightarrow$ `qwen/qwen3.8-27b`). If a model is deprecated or unreachable, the system automatically switches models without failing the booking.

3. **Double-Booking Prevention at Database Level**:
   Concurrency conflicts are guarded against by combining Spring JPA transactional checks with a PostgreSQL partial unique index:
   ```sql
   CREATE UNIQUE INDEX uq_doctor_slot_active
   ON appointment (doctor_id, appointment_date, appointment_time)
   WHERE status <> 'CANCELLED';
   ```
   This guarantees that even under simultaneous concurrent booking requests, double-booking is physically impossible at the database engine level.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
