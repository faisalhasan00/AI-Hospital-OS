import { askMedicalAI } from './llmService.js';
import { executeTool } from './toolRegistry.js';

/**
 * DoctorOS Follow-up Automation Engine
 * Processes patient responses to automated check-ins and categorizes risk.
 */
export async function processFollowUpResponse({ patientId, patientMessage, consultationId, doctorId, tenantId = 'demo-clinic-tenant' }) {
  console.log(`💬 Processing Follow-up Check-in Response: "${patientMessage}"`);

  const systemPrompt = `You are the DoctorOS Follow-up AI Assistant.
Analyze the patient's reply to a post-consultation recovery check-in.

Classify the recovery status into ONE of:
- "IMPROVING": Patient feels better or symptoms resolved.
- "NO_CHANGE": Symptoms persist at same level without severe distress.
- "NEEDS_REVIEW": Worsening symptoms, unexpected side-effects, or patient requests doctor contact.
- "EMERGENCY": Severe sudden distress, chest pain, high fever spike, severe difficulty breathing.

Return raw JSON:
{
  "status": "IMPROVING" | "NO_CHANGE" | "NEEDS_REVIEW" | "EMERGENCY",
  "reason": "Brief explanation of classification",
  "reply_text": "Empathetic WhatsApp reply to send to patient",
  "action_required": "NONE" | "RECEPTIONIST_TASK" | "DOCTOR_TASK" | "EMERGENCY_ALERT"
}`;

  const userPrompt = `Patient Reply: "${patientMessage}"`;

  const analysis = await askMedicalAI(systemPrompt, userPrompt) || {
    status: patientMessage.toLowerCase().includes('better') ? 'IMPROVING' : 'NEEDS_REVIEW',
    reason: 'Patient reported symptoms state.',
    reply_text: 'Thank you for updating us. Please let us know if you need anything else.',
    action_required: patientMessage.toLowerCase().includes('better') ? 'NONE' : 'DOCTOR_TASK'
  };

  let escalationResult = null;
  if (analysis.status === 'EMERGENCY') {
    escalationResult = await executeTool('escalate_emergency', {
      tenant_id: tenantId,
      symptoms_summary: patientMessage,
      severity_level: 'EMERGENCY'
    });
  }

  return {
    success: true,
    followup_status: analysis.status,
    reason: analysis.reason,
    reply_text: analysis.reply_text,
    action_required: analysis.action_required,
    escalation: escalationResult
  };
}
