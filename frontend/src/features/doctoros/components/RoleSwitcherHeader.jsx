import React from 'react';

export const ALL_ROLES = [
  { id: 'doctor', name: '👨‍⚕️ Doctor', desc: 'Diagnosis, consultation, treatment, prescription, lab orders & AI draft approval' },
  { id: 'receptionist', name: '📋 Receptionist', desc: 'Appointments, patient registration, walk-in queue & front desk' },
  { id: 'nurse', name: '👩‍⚕️ Nurse', desc: 'Vitals collection, patient preparation & doctor assistance' },
  { id: 'lab_tech', name: '🧪 Lab Technician', desc: 'Tests, sample collection & lab report uploads' },
  { id: 'pharmacist', name: '💊 Pharmacist', desc: 'Prescription view, medicine dispensing & inventory' },
  { id: 'accountant', name: '💰 Accountant', desc: 'Payments, billing invoices & clinic expenses' },
  { id: 'manager', name: '👨‍💼 Clinic Manager', desc: 'Overall clinic operations & staff schedules' },
  { id: 'ai_receptionist', name: '🤖 AI Receptionist', desc: 'Automated PSTN calls, WhatsApp booking & clinic info' },
  { id: 'ai_followup', name: '🤖 AI Follow-up Agent', desc: 'Automated check-ins, reminders & recovery status triage' },
  { id: 'patient', name: '👤 Patient', desc: 'Appointments, medical records & prescription downloads' },
  { id: 'super_admin', name: '🔐 Super Admin', desc: 'SaaS tenant management, billing & system monitoring' }
];

export default function RoleSwitcherHeader({ activeRole, onSelectRole, onSignOut }) {
  const currentRoleObj = ALL_ROLES.find(r => r.id === activeRole) || ALL_ROLES[0];

  return (
    <div className="role-switcher-header">
      <div className="role-brand">
        <span className="brand-logo-icon">🩺</span>
        <div>
          <h2>AI CLINIC OS <span className="saas-badge">Multi-Tenant SaaS</span></h2>
          <div className="role-desc-text">{currentRoleObj.desc}</div>
        </div>
      </div>

      <div className="role-select-box">
        <label>Active Role View:</label>
        <select value={activeRole} onChange={(e) => onSelectRole(e.target.value)} className="role-dropdown">
          {ALL_ROLES.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </select>
        {onSignOut && (
          <button className="btn-signout" onClick={onSignOut}>
            Sign Out
          </button>
        )}
      </div>
    </div>
  );
}
