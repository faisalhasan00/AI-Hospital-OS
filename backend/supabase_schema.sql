-- SQL Schema for AI Hospital Autonomous Capsule
-- Copy and run this in your Supabase SQL Editor

-- 1. Patients Table
CREATE TABLE IF NOT EXISTS public.patients (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    age INTEGER,
    allergies TEXT,
    chronic_illness TEXT,
    language TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Sessions Table (Stores pipeline results)
CREATE TABLE IF NOT EXISTS public.sessions (
    id TEXT PRIMARY KEY, -- Using the CAP-XXXXXX format
    patient_id TEXT REFERENCES public.patients(id),
    symptoms TEXT,
    triage_level TEXT,
    diagnosis TEXT,
    diagnosis_confidence INTEGER,
    prescription TEXT,
    safety_status TEXT,
    safety_reason TEXT,
    vitals JSONB, -- Stores HR, BP, Temp, SpO2, etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status TEXT
);

-- 3. Agent Logs Table (Stores detailed breakdown of agent telemetry)
CREATE TABLE IF NOT EXISTS public.agent_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id TEXT REFERENCES public.sessions(id),
    agent_name TEXT,
    message TEXT,
    color_code TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Doctor Feedback (Reinforcement Learning overrides)
CREATE TABLE IF NOT EXISTS public.doctor_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id TEXT REFERENCES public.sessions(id),
    patient_id TEXT REFERENCES public.patients(id),
    proposed_prescription TEXT,
    corrected_prescription TEXT,
    overridden BOOLEAN,
    doctor_comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Setup Row Level Security (RLS) - for basic open usage right now, we can disable it or add allow-all policies.
-- In a real production app, you would lock this down to authenticated users.
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctor_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all public inserts on patients" ON public.patients FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all public selects on patients" ON public.patients FOR SELECT USING (true);

CREATE POLICY "Allow all public inserts on sessions" ON public.sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all public selects on sessions" ON public.sessions FOR SELECT USING (true);
CREATE POLICY "Allow all public updates on sessions" ON public.sessions FOR UPDATE USING (true);

CREATE POLICY "Allow all public inserts on agent_logs" ON public.agent_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all public selects on agent_logs" ON public.agent_logs FOR SELECT USING (true);

CREATE POLICY "Allow all public inserts on doctor_feedback" ON public.doctor_feedback FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all public selects on doctor_feedback" ON public.doctor_feedback FOR SELECT USING (true);
