import React, { useState } from 'react';
import { Users, Clock, CheckCircle2, AlertCircle, FileText, ArrowRight, Play, Eye, Search, Phone, Thermometer, Wind, Heart, ShieldAlert, Activity } from 'lucide-react';

export default function DoctorDashboardView({ dashboardData, onStartConsultation, onOpenPatientProfile }) {
  const { today, nextPatient } = dashboardData;
  const [searchQuery, setSearchQuery] = useState('');

  // Sample Registered Patient Database
  const patientRegistry = [
    { id: 'P-10928', name: 'Rahul Sharma', age: 34, gender: 'Male', phone: '+91 98765 43210', uhid: 'UHID-8921', time: '5:30 PM', reason: 'Fever · 3 days', status: 'Waiting' },
    { id: 'P-10929', name: 'Priya Patel', age: 29, gender: 'Female', phone: '+91 98123 45678', uhid: 'UHID-9012', time: '5:45 PM', reason: 'Severe Headache & Migraine', status: 'Waiting' },
    { id: 'P-10930', name: 'Anand Kumar', age: 45, gender: 'Male', phone: '+91 97654 32109', uhid: 'UHID-7811', time: '6:00 PM', reason: 'Diabetes Follow-up & HbA1c', status: 'Waiting' },
    { id: 'P-10931', name: 'Sunita Devi', age: 52, gender: 'Female', phone: '+91 96543 21098', uhid: 'UHID-6502', time: '5:00 PM', reason: 'Hypertension Checkup', status: 'Completed' }
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
            <Search size={16} className="search-icon" />
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
            <Search size={15} /> Search Patient
          </button>
        </form>
        {searchQuery && (
          <div className="search-results-hint">
            Found <strong>{filteredPatients.length}</strong> matching record(s) for "{searchQuery}"
          </div>
        )}
      </div>

      {/* 2. Calm Top Summary Metric Cards */}
      <div className="doctor-metrics-grid">
        <div className="doc-metric-card">
          <div className="doc-metric-header">
            <span className="metric-title">Today's Patients</span>
            <div className="metric-icon-subtle blue"><Users size={18} /></div>
          </div>
          <div className="doc-metric-val">18</div>
          <div className="doc-metric-sub">Scheduled appointments today</div>
        </div>

        <div className="doc-metric-card">
          <div className="doc-metric-header">
            <span className="metric-title">Waiting in Queue</span>
            <div className="metric-icon-subtle amber"><Clock size={18} /></div>
          </div>
          <div className="doc-metric-val">3</div>
          <div className="doc-metric-sub">In consultation lounge</div>
        </div>

        <div className="doc-metric-card">
          <div className="doc-metric-header">
            <span className="metric-title">Completed</span>
            <div className="metric-icon-subtle green"><CheckCircle2 size={18} /></div>
          </div>
          <div className="doc-metric-val">12</div>
          <div className="doc-metric-sub">Consultations finalized</div>
        </div>

        <div className="doc-metric-card">
          <div className="doc-metric-header">
            <span className="metric-title">Follow-ups Due</span>
            <div className="metric-icon-subtle purple"><AlertCircle size={18} /></div>
          </div>
          <div className="doc-metric-val">5</div>
          <div className="doc-metric-sub">Automated check-ins active</div>
        </div>
      </div>

      {/* 3. PATIENT QUEUE CARD (NEXT PATIENT) */}
      <div className="next-patient-hero-card">
        <div className="hero-top-row">
          <span className="next-patient-badge">NEXT PATIENT IN QUEUE · 5:30 PM</span>
          <span className="uhid-subtle-tag">UHID-8921</span>
        </div>

        <div className="next-patient-content">
          <div className="patient-identity-box">
            <h2 className="patient-name-primary">{nextPatient.name}</h2>
            <span className="patient-meta-inline">{nextPatient.age || 34} · Male</span>
            <span className="patient-phone-inline">+91 98765 43210</span>
          </div>

          {/* Neutral Vitals Strip */}
          <div className="neutral-vitals-grid">
            <div className="vital-row-card">
              <div className="vital-icon-box red"><Thermometer size={16} /></div>
              <div>
                <div className="vital-label-title">Temperature</div>
                <div><strong className="vital-value-main">101.2</strong><span className="vital-unit-sub">°F</span></div>
              </div>
            </div>

            <div className="vital-row-card">
              <div className="vital-icon-box blue"><Activity size={16} /></div>
              <div>
                <div className="vital-label-title">Blood Pressure</div>
                <div><strong className="vital-value-main">120/80</strong><span className="vital-unit-sub">mmHg</span></div>
              </div>
            </div>

            <div className="vital-row-card">
              <div className="vital-icon-box green"><Wind size={16} /></div>
              <div>
                <div className="vital-label-title">SpO2</div>
                <div><strong className="vital-value-main">98</strong><span className="vital-unit-sub">%</span></div>
              </div>
            </div>

            <div className="vital-row-card">
              <div className="vital-icon-box purple"><Heart size={16} /></div>
              <div>
                <div className="vital-label-title">Pulse</div>
                <div><strong className="vital-value-main">84</strong><span className="vital-unit-sub">bpm</span></div>
              </div>
            </div>
          </div>

          {/* Clean Clinical Tags */}
          <div className="clinical-summary-box">
            <div className="complaint-header-label">Chief Complaint</div>
            <div className="clinical-tags-row">
              <span className="clinical-tag">Fever · 3 days</span>
              <span className="clinical-tag">Dry cough</span>
              <span className="clinical-tag">Mild asthma history</span>
              <span className="allergy-tag-warning"><ShieldAlert size={14} /> Allergy: Penicillin</span>
            </div>
          </div>

          {/* Refined Action Buttons */}
          <div className="next-patient-actions">
            <button className="btn-secondary-action" onClick={() => onOpenPatientProfile(nextPatient)}>
              <FileText size={16} /> View Medical File
            </button>
            <button className="btn-primary-action" onClick={() => onStartConsultation(nextPatient)}>
              <Play size={16} /> Start Consultation <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* 4. Refined Appointment Queue Table */}
      <div className="card queue-table-card">
        <div className="card-header">
          <h3>Today's Clinical Appointment Queue</h3>
          <span className="queue-count-badge">{filteredPatients.length} Patient(s)</span>
        </div>

        <table className="doctoros-table">
          <thead>
            <tr>
              <th>Time</th>
              <th>Patient Name</th>
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
                <tr key={patient.id}>
                  <td><strong>{patient.time}</strong></td>
                  <td><strong>{patient.name}</strong> ({patient.age} · {patient.gender.charAt(0)})</td>
                  <td><code>{patient.phone}</code></td>
                  <td><code>{patient.uhid}</code></td>
                  <td>{patient.reason}</td>
                  <td>
                    <span className={`badge-status ${patient.status.toLowerCase()}`}>
                      {patient.status}
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
                <td colSpan={7} style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--secondary-text)' }}>
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
