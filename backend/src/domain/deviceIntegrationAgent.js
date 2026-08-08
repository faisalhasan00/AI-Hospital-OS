/**
 * Agent 4: Device Integration Agent
 * Role: Interface with the clinic's diagnostic instruments to collect vitals
 * (Heart Rate, Blood Pressure, SpO2, Temperature, Weight, ECG Waveform).
 * 
 * @param {Object} vitals - Biosensor input values.
 * @param {number} vitals.heartRate - Heart rate (bpm).
 * @param {number} vitals.bloodPressureSystolic - Systolic pressure.
 * @param {number} vitals.bloodPressureDiastolic - Diastolic pressure.
 * @param {number} vitals.oxygenSaturation - SpO2 percentage.
 * @param {number} vitals.temperature - Body temperature (°F).
 * @param {number} vitals.weight - Body weight (kg).
 * @param {string} vitals.ecgPattern - ECG waveform classification.
 * @returns {Object} Compiled vitals telemetry.
 */
export function deviceIntegrationAgent(vitals) {
  return {
    agent: 'Device Integration Agent',
    readings: {
      heartRate: vitals.heartRate,
      bloodPressure: `${vitals.bloodPressureSystolic}/${vitals.bloodPressureDiastolic} mmHg`,
      oxygenSaturation: `${vitals.oxygenSaturation}%`,
      temperature: `${vitals.temperature}°F`,
      weight: `${vitals.weight} kg`,
      ecgPattern: vitals.ecgPattern
    },
    color: '#00f5d4'
  };
}
