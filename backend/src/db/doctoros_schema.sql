-- DoctorOS Multi-Tenant PostgreSQL Database Schema
-- Run this in your PostgreSQL or Supabase SQL Editor

-- 1. Clinics / Tenants
CREATE TABLE IF NOT EXISTS public.clinics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    address TEXT,
    timezone VARCHAR(50) DEFAULT 'Asia/Kolkata',
    opening_hours JSONB DEFAULT '{"mon_fri": "09:00 - 20:00", "sat": "09:00 - 18:00", "sun": "Closed"}'::jsonb,
    ai_config JSONB DEFAULT '{"greeting": "Welcome to ABC Clinic", "emergency_phone": "108"}'::jsonb,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Users & Authentication
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20) NOT NULL,
    password_hash VARCHAR(255),
    role VARCHAR(50) NOT NULL, -- 'OWNER', 'ADMIN', 'DOCTOR', 'RECEPTIONIST', 'PATIENT'
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_phone_per_tenant UNIQUE (tenant_id, phone)
);

-- 3. Doctor Profiles
CREATE TABLE IF NOT EXISTS public.doctors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    specialization VARCHAR(100) NOT NULL,
    qualification VARCHAR(100),
    registration_number VARCHAR(100) NOT NULL,
    consultation_fee NUMERIC(10, 2) DEFAULT 500.00,
    slot_duration_minutes INT DEFAULT 15,
    schedule_config JSONB DEFAULT '{"available_days": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"], "slots": ["09:00-13:00", "17:00-21:00"]}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Patients Master
CREATE TABLE IF NOT EXISTS public.patients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id),
    uhid VARCHAR(50) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    dob DATE,
    age INT,
    gender VARCHAR(20),
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    address TEXT,
    blood_group VARCHAR(10),
    allergies JSONB DEFAULT '[]'::jsonb,
    chronic_conditions JSONB DEFAULT '[]'::jsonb,
    preferred_language VARCHAR(20) DEFAULT 'en',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_uhid_per_tenant UNIQUE (tenant_id, uhid)
);

-- 5. Appointments
CREATE TABLE IF NOT EXISTS public.appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    doctor_id UUID NOT NULL REFERENCES public.doctors(id) ON DELETE CASCADE,
    appointment_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'SCHEDULED', -- 'SCHEDULED', 'WAITING', 'IN_CONSULTATION', 'COMPLETED', 'CANCELLED', 'NO_SHOW'
    booking_channel VARCHAR(50) DEFAULT 'AI_VOICE', -- 'AI_VOICE', 'WHATSAPP', 'RECEPTIONIST_WALKIN', 'PATIENT_PORTAL'
    reason_for_visit TEXT,
    intake_status VARCHAR(50) DEFAULT 'PENDING',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Pre-Consultation Patient Intake
CREATE TABLE IF NOT EXISTS public.patient_intakes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
    appointment_id UUID NOT NULL REFERENCES public.appointments(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    symptoms_reported TEXT,
    symptom_duration VARCHAR(100),
    medications_reported TEXT,
    allergies_reported TEXT,
    previous_conditions_reported TEXT,
    data_provenance VARCHAR(50) DEFAULT 'PATIENT_REPORTED',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Consultations & AI Scribe Drafts
CREATE TABLE IF NOT EXISTS public.consultations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
    appointment_id UUID NOT NULL REFERENCES public.appointments(id),
    patient_id UUID NOT NULL REFERENCES public.patients(id),
    doctor_id UUID NOT NULL REFERENCES public.doctors(id),
    audio_recording_url TEXT,
    raw_transcript TEXT,
    
    -- AI Generated Draft Note (SOAP Structure)
    draft_chief_complaint TEXT,
    draft_history_present_illness TEXT,
    draft_symptoms TEXT,
    draft_examination TEXT,
    draft_assessment TEXT,
    draft_plan TEXT,

    -- Doctor Approved Final Note
    final_chief_complaint TEXT,
    final_history_present_illness TEXT,
    final_examination TEXT,
    final_diagnosis TEXT,
    final_plan TEXT,

    status VARCHAR(50) DEFAULT 'DRAFT', -- 'DRAFT', 'APPROVED', 'LOCKED'
    approved_at TIMESTAMP WITH TIME ZONE,
    approved_by UUID REFERENCES public.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Prescriptions & Line Items
CREATE TABLE IF NOT EXISTS public.prescriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
    consultation_id UUID NOT NULL REFERENCES public.consultations(id),
    patient_id UUID NOT NULL REFERENCES public.patients(id),
    doctor_id UUID NOT NULL REFERENCES public.doctors(id),
    pdf_document_url TEXT,
    status VARCHAR(50) DEFAULT 'DRAFT', -- 'DRAFT', 'APPROVED', 'DELIVERED'
    approved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.prescription_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prescription_id UUID NOT NULL REFERENCES public.prescriptions(id) ON DELETE CASCADE,
    medicine_name VARCHAR(255) NOT NULL,
    dosage VARCHAR(100) NOT NULL,
    frequency VARCHAR(100) NOT NULL,
    duration VARCHAR(100) NOT NULL,
    instructions TEXT
);

-- 9. Medical Documents & Lab Reports
CREATE TABLE IF NOT EXISTS public.medical_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    document_type VARCHAR(50) NOT NULL,
    file_url TEXT NOT NULL,
    ocr_raw_text TEXT,
    structured_data JSONB,
    status VARCHAR(50) DEFAULT 'AWAITING_REVIEW',
    uploaded_by VARCHAR(50) DEFAULT 'PATIENT',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. Automated Follow-up Jobs
CREATE TABLE IF NOT EXISTS public.followup_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
    consultation_id UUID NOT NULL REFERENCES public.consultations(id),
    patient_id UUID NOT NULL REFERENCES public.patients(id),
    doctor_id UUID NOT NULL REFERENCES public.doctors(id),
    scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
    purpose TEXT NOT NULL,
    channel VARCHAR(50) DEFAULT 'WHATSAPP',
    status VARCHAR(50) DEFAULT 'SCHEDULED', -- 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'ESCALATED', 'FAILED'
    patient_response_status VARCHAR(50), -- 'IMPROVING', 'NO_CHANGE', 'NEEDS_REVIEW', 'EMERGENCY'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 11. Audit Logs & DPDP Consent Ledger
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.clinics(id),
    user_id UUID REFERENCES public.users(id),
    action VARCHAR(100) NOT NULL,
    entity_name VARCHAR(100) NOT NULL,
    entity_id UUID NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.patient_consents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.clinics(id),
    patient_id UUID NOT NULL REFERENCES public.patients(id),
    purpose VARCHAR(100) NOT NULL,
    is_granted BOOLEAN DEFAULT true,
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    revoked_at TIMESTAMP WITH TIME ZONE
);
