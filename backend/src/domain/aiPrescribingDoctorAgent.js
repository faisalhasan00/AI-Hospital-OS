import { askMedicalAI } from '../services/llmService.js';
import { supabase } from '../db/supabaseClient.js';

/**
 * Agent 8: AI Prescribing Doctor Agent (LLM Powered with RAG Feedback Memory)
 * Role: Formulate drug prescriptions and clinical directions matching 
 * standard guidelines using a real AI model trained on past clinician overrides.
 * 
 * @param {string} diagnosis - Primary suspected diagnosis.
 * @param {string} triage - Risk classification level (e.g. Emergency).
 * @param {Object} patient - Patient demographic and history object.
 * @returns {Promise<Object>} Drug name, dosage, schedule directions, and precautions.
 */
export async function aiPrescribingDoctorAgent(diagnosis, triage, patient = {}) {
  // Query Supabase for recent doctor feedback and overrides (RAG Memory)
  let doctorMemoryPrompt = '';
  try {
    const { data: pastFeedback } = await supabase
      .from('doctor_feedback')
      .select('symptoms, proposed_prescription, corrected_prescription, overridden, doctor_comment')
      .order('created_at', { ascending: false })
      .limit(5);

    if (pastFeedback && pastFeedback.length > 0) {
      doctorMemoryPrompt = '\n\nHISTORICAL CLINICIAN FEEDBACK & PAST OVERRIDES (Use as reinforcement guidance):\n' +
        pastFeedback.map((fb, idx) => 
          `${idx + 1}. Symptoms: "${fb.symptoms}" | AI Proposed: "${fb.proposed_prescription}" | Doctor Corrected: "${fb.corrected_prescription}" | Overridden: ${fb.overridden ? 'YES' : 'NO'} | Doctor Note: "${fb.doctor_comment}"`
        ).join('\n');
    }
  } catch (err) {
    console.warn('Unable to query doctor feedback RAG memory:', err.message);
  }

  const systemPrompt = `You are an expert AI Prescribing Doctor working in an Indian clinic.
Your task is to formulate a specific, safe medication prescription based on the diagnosis and patient history.

CRITICAL RULES:
- You MUST use well-known Indian brand/trade names of medicines (e.g. Dolo 650, Crocin, Combiflam, Azithral 500, Augmentin, Sinarest, Benadryl, Pantop 40, ORS sachets, Allegra, Meftal Spas, Emeset, Voveran, Shelcal 500, Monocef, etc.)
- You MUST specify the medicine form clearly: Tablet, Syrup, Drops, Capsule, Injection, Cream, Inhaler, Sachet, etc.
- Keep language simple so a normal patient can understand it.
- Prescribe what a real doctor in India would prescribe for this condition.
- Strictly adhere to historical doctor feedback and overrides provided below to avoid past mistakes.${doctorMemoryPrompt}

You must return the response in EXACTLY this JSON structure:
{
  "agent": "AI Prescribing Doctor Agent",
  "prescription": "Format rules:
If SINGLE medicine:
1) [Brand Name] [Form] ([Dosage], [When to take], [Duration]; Reason: [Why]; Note: [Any warning])

If MULTIPLE medicines (most cases will have 2-4 medicines), list them column-wise:
1) [Brand Name] [Form] ([Dosage], [When to take], [Duration]; Reason: [Why]; Note: [Any warning])
2) [Brand Name] [Form] ([Dosage], [When to take], [Duration]; Reason: [Why]; Note: [Any warning])
3) ...

Example output for fever + sore throat:
1) Dolo 650 Tablet (1 tablet, 3 times a day after meals, for 3 days; Reason: Fever & body pain relief; Note: Do not exceed 4 tablets/day)
2) Azithral 500 Tablet (1 tablet, once daily before meals, for 3 days; Reason: Bacterial throat infection; Note: Complete the full course)
3) Benadryl Syrup (10ml, 3 times a day, for 5 days; Reason: Cough relief; Note: May cause drowsiness)",
  "notes": "Clinical precautions, contraindication warnings, when to revisit the doctor, or lifestyle advice",
  "color": "#00f0ff"
}
The "color" MUST always be "#00f0ff".`;

  const userPrompt = `Diagnosis: ${diagnosis}
Triage Level: ${triage}
Patient Profile: Age ${patient.age || 'Unknown'}, Allergies: ${patient.allergies || 'None'}, Chronic Illnesses: ${patient.chronicIllness || 'None'}`;

  const llmResponse = await askMedicalAI(systemPrompt, userPrompt);

  if (llmResponse) {
    return llmResponse;
  }

  // Fallback if LLM fails or API key is missing
  return {
    agent: 'AI Prescribing Doctor Agent',
    prescription: `Medicine Name: Supportive Care
Dosage & Frequency: N/A
Duration: N/A
Reason: AI Service Unavailable
Instructions: Please consult a physician.`,
    notes: 'Unable to safely prescribe without AI API key.',
    color: '#00f0ff'
  };
}

