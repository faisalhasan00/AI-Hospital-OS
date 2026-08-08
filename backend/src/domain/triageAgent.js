/**
 * Agent 5: Triage Agent
 * Role: Analyze vitals data using a Modified Early Warning Score (MEWS) 
 * algorithm to classify patient risk and level of urgency.
 * 
 * @param {Object} vitals - Biosensor reading values.
 * @returns {Object} Triage classification, urgency rating, lighting color, and MEWS score.
 */
export function triageAgent(vitals) {
  let mewsScore = 0;

  // 1. Systolic Blood Pressure Scoring
  const sysBP = vitals.bloodPressureSystolic || 120;
  if (sysBP <= 70) mewsScore += 3;
  else if (sysBP <= 80) mewsScore += 2;
  else if (sysBP <= 100) mewsScore += 1;
  else if (sysBP >= 200) mewsScore += 2;

  // 2. Heart Rate Scoring
  const hr = vitals.heartRate || 75;
  if (hr <= 40) mewsScore += 2;
  else if (hr <= 50) mewsScore += 1;
  else if (hr >= 130) mewsScore += 3;
  else if (hr >= 111) mewsScore += 2;
  else if (hr >= 101) mewsScore += 1;

  // 3. Temperature Scoring (Fahrenheit)
  const tempF = vitals.temperature || 98.6;
  if (tempF < 95.0) mewsScore += 2;
  else if (tempF >= 101.3) mewsScore += 2;

  // 4. Oxygen Saturation (SpO2) - Incorporating NEWS logic
  const spo2 = vitals.oxygenSaturation || 98;
  if (spo2 <= 84) mewsScore += 3;
  else if (spo2 <= 89) mewsScore += 2;
  else if (spo2 <= 92) mewsScore += 1;

  // 5. ECG Rhythm Adjustments
  if (vitals.ecgPattern === 'ST-Elevation (Infarction)') mewsScore += 4; // Critical trigger

  // Determine Urgency based on MEWS Score
  let risk = 'Low Risk';
  let urgency = 1;
  let lightingColor = 'blue';

  if (mewsScore >= 7 || vitals.ecgPattern === 'ST-Elevation (Infarction)') {
    risk = 'Emergency';
    urgency = 4;
    lightingColor = 'red';
  } else if (mewsScore >= 5) {
    risk = 'High Risk';
    urgency = 3;
    lightingColor = 'red';
  } else if (mewsScore >= 3) {
    risk = 'Medium Risk';
    urgency = 2;
    lightingColor = 'yellow';
  }

  return {
    agent: 'Triage Agent',
    risk,
    urgency,
    mewsScore,
    lightingColor,
    color: risk === 'Emergency' || risk === 'High Risk'
      ? '#ff0055'
      : risk === 'Medium Risk'
        ? '#ff9f1c'
        : '#39ff14'
  };
}
