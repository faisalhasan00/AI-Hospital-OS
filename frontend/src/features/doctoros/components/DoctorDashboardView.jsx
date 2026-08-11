import React, { useState } from 'react';
import { Users, Clock, CheckCircle2, AlertCircle, FileText, Activity, ArrowRight, Play, Eye, Search, Phone, UserCheck } from 'lucide-react';

export default function DoctorDashboardView({ dashboardData, onStartConsultation, onOpenPatientProfile }) {
  const { today, nextPatient } = dashboardData;
  const [searchQuery, setSearchQuery] = useState('');

  // Sample Registered Patient Database for Search
  const patientRegistry = [
    { id: 'P-10928', name: 'Rahul Sharma', age: 34, gender: 'Male', phone: '9876543210', uhid: 'UHID-8921', time: '5:30 PM', reason: 'Fever + Cough (3 days)', visits: 3, status: 'Waiting' },
    { id: 'P-10929', name: 'Priya Patel', age: 29, gender: 'Female', phone: '9812345678', uhid: 'UHID-9012', time: '5:45 PM', reason: 'Severe Headache & Migraine', visits: 1, status: 'Waiting' },
    { id: 'P-10930', name: 'Anand Kumar', age: 45, gender: 'Male', phone: '9765432109', uhid: 'UHID-7811', time: '6:00 PM', reason: 'Diabetes Follow-up & HbA1c Review', visits: 6, status: 'Waiting' },
    { id: 'P-10931', name: 'Sunita Devi', age: 52, gender: 'Female', phone: '9654321098', uhid: 'UHID-6502', time: '5:00 PM', reason: 'Hypertension Checkup', visits: 8, status: 'Completed' }
  ];

  // Filtered queue based on Phone, UHID, or Name
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
    
    // Find best match and open profile drawer
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

      {/* 2. Today's Metrics Bar */}
      <div className="doctor-metrics-grid">
        <div className="doc-metric-card">
          <div className="doc-metric-header">
            <Users className="metric-icon cyan" size={20} />
            <span>Today's Patients</span>
          </div>
          <div className="doc-metric-val">18</div>
          <div className="doc-metric-sub">Scheduled appointments today</div>
        </div>

        <div className="doc-metric-card highlight-waiting">
          <div className="doc-metric-header">
            <Clock className="metric-icon yellow" size={20} />
            <span>Waiting in Queue</span>
          </div>
          <div className="doc-metric-val yellow-text">3</div>
          <div className="doc-metric-sub">Ready in waiting room</div>
        </div>

        <div className="doc-metric-card">
          <div className="doc-metric-header">
            <CheckCircle2 className="metric-icon green" size={20} />
            <span>Completed</span>
          </div>
          <div className="doc-metric-val green-text">12</div>
          <div className="doc-metric-sub">Consultations finalized</div>
        </div>

        <div className="doc-metric-card">
          <div className="doc-metric-header">
            <AlertCircle className="metric-icon purple" size={20} />
            <span>Follow-ups Due</span>
          </div>
          <div className="doc-metric-val purple-text">5</div>
          <div className="doc-metric-sub">Automated check-ins active</div>
        </div>
      </div>

      {/* 3. NEXT PATIENT HIGHLIGHT CARD */}
      <div className="next-patient-hero-card">
        <div className="hero-badge">
          <span className="live-dot animate-pulse"></span> NEXT PATIENT IN QUEUE • 5:30 PM
        </div>

        <div className="next-patient-content">
          <div className="patient-identity-box">
            <div className="patient-avatar-badge">RS</div>
            <div>
              <h2>{nextPatient.name} <span className="age-gender">Age: {nextPatient.age} • Male</span></h2>
              <div className="chief-complaint-pill">
                <strong>Reason for visit:</strong> {nextPatient.aiSummary || 'Fever + cough for 3 days'}
              </div>
            </div>
          </div>

          <div className="quick-stats-row">
            <div className="stat-chip">
              <Phone size={14} /> +91 98765 43210
            </div>
            <div className="stat-chip">
              <UserCheck size={14} /> UHID: <strong>UHID-8921</strong>
            </div>
            <div className="stat-chip">
              <Activity size={14} /> Previous Visits: <strong>3</strong>
            </div>
            <div className="stat-chip">
              <FileText size={14} /> Lab Reports: <strong>2 Uploaded</strong>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="next-patient-actions">
            <button className="btn-secondary-action" onClick={() => onOpenPatientProfile(nextPatient)}>
              <Eye size={18} /> Open Patient Profile
            </button>
            <button className="btn-primary-action" onClick={() => onStartConsultation(nextPatient)}>
              <Play size={18} /> Start Consultation <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* 4. Today's Patient Queue Table */}
      <div className="card queue-table-card">
        <div className="card-header">
          <h3>📋 Today's Clinical Appointment Queue</h3>
          <span className="queue-count-badge">{filteredPatients.length} Patient(s) Shown</span>
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
                <tr key={patient.id} className={patient.status === 'Waiting' && patient.name === 'Rahul Sharma' ? 'active-row' : ''}>
                  <td><strong>{patient.time}</strong></td>
                  <td><strong>{patient.name}</strong> ({patient.age}/{patient.gender.charAt(0)})</td>
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
                        Consult Now
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
                  No matching patients found for "{searchQuery}". Try searching by phone number (e.g. 9876543210) or UHID (e.g. UHID-8921).
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
