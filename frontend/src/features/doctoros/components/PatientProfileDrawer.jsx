import React, { useState } from 'react';
import { X, FileText, Calendar, Activity, ShieldAlert, CheckCircle, TrendingUp, TrendingDown, Clock, Stethoscope, ArrowRight, Check } from 'lucide-react';

export default function PatientProfileDrawer({ patient, onClose, onStartConsultation }) {
  const [activeTab, setActiveTab] = useState('timeline'); // 'timeline' or 'comparison'

  if (!patient) return null;

  const pastVisits = [
    {
      id: 'V-103',
      date: '11 Aug 2026 (Today)',
      doctor: 'Dr. Faisal Hasan, MD',
      temp: '101.2°F',
      bp: '120/80 mmHg',
      spo2: '98%',
      pulse: '84 bpm',
      diagnosis: 'Acute Upper Respiratory Tract Infection',
      rx: 'Paracetamol 650mg, Ambroxol Syrup 10ml',
      status: 'Current Visit',
      tempTrend: 'up',
      bpTrend: 'normal'
    },
    {
      id: 'V-102',
      date: '10 Jun 2026 (2 mos ago)',
      doctor: 'Dr. Ahmed (Pulmonology)',
      temp: '98.6°F',
      bp: '138/88 mmHg',
      spo2: '99%',
      pulse: '76 bpm',
      diagnosis: 'Acute Bronchitis',
      rx: 'Azithromycin 500mg (3 days), Levosalbutamol Inhaler',
      status: 'Resolved',
      tempTrend: 'normal',
      bpTrend: 'elevated'
    },
    {
      id: 'V-101',
      date: '15 Jan 2026 (7 mos ago)',
      doctor: 'Dr. Verma (Internal Med)',
      temp: '99.1°F',
      bp: '124/82 mmHg',
      spo2: '97%',
      pulse: '78 bpm',
      diagnosis: 'Viral Upper Respiratory Infection',
      rx: 'Paracetamol 650mg, Vitamin C, Warm Hydration',
      status: 'Resolved',
      tempTrend: 'mild',
      bpTrend: 'normal'
    }
  ];

  return (
    <div className="drawer-overlay">
      <div className="drawer-container">
        {/* 1. Drawer Header */}
        <div className="drawer-header">
          <div>
            <h2>{patient.name || 'Rahul Sharma'} <span className="drawer-sub-age">({patient.age || 34} · Male)</span></h2>
            <span className="uhid-subtle-tag">UHID: UHID-8921</span>
          </div>
          <button className="close-btn" onClick={onClose}><X size={18} /></button>
        </div>

        {/* 2. Sub-Header Navigation Tabs */}
        <div className="drawer-nav-tabs">
          <button
            className={`drawer-tab-btn ${activeTab === 'timeline' ? 'active' : ''}`}
            onClick={() => setActiveTab('timeline')}
          >
            <Calendar size={15} /> Consultation Timeline
          </button>
          <button
            className={`drawer-tab-btn ${activeTab === 'comparison' ? 'active' : ''}`}
            onClick={() => setActiveTab('comparison')}
          >
            <Activity size={15} /> Vitals Trend Comparison
          </button>
        </div>

        {/* 3. Drawer Body */}
        <div className="drawer-body">
          {/* Patient Overview Summary */}
          <div className="profile-section-box">
            <div className="profile-grid">
              <div><strong>Blood Group:</strong> O+ (Positive)</div>
              <div><strong>Phone:</strong> {patient.phone || '+91 98765 43210'}</div>
              <div><strong>Known Allergies:</strong> <span className="allergy-tag-warning"><ShieldAlert size={12} /> Penicillin</span></div>
              <div><strong>Chronic History:</strong> Mild Asthma (Confirmed)</div>
            </div>
          </div>

          {/* TAB 1: CHRONOLOGICAL CONSULTATION TIMELINE */}
          {activeTab === 'timeline' && (
            <>
              {/* AI Pre-Consultation Summary Brief */}
              <div className="profile-section-box ai-brief-box">
                <h4>⚡ Pre-Consultation AI Synthesis Brief</h4>
                <p>Patient reports high grade fever for 3 days accompanied by dry cough. Previous visit in June 2026 for acute bronchitis resolved cleanly. Chest X-Ray from June was clear. No severe dyspnea reported.</p>
                <div className="provenance-disclaimer">
                  <CheckCircle size={13} style={{ color: 'var(--success)' }} /> Provenance: Synthesized from Pre-visit Patient Intake + Certified EHR Records
                </div>
              </div>

              {/* Consultation History Cards */}
              <div className="profile-section-box">
                <div className="emr-section-label" style={{ marginBottom: '0.85rem' }}>HISTORICAL VISITS TIMELINE (3 VISITS)</div>

                <div className="timeline-list">
                  {pastVisits.map((visit) => (
                    <div key={visit.id} className={`timeline-visit-card ${visit.status === 'Current Visit' ? 'current' : ''}`}>
                      <div className="visit-card-header">
                        <div className="visit-date-badge">
                          <Clock size={13} /> {visit.date}
                        </div>
                        <span className="visit-doctor-label">{visit.doctor}</span>
                      </div>

                      <div className="visit-vitals-pills-row">
                        <span className={`vital-pill-mini ${visit.tempTrend === 'up' ? 'red' : ''}`}>🌡️ {visit.temp}</span>
                        <span className={`vital-pill-mini ${visit.bpTrend === 'elevated' ? 'amber' : ''}`}>🩸 {visit.bp}</span>
                        <span className="vital-pill-mini">🫁 SpO2 {visit.spo2}</span>
                        <span className="vital-pill-mini">🫀 {visit.pulse}</span>
                      </div>

                      <div className="visit-detail-item">
                        <strong>Diagnosis:</strong> {visit.diagnosis}
                      </div>

                      <div className="visit-detail-item">
                        <strong>Prescription:</strong> {visit.rx}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* TAB 2: VITALS TREND COMPARISON MATRIX */}
          {activeTab === 'comparison' && (
            <div className="profile-section-box">
              <div className="emr-section-label" style={{ marginBottom: '0.85rem' }}>HISTORICAL VITALS COMPARISON MATRIX</div>

              <div className="comparison-table-container">
                <table className="comparison-table">
                  <thead>
                    <tr>
                      <th>VISIT DATE</th>
                      <th>TEMP</th>
                      <th>BLOOD PRESSURE</th>
                      <th>SpO2</th>
                      <th>PULSE</th>
                      <th>DIAGNOSIS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pastVisits.map((v) => (
                      <tr key={v.id} className={v.status === 'Current Visit' ? 'highlight-row' : ''}>
                        <td>
                          <strong>{v.date}</strong>
                          <div style={{ fontSize: '0.725rem', color: 'var(--secondary-text)' }}>{v.doctor}</div>
                        </td>
                        <td>
                          <span className={`trend-val ${v.tempTrend === 'up' ? 'text-red' : ''}`}>
                            {v.temp} {v.tempTrend === 'up' && <TrendingUp size={13} />}
                          </span>
                        </td>
                        <td>
                          <span className={`trend-val ${v.bpTrend === 'elevated' ? 'text-amber' : ''}`}>
                            {v.bp} {v.bpTrend === 'elevated' && <TrendingUp size={13} />}
                          </span>
                        </td>
                        <td>{v.spo2}</td>
                        <td>{v.pulse}</td>
                        <td style={{ fontSize: '0.825rem', fontWeight: 600 }}>{v.diagnosis}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="trend-summary-callout">
                <strong>📈 Clinical Trend Insight:</strong>
                <ul>
                  <li>Body Temperature is <strong>+2.6°F higher</strong> today compared to June 2026 baseline (`98.6°F → 101.2°F`).</li>
                  <li>Blood Pressure has normalized to <strong>120/80 mmHg</strong> (Down from `138/88` in June 2026).</li>
                  <li>Oxygen Saturation (SpO2) remains normal at <strong>98%</strong>.</li>
                </ul>
              </div>
            </div>
          )}

          {/* Section: Uploaded Lab Reports & Scans */}
          <div className="profile-section-box">
            <div className="emr-section-label" style={{ marginBottom: '0.85rem' }}>UPLOADED LAB REPORTS & IMAGING (2)</div>
            
            <div className="report-item-row">
              <div className="report-info">
                <FileText size={18} style={{ color: 'var(--primary-blue)' }} />
                <div>
                  <strong>CBC Report (Complete Blood Count)</strong>
                  <div className="report-meta">Uploaded today • Status: Awaiting Doctor Review</div>
                </div>
              </div>
              <button className="btn-secondary-action" style={{ padding: '0.35rem 0.75rem', fontSize: '0.775rem' }}>View PDF</button>
            </div>

            <div className="report-item-row">
              <div className="report-info">
                <FileText size={18} style={{ color: 'var(--primary-blue)' }} />
                <div>
                  <strong>Chest X-Ray PA View Scan</strong>
                  <div className="report-meta">Uploaded 10 Jun 2026 • Verified Clear</div>
                </div>
              </div>
              <button className="btn-secondary-action" style={{ padding: '0.35rem 0.75rem', fontSize: '0.775rem' }}>View Scan</button>
            </div>
          </div>
        </div>

        {/* 4. Drawer Footer Actions */}
        <div className="drawer-footer">
          <button className="btn-secondary-action" onClick={onClose}>Close Profile</button>
          <button className="btn-primary-action" onClick={() => { onClose(); onStartConsultation(patient); }}>
            Start Consultation <ArrowRight size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
