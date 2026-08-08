# DoctorOS - AI-Powered Clinic Operating System

DoctorOS is an intelligent, multi-tenant Clinic Operating System designed to automate repetitive administrative workflows for clinic receptionists, empower doctors with an AI consultation scribe and pre-consultation patient workspace, and handle automated post-consultation patient follow-ups.

---

## 🚀 Key Features & Modules

- **🤖 AI Front Desk & Voice Receptionist**: Handles patient inquiries, slot checking, appointment bookings, and rescheduling via PSTN Voice and WhatsApp using deterministic tool calling.
- **🎙️ AI Consultation Scribe**: Converts doctor-patient conversation audio into structured SOAP draft notes and recommended prescriptions.
- **👨‍⚕️ Doctor Workspace**: Provides pre-consultation AI patient summaries, historical timelines, and single-click prescription review and approval.
- **📱 Automated Follow-up Engine**: Schedules 3-day recovery check-ins on WhatsApp and automatically triages replies into `IMPROVING`, `NEEDS_REVIEW` (Doctor Task), or `EMERGENCY`.
- **📊 Clinic Analytics & Reception Queue**: Real-time metrics tracking patient volume, no-show rates, revenue, and AI handle rates.
- **🔒 Multi-Tenant SaaS & DPDP Compliance**: Built with database-level `tenant_id` isolation, role-based access control (RBAC), immutable audit logging, and DPDP 2023 data protection standards.

---

## 🛠️ Project Structure

```
.
├── backend/
│   ├── src/
│   │   ├── db/
│   │   │   └── doctoros_schema.sql       # Multi-tenant PostgreSQL database schema
│   │   ├── services/
│   │   │   ├── toolRegistry.js            # Deterministic AI Tool Calling definitions
│   │   │   ├── orchestratorService.js     # AI Front Desk Voice/WA Orchestrator
│   │   │   ├── scribeService.js           # AI Consultation Scribe SOAP generator
│   │   │   └── followupEngine.js          # Follow-up check-in & triage engine
│   │   └── server.js                      # Express API Server & DoctorOS Endpoints
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── features/
│   │   │   └── doctoros/
│   │   │       ├── DoctorOSWorkspace.jsx  # Main DoctorOS UI Component
│   │   │       └── DoctorOSWorkspace.css  # Modern dark-mode styling
│   │   └── App.jsx
│   └── package.json
└── README.md
```

---

## 💻 Getting Started

### 1. Backend Setup
```bash
cd backend
npm install
npm run dev
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

---

## 📜 Database Setup
Run the SQL schema in `backend/src/db/doctoros_schema.sql` on your PostgreSQL or Supabase SQL Editor.
