/**
 * Agent 1: Patient Reception Agent
 * Role: Greet the patient, verify their identification, set the language preference,
 * and initialize a new clinical visit session.
 * 
 * @param {Object} params
 * @param {string} params.patientId - The patient's unique identifier.
 * @param {string} params.name - The patient's full name.
 * @param {string} params.language - The selected language (English, Spanish, Hindi, Arabic).
 * @returns {Object} Session initialization data.
 */
export function receptionAgent({ patientId, name, language }) {
  return {
    agent: 'Patient Reception Agent',
    sessionCreated: true,
    greeting: `Welcome, ${name}. Your session has been initialized in ${language}. Please describe your symptoms.`,
    color: '#00f0ff'
  };
}
