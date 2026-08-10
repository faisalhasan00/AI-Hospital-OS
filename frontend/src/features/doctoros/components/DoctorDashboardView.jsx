import React from 'react';
import { Users, Clock, CheckCircle2, AlertCircle, FileText, Activity, ArrowRight, Play, Eye } from 'lucide-react';

export default function DoctorDashboardView({ dashboardData, onStartConsultation, onOpenPatientProfile }) {
  const { today, nextPatient } = dashboardData;

  return (
    <div className="doctor-dashboard-container">
      {/* 1. Today's Metrics Bar */}
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

      {/* 2. NEXT PATIENT HIGHLIGHT CARD */}
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
              <Activity size={16} /> Previous Visits: <strong>3</strong>
            </div>
            <div className="stat-chip">
              <FileText size={16} /> Lab Reports: <strong>2 Uploaded</strong>
            </div>
            <div className="stat-chip warning-chip">
              <AlertCircle size={16} /> Allergy Flag: <strong>Penicillin</strong>
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

      {/* 3. Today's Patient Queue Table */}
      <div className="card queue-table-card">
        <div className="card-header">
          <h3>📋 Today's Clinical Appointment Queue</h3>
          <span className="queue-count-badge">18 Total Patients</span>
        </div>

        <table className="doctoros-table">
          <thead>
            <tr>
              <th>Time</th>
              <th>Patient Name</th>
              <th>UHID</th>
              <th>Reason / Symptoms</th>
              <th>History</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr className="active-row">
              <td><strong>5:30 PM</strong></td>
              <td><strong>Rahul Sharma</strong> (34/M)</td>
              <td><code>UHID-8921</code></td>
              <td>Fever + Cough (3 days)</td>
              <td>3 Past Visits</td>
              <td><span className="badge-status waiting">Waiting</span></td>
              <td>
                <button className="btn-table-action" onClick={() => onStartConsultation(nextPatient)}>
                  Consult Now
                </button>
              </td>
            </tr>
            <tr>
              <td>5:45 PM</td>
              <td>Priya Patel (29/F)</td>
              <td><code>UHID-9012</code></td>
              <td>Severe Headache & Migraine</td>
              <td>1 Past Visit</td>
              <td><span className="badge-status waiting">Waiting</span></td>
              <td>
                <button className="btn-table-action secondary" onClick={() => onOpenPatientProfile({ name: 'Priya Patel', age: 29 })}>
                  View File
                </button>
              </td>
            </tr>
            <tr>
              <td>6:00 PM</td>
              <td>Anand Kumar (45/M)</td>
              <td><code>UHID-7811</code></td>
              <td>Diabetes Follow-up & HbA1c Review</td>
              <td>6 Past Visits</td>
              <td><span className="badge-status waiting">Waiting</span></td>
              <td>
                <button className="btn-table-action secondary" onClick={() => onOpenPatientProfile({ name: 'Anand Kumar', age: 45 })}>
                  View File
                </button>
              </td>
            </tr>
            <tr>
              <td>5:00 PM</td>
              <td>Sunita Devi (52/F)</td>
              <td><code>UHID-6502</code></td>
              <td>Hypertension Checkup</td>
              <td>8 Past Visits</td>
              <td><span className="badge-status completed">Completed</span></td>
              <td>
                <button className="btn-table-action secondary" onClick={() => onOpenPatientProfile({ name: 'Sunita Devi', age: 52 })}>
                  View Rx
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
