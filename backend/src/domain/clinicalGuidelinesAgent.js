/**
 * Agent 7: Clinical Guidelines Agent
 * Role: Map the current diagnosis and triage state to WHO and national clinical protocol standards.
 * 
 * @param {string} diagnosis - The primary suspected diagnosis.
 * @param {string} triage - Risk classification level.
 * @returns {Object} Protocol text instructions.
 */
export function clinicalGuidelinesAgent(diagnosis, triage) {
  let guideline = 'Supportive care, hydration, rest, and over-the-counter antipyretics for fever control. (WHO Essential Care 2024)';

  if (triage === 'Emergency') {
    guideline = 'WHO Cardiac Emergency Protocol: Suspected coronary occlusion requires immediate sublingual nitrate, Aspirin, IV access, and cardiology referral. Do not delay.';
  } else if (diagnosis.includes('Strep')) {
    guideline = 'WHO Throat Infection Guidelines: Confirmed Strep Throat requires a 10-day antibiotic course. Prescribe Penicillin-class first; use Azithromycin or Clindamycin if allergic.';
  } else if (diagnosis.includes('Diabetes')) {
    guideline = 'ADA Standards of Care 2024: Newly suspected T2DM requires fasting plasma glucose panel, HbA1c, and immediate dietary & lifestyle counseling. Start Metformin if confirmed.';
  } else if (diagnosis.includes('Atrial Fibrillation')) {
    guideline = 'ACC/AHA AFib Guidelines: Rate control required. Assess CHA₂DS₂-VASc score for anticoagulation risk. Cardiology referral within 24h.';
  }

  return {
    agent: 'Clinical Guidelines Agent',
    guideline,
    color: '#39ff14'
  };
}
