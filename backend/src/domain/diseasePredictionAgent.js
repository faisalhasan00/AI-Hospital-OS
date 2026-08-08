import { askMedicalAI } from '../services/llmService.js';

/**
 * Agent 6: Disease Prediction Agent (LLM Powered)
 * Role: Analyze vitals data alongside symptom logs using a real AI model 
 * to formulate differential diagnoses.
 * 
 * @param {Object} vitals - Biosensor reading values.
 * @param {string} symptoms - Structured patient complaints text.
 * @returns {Promise<Object>} Suspected diagnosis, confidence rating, and differentials list.
 */
export async function diseasePredictionAgent(vitals, symptoms) {
  const systemPrompt = `You are an expert AI Diagnostic Engine for a high-tech automated clinic.
Your task is to analyze the patient's vitals and symptoms and provide a differential diagnosis.
You must return the response in EXACTLY this JSON structure:
{
  "agent": "Disease Prediction Agent",
  "diagnosis": "Primary suspected condition name",
  "confidence": 85,
  "differentials": ["Secondary guess 1 (XX%)", "Secondary guess 2 (YY%)"],
  "color": "#9d4edd"
}
Ensure the "confidence" is an integer between 1 and 99.
The "color" MUST always be "#9d4edd".`;

  const userPrompt = `Symptoms: ${symptoms || 'None reported'}
Vitals: HR ${vitals.heartRate}, BP ${vitals.bloodPressureSystolic}/${vitals.bloodPressureDiastolic}, Temp ${vitals.temperature}°F, SpO2 ${vitals.oxygenSaturation}%, ECG: ${vitals.ecgPattern}`;

  const llmResponse = await askMedicalAI(systemPrompt, userPrompt);

  if (llmResponse) {
    return llmResponse;
  }

  // Fallback if LLM fails or API key is missing
  return {
    agent: 'Disease Prediction Agent',
    diagnosis: 'Undetermined (AI Service Unavailable)',
    confidence: 0,
    differentials: ['Please check LLM API Key'],
    color: '#9d4edd'
  };
}
