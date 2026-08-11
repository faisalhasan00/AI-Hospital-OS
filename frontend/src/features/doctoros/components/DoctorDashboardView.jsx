import React, { useState } from 'react';
import { Users, Clock, CheckCircle2, AlertCircle, FileText, Activity, ArrowRight, Play, Eye, Search, Phone, UserCheck, TrendingUp, Thermometer, Wind, Heart, ShieldAlert } from 'lucide-react';

export default function DoctorDashboardView({ dashboardData, onStartConsultation, onOpenPatientProfile }) {
  const { today, nextPatient } = dashboardData;
  const [searchQuery, setSearchQuery] = useState('');

  // Sample Registered Patient Database
  const patientRegistry = [
    { id: 'P-10928', name: 'Rahul Sharma', age: 34, gender: 'Male', phone: '9876543210', uhid: 'UHID-8921', time: '5:30 PM', reason: 'Fever + Cough (3 days)', visits: 3, status: 'Waiting', avatarBg: '#0284c7' },
    { id: 'P-10929', name: 'Priya Patel', age: 29, gender: 'Female', phone: '9812345678', uhid: 'UHID-9012', time: '5:45 PM', reason: 'Severe Headache & Migraine', visits: 1, status: 'Waiting', avatarBg: '#0d9488' },
    { id: 'P-10930', name: 'Anand Kumar', age: 45, gender: 'Male', phone: '9765432109', uhid: 'UHID-7811', time: '6:00 PM', reason: 'Diabetes Follow-up & HbA1c Review', visits: 6, status: 'Waiting', avatarBg: '#7c3aed' },
    { id: 'P-10931', name: 'Sunita Devi', age: 52, gender: 'Female', phone: '9654321098', uhid: 'UHID-6502', time: '5:00 PM', reason: 'Hypertension Checkup', visits: 8, status: 'Completed', avatarBg: '#16a34a' }
  ];

  // Filter queue by search
  const filteredPatients = patientRegistry.filter(patient => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      patient.name.toLowerCase().includes(q) ||
      patient.phone.includes(q) ||
      patient.uhid.toLowerCase().includes(q) ||
      patient.id.toLowerCase().includes(q)
    );
  });

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const match = filteredPatients[0];
    if (match) {
      onOpenPatientProfile(match);
    }
  };

  return (
    <div className="doctor-dashboard-container">
      {/* 1. Patient Search Bar */}
      <div className="patient-search-bar-card">
        <form onSubmit={handleSearchSubmit} className="search-form-row">
          <div className="search-input-wrapper">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Search patient by Phone Number (+91 98765 43210) or Patient UHID (UHID-8921)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="patient-search-input"
            />
            {searchQuery && (
              <button type="button" className="clear-search-btn" onClick={() => setSearchQuery('')}>×</button>
            )}
          </div>
          <button type="submit" className="btn-search-patient">
            <Search size={16} /> Search Patient
          </button>
        </form>
        {searchQuery && (
          <div className="search-results-hint">
            Found <strong>{filteredPatients.length}</strong> matching record(s) for "{searchQuery}"
          </div>
        )}
      </div>

      {/* 2. Visual Doctor Metrics Bar */}
      <div className="doctor-metrics-grid">
        <div className="doc-metric-card">
          <div className="doc-metric-header">
            <div className="metric-icon-circle cyan"><Users size={18} /></div>
            <div>
              <span className="metric-title">Today's Patients</span>
              <div className="metric-trend-pill positive"><TrendingUp size={12} /> +12% vs avg</div>
            </div>
          </div>
          <div className="doc-metric-val">18</div>
          <div className="progress-bar-track">
            <div className="progress-bar-fill cyan" style={{ width: '75%' }}></div>
          </div>
          <div className="doc-metric-sub">75% of daily OPD slot capacity</div>
        </div>

        <div className="doc-metric-card highlight-waiting">
          <div className="doc-metric-header">
            <div className="metric-icon-circle yellow"><Clock size={18} /></div>
            <div>
              <span className="metric-title">Waiting in Queue</span>
              <div className="metric-trend-pill warning">Est. wait: 15 mins</div>
            </div>
          </div>
          <div className="doc-metric-val yellow-text">3</div>
          <div className="progress-bar-track">
            <div className="progress-bar-fill yellow" style={{ width: '25%' }}></div>
          </div>
          <div className="doc-metric-sub">Waiting in consultation lounge</div>
        </div>

        <div className="doc-metric-card">
          <div className="doc-metric-header">
            <div className="metric-icon-circle green"><CheckCircle2 size={18} /></div>
            <div>
              <span className="metric-title">Completed</span>
              <div className="metric-trend-pill positive">Rx Delivered</div>
            </div>
          </div>
          <div className="doc-metric-val green-text">12</div>
          <div className="progress-bar-track">
            <div className="progress-bar-fill green" style={{ width: '66%' }}></div>
          </div>
          <div className="doc-metric-sub">Consultations & Rx finalized</div>
        </div>

        <div className="doc-metric-card">
          <div className="doc-metric-header">
            <div className="metric-icon-circle purple"><AlertCircle size={18} /></div>
            <div>
              <span className="metric-title">Follow-ups Due</span>
              <div className="metric-trend-pill purple">WhatsApp AI</div>
            </div>
          </div>
          <div className="doc-metric-val purple-text">5</div>
          <div className="progress-bar-track">
            <div className="progress-bar-fill purple" style={{ width: '40%' }}></div>
          </div>
          <div className="doc-metric-sub">3-Day recovery check-ins active</div>
        </div>
      </div>

      {/* 3. VISUAL NEXT PATIENT HERO CARD */}
      <div className="next-patient-hero-card">
        <div className="hero-top-row">
          <div className="hero-badge">
            <span className="live-dot animate-pulse"></span> NEXT PATIENT IN QUEUE • 5:30 PM
          </div>
          <span className="uhid-pill-tag"><UserCheck size={14} /> UHID: <strong>UHID-8921</strong></span>
        </div>

        <div className="next-patient-content">
          <div className="patient-identity-box">
            <div className="patient-avatar-badge-large">RS</div>
            <div>
              <h2>{nextPatient.name} <span className="age-gender">Age: {nextPatient.age} • Male</span></h2>
              <div className="patient-phone-sub"><Phone size={14} /> +91 98765 43210</div>
            </div>
          </div>

          {/* Visual Vitals Widgets */}
          <div className="visual-vitals-strip">
            <div className="vitals-widget-chip temp">
              <Thermometer size={16} />
              <div>
                <span className="vital-label">TEMP</span>
                <strong className="vital-value">101.2°F</strong>
              </div>
            </div>

            <div className="vitals-widget-chip bp">
              <Activity size={16} />
              <div>
                <span className="vital-label">BP</span>
                <strong className="vital-value">120/80 mmHg</strong>
              </div>
            </div>

            <div className="vitals-widget-chip spo2">
              <Wind size={16} />
              <div>
                <span className="vital-label">SpO2</span>
                <strong className="vital-value">98%</strong>
              </div>
            </div>

            <div className="vitals-widget-chip pulse">
              <Heart size={16} />
              <div>
                <span className="vital-label">PULSE</span>
                <strong className="vital-value">84 bpm</strong>
              </div>
            </div>
          </div>

          {/* Structured Complaint Tags */}
          <div className="complaint-tags-row">
            <span className="tag-label">Chief Complaint:</span>
            <span className="complaint-chip text-red">#Fever3Days</span>
            <span className="complaint-chip text-amber">#DryCough</span>
            <span className="complaint-chip text-blue">#MildAsthmaHistory</span>
            <span className="complaint-chip warning-red"><ShieldAlert size={14} /> Allergy: Penicillin</span>
          </div>

          {/* Action Buttons */}
          <div className="next-patient-actions">
            <button className="btn-secondary-action" onClick={() => onOpenPatientProfile(nextPatient)}>
              <Eye size={18} /> View Medical File
            </button>
            <button className="btn-primary-action" onClick={() => onStartConsultation(nextPatient)}>
              <Play size={18} /> Start Consultation <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* 4. Visually Enhanced Queue Table */}
      <div className="card queue-table-card">
        <div className="card-header">
          <h3>📋 Today's Clinical Appointment Queue</h3>
          <span className="queue-count-badge">{filteredPatients.length} Patient(s) Shown</span>
        </div>

        <table className="doctoros-table">
          <thead>
            <tr>
              <th>Time</th>
              <th>Patient</th>
              <th>Phone Number</th>
              <th>UHID</th>
              <th>Reason / Symptoms</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPatients.length > 0 ? (
              filteredPatients.map((patient) => (
                <tr key={patient.id} className={patient.status === 'Waiting' && patient.name === 'Rahul Sharma' ? 'active-row' : ''}>
                  <td><strong>{patient.time}</strong></td>
                  <td>
                    <div className="patient-avatar-name-cell">
                      <div className="patient-avatar-circle" style={{ background: patient.avatarBg }}>
                        {patient.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <strong>{patient.name}</strong>
                        <div className="patient-sub-meta">{patient.age} yrs • {patient.gender}</div>
                      </div>
                    </div>
                  </td>
                  <td><code>{patient.phone}</code></td>
                  <td><code>{patient.uhid}</code></td>
                  <td>
                    <span className="queue-reason-badge">{patient.reason}</span>
                  </td>
                  <td>
                    <span className={`badge-status ${patient.status.toLowerCase()}`}>
                      {patient.status === 'Waiting' ? '⏳ Waiting' : '✅ Completed'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button className="btn-table-action" onClick={() => onStartConsultation(patient)}>
                        Consult
                      </button>
                      <button className="btn-table-action secondary" onClick={() => onOpenPatientProfile(patient)}>
                        View File
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                  No matching patients found for "{searchQuery}".
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
