/**
 * Agent 15: Patient Follow-up Agent
 * Role: Schedule post-discharge patient care reminders via SMS based on diagnosis severity.
 * 
 * @param {Object} patient - Patient data.
 * @param {string} diagnosis - Suspected diagnosis.
 * @returns {Object} Follow-up timeline and message text.
 */
export function patientFollowUpAgent(patient, diagnosis) {
  const followUpDays = diagnosis.includes('Emergency') ? 1 : diagnosis.includes('Strep') ? 3 : 7;
  return {
    agent: 'Patient Follow-up Agent',
    followUpDays,
    message: `SMS check-in scheduled for ${patient.name} in ${followUpDays} day(s): "How are you feeling? Please reply BETTER / SAME / WORSE to update your care team."`,
    color: '#39ff14'
  };
}
