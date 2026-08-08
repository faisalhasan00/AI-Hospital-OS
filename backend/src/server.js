import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import http from 'http';
import { WebSocketServer } from 'ws';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import {
  receptionAgent,
  interviewAgent,
  medicalRecordsAgent,
  deviceIntegrationAgent,
  triageAgent,
  diseasePredictionAgent,
  clinicalGuidelinesAgent,
  aiPrescribingDoctorAgent,
  medicationSafetyAgent,
  doctorCopilotAgent,
  reportGenerationAgent,
  emergencyResponseAgent,
  learningAnalyticsAgent,
  capsuleEnvironmentAgent,
  patientFollowUpAgent
} from './domain/agents.js';

import { supabase } from './db/supabaseClient.js';
import { askMedicalVisionAI } from './services/llmService.js';
import { processFrontDeskRequest } from './services/orchestratorService.js';
import { generateConsultationDraft, approveConsultation } from './services/scribeService.js';
import { processFollowUpResponse } from './services/followupEngine.js';

const app = express();
app.use(cors({ limit: '20mb' }));
app.use(express.json({ limit: '20mb' }));

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const clients = new Set();

wss.on('connection', (ws) => {
  clients.add(ws);
  console.log(`📡 WebSocket client connected. Total connected: ${clients.size}`);

  ws.on('close', () => {
    clients.delete(ws);
    console.log(`📡 WebSocket client disconnected. Remaining: ${clients.size}`);
  });
});

export function broadcastWS(type, data) {
  const payload = JSON.stringify({ type, data });
  for (const client of clients) {
    if (client.readyState === 1) { // 1 === OPEN
      client.send(payload);
    }
  }
}

// REST API Endpoints

// 1. Session start
app.post('/api/session', async (req, res) => {
  const { patient, language } = req.body;
  const sessionId = 'CAP-' + Math.floor(100000 + Math.random() * 900000);
  
  const welcomeData = receptionAgent({
    patientId: patient.id,
    name: patient.name,
    language
  });

  try {
    // Upsert Patient
    await supabase.from('patients').upsert({
      id: patient.id,
      name: patient.name,
      age: patient.age,
      allergies: patient.allergies,
      chronic_illness: patient.chronicIllness,
      language: language
    });

    // Create Session
    await supabase.from('sessions').insert({
      id: sessionId,
      patient_id: patient.id,
      status: 'interview'
    });
  } catch (err) {
    console.error('Supabase Error during session start:', err);
  }

  res.json({
    sessionId,
    welcomeData
  });
});

// 2. Chat Interview Agent
app.post('/api/interview', async (req, res) => {
  const { userMessage, chatHistory } = req.body;
  const replyData = await interviewAgent(userMessage, chatHistory || []);
  res.json(replyData);
});

// 3. Sequential Multi-Agent Pipeline
app.post('/api/pipeline', async (req, res) => {
  const { patient, vitals, symptoms, sessionId } = req.body;

  // Run all agents
  const records = medicalRecordsAgent(patient);
  const devices = deviceIntegrationAgent(vitals);
  const triage = triageAgent(vitals);
  const prediction = await diseasePredictionAgent(vitals, symptoms);
  const guidelines = clinicalGuidelinesAgent(prediction.diagnosis, triage.risk);
  const proposedRx = await aiPrescribingDoctorAgent(prediction.diagnosis, triage.risk, patient);
  const safety = await medicationSafetyAgent(proposedRx.prescription, patient);
  const copilot = doctorCopilotAgent(
    patient,
    vitals,
    prediction.diagnosis,
    triage.risk,
    proposedRx.prescription,
    safety.status
  );
  const emergency = emergencyResponseAgent(patient, vitals, triage.risk);
  
  const envAction = triage.risk === 'Emergency' ? 'emergency' : 'lock';
  const environment = capsuleEnvironmentAgent(envAction);
  const followUp = patientFollowUpAgent(patient, prediction.diagnosis);

  const pipelineLogs = [
    { agent: 'Medical Records Agent', msg: `Retrieving health profile for patient ${patient.name}.`, color: 'var(--color-cyan)' },
    { agent: 'Medical Records Agent', msg: `History flagged: Allergies = [${patient.allergies}], Chronic = [${patient.chronicIllness}].`, color: 'var(--color-cyan)' },
    { agent: 'Device Integration Agent', msg: `Vitals collected: HR: ${vitals.heartRate}bpm, BP: ${vitals.bloodPressureSystolic}/${vitals.bloodPressureDiastolic}mmHg, SpO2: ${vitals.oxygenSaturation}%, Temp: ${vitals.temperature}°F.`, color: 'var(--color-teal)' },
    { agent: 'Device Integration Agent', msg: `ECG Sensor Waveform: ${vitals.ecgPattern} mapped to Lead II graph.`, color: 'var(--color-teal)' },
    { agent: 'Triage Agent', msg: `Urgency classification: ${triage.risk.toUpperCase()} (MEWS: ${triage.mewsScore}).`, color: triage.lightingColor },
    { agent: 'Disease Prediction Agent', msg: `Top match: "${prediction.diagnosis}" with ${prediction.confidence}% probability.`, color: 'var(--color-purple)' },
    { agent: 'Clinical Guidelines Agent', msg: `WHO/National protocols referenced. ${guidelines.guideline}`, color: 'var(--color-green)' },
    { agent: 'AI Prescribing Doctor Agent', msg: `Treatment plan formulated. Proposed Rx: [${proposedRx.prescription}].`, color: 'var(--color-cyan)' }
  ];

  if (safety.status === 'Critical Warning') {
    pipelineLogs.push({ agent: 'Medication Safety Agent', msg: `CRITICAL WARNING: ${safety.reason}`, color: 'var(--color-crimson)' });
  } else {
    pipelineLogs.push({ agent: 'Medication Safety Agent', msg: `Safety audit: ${safety.reason}`, color: 'var(--color-green)' });
  }

  pipelineLogs.push({ agent: 'Doctor Copilot Agent', msg: 'Compiling case report file for remote human validation.', color: 'var(--color-teal)' });

  if (emergency.triggered) {
    pipelineLogs.push({ agent: 'Emergency Response Agent', msg: 'CRITICAL RED ALERT: Triggering protocols.', color: 'var(--color-crimson)' });
    emergency.actions.forEach(act => {
      pipelineLogs.push({ agent: 'Emergency Response Agent', msg: `Action: ${act}`, color: 'var(--color-crimson)' });
    });
  }

  pipelineLogs.forEach(log => {
    broadcastWS('AGENT_LOG', log);
  });

  // Update session state in Supabase DB
  try {
    await supabase.from('sessions').update({
      symptoms,
      vitals,
      triage_level: triage.risk,
      diagnosis: prediction.diagnosis,
      diagnosis_confidence: prediction.confidence,
      prescription: proposedRx.prescription,
      safety_status: safety.status,
      safety_reason: safety.reason,
      status: 'discharge'
    }).eq('id', sessionId);

    // Insert telemetry logs into agent_logs table
    const logInserts = pipelineLogs.map(log => ({
      session_id: sessionId,
      agent_name: log.agent,
      message: log.msg,
      color_code: log.color
    }));
    await supabase.from('agent_logs').insert(logInserts);
  } catch (err) {
    console.error('Supabase Error during pipeline save:', err);
  }

  res.json({
    records, devices, triage, prediction, guidelines, proposedRx, safety, copilot, emergency, environment, followUp, pipelineLogs
  });
});

// 4. Capture doctor feedback (human override)
app.post('/api/doctor-feedback', async (req, res) => {
  const {
    sessionId,
    patientId,
    patientName,
    symptoms,
    proposedPrescription,
    correctedPrescription,
    overridden,
    doctorComment
  } = req.body;

  const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' ' + new Date().toLocaleDateString([], { month: 'short', day: 'numeric' });

  const logEntry = {
    patientId,
    patientName,
    symptoms,
    proposedPrescription,
    correctedPrescription,
    overridden,
    doctorComment,
    timestamp
  };

  const learningResult = learningAnalyticsAgent(logEntry);

  try {
    // Insert feedback
    await supabase.from('doctor_feedback').insert({
      session_id: sessionId,
      patient_id: patientId,
      proposed_prescription: proposedPrescription,
      corrected_prescription: correctedPrescription,
      overridden: overridden,
      doctor_comment: doctorComment || 'Approved as is.'
    });

    // Update session
    await supabase.from('sessions').update({
      prescription: correctedPrescription,
      status: 'discharge'
    }).eq('id', sessionId);
  } catch (err) {
    console.error('Supabase Error during doctor feedback:', err);
  }

  broadcastWS('AGENT_LOG', {
    agent: 'Learning & Analytics Agent',
    msg: learningResult.feedbackNote,
    color: 'var(--color-purple)'
  });

  res.json({
    success: true,
    learningResult,
    logEntry
  });
});

// 5. Environmental discharge & sanitization environmental changes
app.post('/api/discharge', async (req, res) => {
  const { sessionId } = req.body;
  
  try {
    await supabase.from('sessions').update({
      status: 'sanitized'
    }).eq('id', sessionId);
  } catch (err) {
    console.error('Supabase Error during discharge:', err);
  }

  const sanitizeEnv = capsuleEnvironmentAgent('sanitize');
  const readyEnv = capsuleEnvironmentAgent('ready');

  broadcastWS('AGENT_LOG', {
    agent: 'Capsule Environment Agent',
    msg: sanitizeEnv.message,
    color: 'var(--color-purple)'
  });

  res.json({
    success: true,
    sanitizeEnv,
    readyEnv
  });
});

// 6. Fetch analytics and training logs
app.get('/api/analytics', async (req, res) => {
  try {
    const { data } = await supabase.from('doctor_feedback').select('*').order('created_at', { ascending: false }).limit(50);
    const { count } = await supabase.from('sessions').select('*', { count: 'exact', head: true });
    
    res.json({
      trainingLogs: data || [],
      sessionsCount: count || 0
    });
  } catch(err) {
    res.json({ trainingLogs: [], sessionsCount: 0 });
  }
});

// 7. Multimodal Diagnostic Scan Analysis
app.post('/api/analyze-scan', async (req, res) => {
  const { imageBase64, mimeType, patientName, patientAge, notes } = req.body;

  const systemPrompt = `You are an expert AI Diagnostic Radiologist and Pathologist in an automated capsule clinic.
Analyze the provided medical image/scan (X-ray, ECG trace, CT, skin lesion photo, or lab report PDF).
Identify key radiological/pathological findings, check for severe anomalies, and rate severity.
Return response in EXACTLY this JSON structure:
{
  "agent": "Multimodal Diagnostic Agent",
  "findings": "Detailed radiological assessment of scan features.",
  "anomalyDetected": true or false,
  "severity": "Normal" or "Mild" or "Moderate" or "Severe",
  "color": "#9d4edd"
}
Only output JSON.`;

  const userPrompt = `Patient: ${patientName || 'Unknown'} (${patientAge || 'Unknown'} y/o). Additional Clinical Context: ${notes || 'None'}`;

  const analysis = await askMedicalVisionAI(systemPrompt, userPrompt, imageBase64, mimeType || 'image/jpeg');

  broadcastWS('AGENT_LOG', {
    agent: 'Multimodal Diagnostic Agent',
    msg: `Scan analyzed: ${analysis.findings} (Severity: ${analysis.severity})`,
    color: '#9d4edd'
  });

  res.json(analysis);
});

// --- DOCTOROS API ENDPOINTS ---

// 1. AI Front Desk Voice & WhatsApp Ingress
app.post('/api/doctoros/front-desk', async (req, res) => {
  const { userMessage, channel, language, tenantId, patientPhone } = req.body;
  const result = await processFrontDeskRequest({
    userMessage: userMessage || 'Hello',
    channel: channel || 'voice',
    language: language || 'en',
    tenantId: tenantId || 'demo-clinic-tenant',
    patientPhone: patientPhone || '9876543210'
  });

  broadcastWS('AGENT_LOG', {
    agent: 'AI Front Desk Agent',
    msg: `Intent: [${result.intent}] - Response: "${result.response_text}"`,
    color: 'var(--color-cyan)'
  });

  res.json(result);
});

// 2. AI Consultation Scribe - Generate Draft SOAP note
app.post('/api/doctoros/scribe/draft', async (req, res) => {
  const { transcript, patientId, doctorId, appointmentId, tenantId } = req.body;
  const result = await generateConsultationDraft({
    transcript,
    patientId,
    doctorId,
    appointmentId,
    tenantId
  });

  broadcastWS('AGENT_LOG', {
    agent: 'AI Consultation Scribe',
    msg: `Draft SOAP note generated for patient ID ${patientId || 'Rahul Sharma'}`,
    color: 'var(--color-teal)'
  });

  res.json(result);
});

// 3. Doctor Approval of Consultation & Prescription
app.post('/api/doctoros/consultation/approve', async (req, res) => {
  const { consultationId, finalDiagnosis, finalPlan, prescriptionItems, followupDays, doctorId, tenantId } = req.body;
  const result = await approveConsultation({
    consultationId,
    finalDiagnosis,
    finalPlan,
    prescriptionItems,
    followupDays,
    doctorId,
    tenantId
  });

  broadcastWS('AGENT_LOG', {
    agent: 'Doctor Workspace',
    msg: `APPROVED: Consultation note finalized. Prescription & Follow-up queued.`,
    color: 'var(--color-green)'
  });

  res.json(result);
});

// 4. Follow-up Check-in Response Processing
app.post('/api/doctoros/followup/response', async (req, res) => {
  const { patientId, patientMessage, consultationId, doctorId, tenantId } = req.body;
  const result = await processFollowUpResponse({
    patientId,
    patientMessage,
    consultationId,
    doctorId,
    tenantId
  });

  broadcastWS('AGENT_LOG', {
    agent: 'Follow-up Engine',
    msg: `Status: [${result.followup_status}] - Action: ${result.action_required}`,
    color: result.followup_status === 'EMERGENCY' ? 'var(--color-crimson)' : 'var(--color-purple)'
  });

  res.json(result);
});

// 5. Clinic Dashboard Analytics
app.get('/api/doctoros/clinic-dashboard', async (req, res) => {
  res.json({
    today: {
      appointmentsCount: 48,
      completedCount: 35,
      waitingCount: 6,
      cancelledCount: 3,
      noShowCount: 4,
      aiCallsHandled: 31,
      whatsappConversations: 67,
      followupsDue: 18,
      revenueInr: 48500
    },
    nextPatient: {
      name: 'Rahul Sharma',
      age: 34,
      time: '5:30 PM',
      previousVisits: 4,
      reportsUploaded: 3,
      aiSummary: 'Fever for 3 days with cough. Chest clear. History of asthma.'
    }
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Backend Server running on port ${PORT} with WebSocket active`);
});
