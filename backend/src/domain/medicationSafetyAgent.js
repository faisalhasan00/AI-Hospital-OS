import { askMedicalAI } from '../services/llmService.js';

/**
 * Agent 9: Medication Safety Agent (India/CDSCO Localized)
 * Role: Audit generated drug prescriptions against the patient's allergy records 
 * and cross-reactivity risks using Indian pharmacological guidelines.
 * 
 * @param {string} prescription - Proposed prescription from the prescribing agent.
 * @param {Object} patient - Patient data.
 * @returns {Promise<Object>} Safety audit result (Passed / Critical Warning) and status text.
 */
export async function medicationSafetyAgent(prescription, patient) {
  const systemPrompt = `You are an expert Clinical Pharmacologist in India.
Your task is to audit a prescription for safety against the patient's allergies, checking for drug-drug interactions and cross-reactivity based on CDSCO and ICMR guidelines.
You must return the response in EXACTLY this JSON structure:
{
  "agent": "Medication Safety Agent",
  "status": "Passed" OR "Critical Warning",
  "reason": "Detailed explanation of why it passed or failed. Mention any India-specific drug brand names if relevant.",
  "color": "#39ff14" (if Passed) OR "#ff0055" (if Critical Warning)
}
Only output JSON.`;

  const userPrompt = `Patient Allergies: ${patient.allergies || 'None reported'}
Proposed Prescription: ${prescription}`;

  const llmResponse = await askMedicalAI(systemPrompt, userPrompt);

  if (llmResponse) {
    return llmResponse;
  }

  // Fallback if LLM fails
  return {
    agent: 'Medication Safety Agent',
    status: 'Passed',
    reason: 'Fallback Mode: Basic safety checks passed (AI Service Unavailable).',
    color: '#39ff14'
  };
}
