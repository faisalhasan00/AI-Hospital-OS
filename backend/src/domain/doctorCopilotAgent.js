/**
 * Agent 10: Doctor Copilot Agent
 * Role: Collect clinic history, vitals, suspected diagnosis, and safety status
 * into a single structured summary to assist remote clinician co-signing.
 * 
 * @param {Object} patient - Patient metadata.
 * @param {Object} vitals - Biosensor metrics.
 * @param {string} diagnosis - Suspected diagnosis.
 * @param {string} triage - Risk classification level.
 * @param {string} prescription - Proposed prescription.
 * @param {string} safetyStatus - Passed or Critical Warning.
 * @returns {Object} Structured clinical summary case file.
 */
export function doctorCopilotAgent(patient, vitals, diagnosis, triage, prescription, safetyStatus) {
  const summary = {
    patientName: patient.name,
    patientAge: patient.age,
    patientId: patient.id,
    allergies: patient.allergies,
    chronicConditions: patient.chronicIllness,
    vitals: {
      hr: `${vitals.heartRate} bpm`,
      bp: `${vitals.bloodPressureSystolic}/${vitals.bloodPressureDiastolic} mmHg`,
      spo2: `${vitals.oxygenSaturation}%`,
      temp: `${vitals.temperature}°F`,
      ecg: vitals.ecgPattern
    },
    aiDiagnosis: diagnosis,
    triageLevel: triage,
    proposedPrescription: prescription,
    safetyStatus,
    keyAlerts: safetyStatus === 'Critical Warning'
      ? ['⚠️ ALLERGY CONFLICT – Prescription requires human correction before release']
      : triage === 'Emergency'
        ? ['🚨 EMERGENCY – EMS dispatched. Doctor immediate review required.']
        : []
  };

  return {
    agent: 'Doctor Copilot Agent',
    caseSummary: summary,
    color: '#00f5d4'
  };
}
