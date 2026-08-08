/**
 * Agent 3: Medical Records Agent
 * Role: Retrieve patient medical history, check allergies, and audit chronic conditions.
 * 
 * @param {Object} patient - Patient data.
 * @param {string} patient.allergies - Known drug allergies.
 * @param {string} patient.chronicIllness - Documented chronic illnesses.
 * @param {string} patient.history - Descriptive clinic history text.
 * @returns {Object} Flags and summary data.
 */
export function medicalRecordsAgent(patient) {
  const flags = [];
  if (patient.allergies && patient.allergies !== 'None') {
    flags.push(`Known drug allergy: ${patient.allergies}`);
  }
  if (patient.chronicIllness && patient.chronicIllness !== 'None') {
    flags.push(`Chronic condition: ${patient.chronicIllness}`);
  }
  return {
    agent: 'Medical Records Agent',
    flags,
    history: patient.history || 'No previous records found.',
    color: '#00f0ff'
  };
}
