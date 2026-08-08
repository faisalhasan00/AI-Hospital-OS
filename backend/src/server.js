import express from 'express';
import cors from 'cors';
import http from 'http';
import { WebSocketServer } from 'ws';
import dotenv from 'dotenv';
import { supabase } from './db/supabaseClient.js';
import { processFrontDeskRequest } from './services/orchestratorService.js';
import { generateConsultationDraft, approveConsultation } from './services/scribeService.js';
import { processFollowUpResponse } from './services/followupEngine.js';

dotenv.config();

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
    if (client.readyState === 1) {
      client.send(payload);
    }
  }
}

// --- DOCTOROS / AI CLINIC OS ENDPOINTS ---

// Health Check
app.get('/api/doctoros/health', (req, res) => {
  res.json({ status: 'OK', service: 'AI Clinic OS Server', timestamp: new Date().toISOString() });
});

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
      aiSummary: 'Fever for 3 days with cough. Chest clear on auscultation. History of mild asthma.'
    }
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🏥 AI Clinic OS Backend Server running on port ${PORT}`);
});
