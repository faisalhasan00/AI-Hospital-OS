import { askMedicalAI } from './llmService.js';
import { TOOL_DEFINITIONS, executeTool } from './toolRegistry.js';

/**
 * AI Central Orchestrator Service for DoctorOS Front Desk (Voice & WhatsApp)
 */
export async function processFrontDeskRequest({ userMessage, channel = 'voice', language = 'en', tenantId = 'demo-clinic-tenant', patientPhone = '' }) {
  console.log(`🎙️ Front Desk Ingress [Channel: ${channel}, Lang: ${language}]: "${userMessage}"`);

  const systemPrompt = `You are the intelligent AI Receptionist and Front Desk Assistant for DoctorOS Clinic System.
Your job is to understand patient requests (calls/messages), detect their intent, and call appropriate tools when needed.

Available Tools Definition:
${JSON.stringify(TOOL_DEFINITIONS, null, 2)}

Safety Rules:
1. NEVER autonomously provide medical diagnosis or prescribe medications.
2. If the user mentions chest pain, severe breathing difficulty, sudden weakness, or emergency symptoms, set intent to "EMERGENCY" and invoke escalate_emergency tool immediately.
3. If intent is to book, reschedule, or check slots, generate a tool call object.

Language Context: Patient speaks code "${language}". Formulate final user responses in "${language}".

Return raw JSON output in this exact schema:
{
  "intent": "BOOK_APPOINTMENT" | "RESCHEDULE" | "CANCEL" | "CHECK_SCHEDULE" | "GENERAL_QUERY" | "EMERGENCY",
  "tool_call": {
    "name": "tool_name",
    "args": { ... }
  } | null,
  "response_text": "Natural conversational response to speak or send to patient"
}`;

  const userPrompt = `Patient Input: "${userMessage}"\nPatient Phone: "${patientPhone}"\nTenant ID: "${tenantId}"`;

  try {
    const aiResult = await askMedicalAI(systemPrompt, userPrompt);

    if (!aiResult) {
      // Fallback response if LLM fails
      return {
        intent: 'GENERAL_QUERY',
        response_text: language === 'te' 
          ? 'నమస్కారం! నేను క్లినిక్ AI అసిస్టెంట్‌ని. మీకు డాక్టర్ అపాయింట్‌మెంట్ కావాలా?' 
          : language === 'hi' 
          ? 'नमस्ते! मैं क्लीनिक AI सहायक हूँ। क्या आप अपॉइंटमेंट बुक करना चाहते हैं?' 
          : 'Hello! Welcome to ABC Clinic. How can I assist you with your appointment today?',
        tool_result: null
      };
    }

    let toolExecutionResult = null;
    if (aiResult.tool_call && aiResult.tool_call.name) {
      const { name, args } = aiResult.tool_call;
      toolExecutionResult = await executeTool(name, { ...args, tenant_id: tenantId, patient_phone: patientPhone });

      // Append confirmation details to response if tool succeeded
      if (toolExecutionResult && toolExecutionResult.message) {
        aiResult.response_text = `${aiResult.response_text || ''} ${toolExecutionResult.message}`.trim();
      }
    }

    return {
      intent: aiResult.intent || 'GENERAL_QUERY',
      response_text: aiResult.response_text,
      tool_call: aiResult.tool_call,
      tool_result: toolExecutionResult
    };
  } catch (error) {
    console.error('❌ Error in Orchestrator Service:', error);
    return {
      intent: 'GENERAL_QUERY',
      response_text: 'Thank you for reaching out to ABC Clinic. Our receptionist will assist you shortly.',
      error: error.message
    };
  }
}
