import React from 'react';
import { X, FileText, Calendar, Activity, ShieldAlert, CheckCircle } from 'lucide-react';

export default function PatientProfileDrawer({ patient, onClose, onStartConsultation }) {
  if (!patient) return null;

  return (
    <div className="drawer-overlay">
      <div className="drawer-container">
        {/* Drawer Header */}
        <div className="drawer-header">
          <div>
            <h2>{patient.name || 'Rahul Sharma'} <span className="drawer-sub-age">{patient.age || 34} yrs • Male</span></h2>
            <span className="uhid-badge">UHID: UHID-8921</span>
          </div>
          <button className="close-btn" onClick={onClose}><X size={20} /></button>
        </div>

        {/* Drawer Body */}
        <div className="drawer-body">
          {/* Section 1: Patient Vitals & Risk Flags */}
          <div className="profile-section-box">
            <h4>📋 Patient Profile & Verified Flags</h4>
            <div className="profile-grid">
              <div><strong>Blood Group:</strong> O+</div>
              <div><strong>Phone:</strong> +91 98765 43210</div>
              <div><strong>Known Allergies:</strong> <span className="badge-alert-allergy">Penicillin (Patient-Reported)</span></div>
              <div><strong>Chronic History:</strong> Mild Asthma (Doctor-Confirmed)</div>
            </div>
          </div>

          {/* Section 2: AI Pre-Consultation Summary */}
          <div className="profile-section-box ai-box">
            <h4>⚡ Pre-Consultation AI Brief</h4>
            <p>Patient reports high grade fever for 3 days accompanied by dry cough. Previous visit in June 2026 for acute bronchitis resolved cleanly. Chest X-Ray from June was clear. No severe dyspnea reported.</p>
            <div className="provenance-disclaimer">
              <CheckCircle size={14} /> Provenance: Synthesized from Patient Pre-visit Intake + Certified EHR Records
            </div>
          </div>

          {/* Section 3: Historical Visits Timeline */}
          <div className="profile-section-box">
            <h4>📜 Consultation History Timeline</h4>
            <div className="timeline-container">
              <div className="timeline-card">
                <div className="timeline-date"><Calendar size={14} /> 10 Jun 2026 • Dr. Ahmed</div>
                <div className="timeline-title">Chief Complaint: Cough & Mild Breathlessness</div>
                <div className="timeline-detail"><strong>Diagnosis:</strong> Acute Bronchitis</div>
                <div className="timeline-detail"><strong>Prescription:</strong> Azithromycin 500mg (3 days), Levosalbutamol Inhaler</div>
              </div>

              <div className="timeline-card">
                <div className="timeline-date"><Calendar size={14} /> 15 Jan 2026 • Dr. Verma</div>
                <div className="timeline-title">Chief Complaint: Seasonal Flu & Body Ache</div>
                <div className="timeline-detail"><strong>Diagnosis:</strong> Viral Upper Respiratory Infection</div>
                <div className="timeline-detail"><strong>Prescription:</strong> Paracetamol 650mg, Vitamin C</div>
              </div>
            </div>
          </div>

          {/* Section 4: Uploaded Lab Reports */}
          <div className="profile-section-box">
            <h4>🧪 Uploaded Lab Reports & Imaging (2)</h4>
            <div className="report-item-row">
              <div className="report-info">
                <FileText size={18} className="icon-blue" />
                <div>
                  <strong>CBC Report (Complete Blood Count)</strong>
                  <div className="report-meta">Uploaded today • Status: Awaiting Doctor Review</div>
                </div>
              </div>
              <button className="btn-view-report">View PDF</button>
            </div>

            <div className="report-item-row">
              <div className="report-info">
                <FileText size={18} className="icon-blue" />
                <div>
                  <strong>Chest X-Ray PA View Scan</strong>
                  <div className="report-meta">Uploaded 10 Jun 2026 • Verified Clear</div>
                </div>
              </div>
              <button className="btn-view-report">View Scan</button>
            </div>
          </div>
        </div>

        {/* Drawer Footer Actions */}
        <div className="drawer-footer">
          <button className="btn-secondary-action" onClick={onClose}>Close Profile</button>
          <button className="btn-primary-action" onClick={() => { onClose(); onStartConsultation(patient); }}>
            Start Consultation Now
          </button>
        </div>
      </div>
    </div>
  );
}
