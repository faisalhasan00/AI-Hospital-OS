import { askMedicalAI } from '../services/llmService.js';

/**
 * Agent 2: Medical Interview Agent (LLM Powered)
 * Role: Chat with the patient, understand complaints, and ask targeted follow-up questions dynamically.
 * 
 * @param {string} userMessage - The latest symptom description entered by the patient.
 * @param {Array} chatHistory - Past conversation turns [{ sender: 'patient'|'agent', text: string }]
 * @returns {Promise<Object>} Follow-up reply and metadata.
 */
export async function interviewAgent(userMessage, chatHistory = []) {
  const systemPrompt = `You are an expert AI Medical Intake Nurse in an automated high-tech clinic.
Your task is to conduct an empathetic, clinical symptom interview with the patient.
Acknowledge their complaints, ask 1 to 2 specific clinical follow-up questions (such as duration, severity, associated symptoms, or triggers), and maintain a professional medical tone.
You must return the response in EXACTLY this JSON structure:
{
  "agent": "Medical Interview Agent",
  "reply": "Empathetic response and clinical follow-up question here",
  "color": "#00f0ff"
}
Only output JSON.`;

  const formattedHistory = chatHistory
    .map(msg => `${msg.sender === 'patient' ? 'Patient' : 'Agent'}: ${msg.text}`)
    .join('\n');

  const userPrompt = `Conversation History:\n${formattedHistory || 'None'}\n\nLatest Patient Message: "${userMessage || 'Hello'}"`;

  try {
    const llmResponse = await askMedicalAI(systemPrompt, userPrompt);
    if (llmResponse && llmResponse.reply) {
      return llmResponse;
    }
  } catch (err) {
    console.warn('interviewAgent LLM error, falling back to rule engine:', err.message);
  }

  // Fallback rule-based matching if LLM fails
  const text = (userMessage || '').toLowerCase();
  let reply = 'Could you describe when these symptoms started and any other associated complaints?';

  if (text.includes('chest') || text.includes('heart') || text.includes('cardiac') || text.includes('arm')) {
    reply = 'I understand you have chest discomfort. Are you experiencing shortness of breath, pain radiating to your arm or jaw, or cold sweating?';
  } else if (text.includes('throat') || text.includes('swallow') || text.includes('tonsil')) {
    reply = 'Sore throat can be concerning. Do you have fever, chills, or difficulty swallowing liquids? How long have you had these symptoms?';
  } else if (text.includes('thirst') || text.includes('tired') || text.includes('urinate') || text.includes('fatigue')) {
    reply = 'Increased thirst and fatigue are important symptoms. Do you have frequent urination, dry mouth, or blurry vision? Is there a family history of diabetes?';
  } else if (text.includes('fever') || text.includes('temp') || text.includes('hot')) {
    reply = 'Have you measured your body temperature? Do you have a runny nose, headaches, or body aches alongside the fever?';
  } else if (text.includes('cough') || text.includes('breath')) {
    reply = 'How long have you had the cough? Is it dry or productive? Do you have shortness of breath at rest or on exertion?';
  }

  return {
    agent: 'Medical Interview Agent',
    reply,
    color: '#00f0ff'
  };
}

