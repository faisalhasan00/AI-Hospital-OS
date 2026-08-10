import React, { useState } from 'react';
import './DoctorOSWorkspace.css';
import RoleSwitcherHeader from './components/RoleSwitcherHeader.jsx';
import DoctorDashboardView from './components/DoctorDashboardView.jsx';
import PatientProfileDrawer from './components/PatientProfileDrawer.jsx';
import ConsultationWorkbench from './components/ConsultationWorkbench.jsx';
import FollowupAlertsInbox from './components/FollowupAlertsInbox.jsx';

export default function DoctorOSWorkspace({ onSignOut }) {
  const [activeRole, setActiveRole] = useState('doctor'); // 11 roles available
  const [doctorViewMode, setDoctorViewMode] = useState('dashboard'); // 'dashboard', 'consultation', 'alerts'
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Front Desk / WhatsApp Simulator State
  const [userChatInput, setUserChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([
    { sender: 'AI Front Desk', text: 'Hello! Welcome to ABC Clinic. How can I help you with your appointment today?', time: '5:28 PM' }
  ]);
  const [isAiProcessing, setIsAiProcessing] = useState(false);

  const API_BASE = 'http://localhost:5000/api/doctoros';

  // Sample Patient Data
  const defaultNextPatient = {
    id: 'P-10928',
    name: 'Rahul Sharma',
    age: 34,
    gender: 'Male',
    time: '5:30 PM',
    previousVisits: 3,
    reportsUploaded: 2,
    aiSummary: 'High grade fever for 3 days with dry cough. Chest clear on auscultation. History of mild asthma.'
  };

  const handleStartConsultation = (patient) => {
    setSelectedPatient(patient || defaultNextPatient);
    setDoctorViewMode('consultation');
  };

  const handleOpenPatientProfile = (patient) => {
    setSelectedPatient(patient || defaultNextPatient);
    setIsDrawerOpen(true);
  };

  // Front Desk Submission
  const handleFrontDeskSubmit = async (e) => {
    e.preventDefault();
    if (!userChatInput.trim()) return;

    const userText = userChatInput;
    setUserChatInput('');
    setChatMessages((prev) => [...prev, { sender: 'Patient', text: userText, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    setIsAiProcessing(true);

    try {
      const res = await fetch(`${API_BASE}/front-desk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userMessage: userText, channel: 'whatsapp' })
      });
      const data = await res.json();

      setChatMessages((prev) => [
        ...prev,
        {
          sender: 'AI Front Desk',
          text: data.response_text || 'Thank you. Processing your request.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          intent: data.intent,
          toolCall: data.tool_call
        }
      ]);
    } catch (err) {
      console.error('Front Desk Error:', err);
    } finally {
      setIsAiProcessing(false);
    }
  };

  return (
    <div className="doctoros-container">
      {/* 1. Global Role Switcher Header */}
      <RoleSwitcherHeader activeRole={activeRole} onSelectRole={setActiveRole} onSignOut={onSignOut} />

      {/* 2. DOCTOR WORKSPACE (PRIMARY FOCUS) */}
      {activeRole === 'doctor' && (
        <main className="doctoros-main-content">
          {/* Sub Navigation Bar for Doctor */}
          <div className="doctor-subnav">
            <button className={`subnav-btn ${doctorViewMode === 'dashboard' ? 'active' : ''}`} onClick={() => setDoctorViewMode('dashboard')}>
              📊 Today's Patients & Queue (18)
            </button>
            <button className={`subnav-btn ${doctorViewMode === 'consultation' ? 'active' : ''}`} onClick={() => setDoctorViewMode('consultation')}>
              🎙️ Live Consultation & AI Scribe
            </button>
            <button className={`subnav-btn ${doctorViewMode === 'alerts' ? 'active' : ''}`} onClick={() => setDoctorViewMode('alerts')}>
              📱 Follow-up Recovery Alerts (2)
            </button>
          </div>

          {/* Render Views based on Doctor Mode */}
          {doctorViewMode === 'dashboard' && (
            <DoctorDashboardView
              dashboardData={{ today: {}, nextPatient: defaultNextPatient }}
              onStartConsultation={handleStartConsultation}
              onOpenPatientProfile={handleOpenPatientProfile}
            />
          )}

          {doctorViewMode === 'consultation' && (
            <ConsultationWorkbench
              patient={selectedPatient || defaultNextPatient}
              onBack={() => setDoctorViewMode('dashboard')}
              onCompleteConsultation={() => setDoctorViewMode('dashboard')}
            />
          )}

          {doctorViewMode === 'alerts' && (
            <FollowupAlertsInbox />
          )}
        </main>
      )}

      {/* 3. RECEPTIONIST ROLE VIEW */}
      {activeRole === 'receptionist' && (
        <main className="doctoros-main-content">
          <div className="card">
            <h3>📋 Receptionist Desk & Walk-in Queue Manager</h3>
            <p style={{ color: '#94a3b8' }}>Register walk-in patients, manage appointment queue, collect payments, and review AI front desk tasks.</p>
            <div className="queue-table-card">
              <table className="doctoros-table">
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>Patient</th>
                    <th>Doctor</th>
                    <th>Booking Channel</th>
                    <th>Payment</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>05:30 PM</td>
                    <td>Rahul Sharma</td>
                    <td>Dr. Ahmed</td>
                    <td><span className="badge-channel">AI Voice</span></td>
                    <td>₹500 (Paid UPI)</td>
                    <td><span className="badge-status waiting">Waiting in Lounge</span></td>
                  </tr>
                  <tr>
                    <td>05:45 PM</td>
                    <td>Priya Patel</td>
                    <td>Dr. Ahmed</td>
                    <td><span className="badge-channel wa">WhatsApp</span></td>
                    <td>₹500 (Pending)</td>
                    <td><span className="badge-status waiting">Waiting</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </main>
      )}

      {/* 4. NURSE ROLE VIEW */}
      {activeRole === 'nurse' && (
        <main className="doctoros-main-content">
          <div className="card">
            <h3>👩‍⚕️ Nurse Vitals & Patient Prep Station</h3>
            <p style={{ color: '#94a3b8' }}>Record patient vitals (Blood Pressure, Heart Rate, SpO2, Temperature, Weight) before doctor consultation.</p>
            <div className="profile-grid" style={{ marginTop: '1rem' }}>
              <div><strong>Patient:</strong> Rahul Sharma (34/M)</div>
              <div><label>BP (mmHg):</label> <input type="text" defaultValue="120/80" style={{ background: '#0f172a', border: '1px solid #334155', color: '#fff', padding: '4px 8px', borderRadius: '4px' }} /></div>
              <div><label>SpO2 (%):</label> <input type="text" defaultValue="98%" style={{ background: '#0f172a', border: '1px solid #334155', color: '#fff', padding: '4px 8px', borderRadius: '4px' }} /></div>
              <div><label>Temp (°F):</label> <input type="text" defaultValue="101°F" style={{ background: '#0f172a', border: '1px solid #334155', color: '#fff', padding: '4px 8px', borderRadius: '4px' }} /></div>
            </div>
          </div>
        </main>
      )}

      {/* 5. LAB TECHNICIAN ROLE VIEW */}
      {activeRole === 'lab_tech' && (
        <main className="doctoros-main-content">
          <div className="card">
            <h3>🧪 Lab Technician Test & Sample Collection Station</h3>
            <p style={{ color: '#94a3b8' }}>View doctor-ordered lab tests, collect blood samples, and upload PDF/Scan reports.</p>
            <div className="report-item-row" style={{ marginTop: '1rem' }}>
              <div>
                <strong>Rahul Sharma (UHID-8921)</strong>
                <div>Ordered Test: <strong>CBC (Complete Blood Count)</strong></div>
              </div>
              <button className="btn-primary-action" style={{ padding: '6px 12px', fontSize: '0.85rem' }}>Upload Lab PDF</button>
            </div>
          </div>
        </main>
      )}

      {/* 6. PHARMACIST ROLE VIEW */}
      {activeRole === 'pharmacist' && (
        <main className="doctoros-main-content">
          <div className="card">
            <h3>💊 Pharmacy & Medicine Dispensing Counter</h3>
            <p style={{ color: '#94a3b8' }}>View approved doctor prescriptions and dispense medications to patients.</p>
            <div className="soap-draft-container" style={{ marginTop: '1rem' }}>
              <h4>Rahul Sharma — Approved Prescription</h4>
              <div className="rx-item">1. <strong>Paracetamol 650mg</strong> - 1 tablet (1-0-1) for 3 days</div>
              <div className="rx-item">2. <strong>Ambroxol Syrup</strong> - 10ml (0-0-1) for 5 days</div>
              <button className="btn-approve" style={{ marginTop: '1rem' }}>Dispense Medicines</button>
            </div>
          </div>
        </main>
      )}

      {/* 7. ACCOUNTANT ROLE VIEW */}
      {activeRole === 'accountant' && (
        <main className="doctoros-main-content">
          <div className="card">
            <h3>💰 Billing & Expenses Dashboard</h3>
            <p style={{ color: '#94a3b8' }}>Manage consultation fees, lab invoices, pharmacy billing, and daily revenue reports.</p>
            <div className="doc-metric-val green-text">₹48,500 Today</div>
          </div>
        </main>
      )}

      {/* 8. CLINIC MANAGER ROLE VIEW */}
      {activeRole === 'manager' && (
        <main className="doctoros-main-content">
          <div className="card">
            <h3>👨‍💼 Clinic Manager Operations Console</h3>
            <p style={{ color: '#94a3b8' }}>Doctor availability schedules, staff rosters, patient retention rate, and clinic performance metrics.</p>
          </div>
        </main>
      )}

      {/* 9. AI RECEPTIONIST ROLE VIEW */}
      {activeRole === 'ai_receptionist' && (
        <main className="doctoros-main-content">
          <div className="card frontdesk-container">
            <h3>🤖 AI Front Desk Telephony & WhatsApp Simulator</h3>
            <p style={{ color: '#94a3b8' }}>Simulate patient voice calls & WhatsApp messages with real-time tool execution.</p>
            
            <div className="chat-window">
              {chatMessages.map((msg, idx) => (
                <div key={idx} className={`chat-bubble ${msg.sender === 'Patient' ? 'patient' : 'ai'}`}>
                  <div className="chat-sender">{msg.sender} <span className="chat-time">{msg.time}</span></div>
                  <div className="chat-text">{msg.text}</div>
                </div>
              ))}
              {isAiProcessing && <div className="typing-indicator">AI Front Desk executing tool logic...</div>}
            </div>

            <form onSubmit={handleFrontDeskSubmit} className="chat-form">
              <input
                type="text"
                placeholder="Type message e.g. Book appointment with Dr. Ahmed tomorrow 5:30 PM..."
                value={userChatInput}
                onChange={(e) => setUserChatInput(e.target.value)}
              />
              <button type="submit" disabled={isAiProcessing}>Send</button>
            </form>
          </div>
        </main>
      )}

      {/* 10. AI FOLLOW-UP AGENT ROLE VIEW */}
      {activeRole === 'ai_followup' && (
        <main className="doctoros-main-content">
          <div className="card">
            <h3>🤖 Automated AI Follow-up Check-in Agent</h3>
            <p style={{ color: '#94a3b8' }}>Executes background 3-day recovery check-ins and triages patient replies into IMPROVING, NEEDS_REVIEW, or EMERGENCY.</p>
            <FollowupAlertsInbox />
          </div>
        </main>
      )}

      {/* 11. PATIENT PORTAL ROLE VIEW */}
      {activeRole === 'patient' && (
        <main className="doctoros-main-content">
          <div className="card">
            <h3>👤 Patient Health Portal</h3>
            <p style={{ color: '#94a3b8' }}>View upcoming appointments, download doctor prescriptions, and upload lab reports.</p>
            <div className="approval-success-banner" style={{ marginTop: '1rem' }}>
              <h4>Upcoming Appointment: Dr. Ahmed</h4>
              <p>Date: Today, 08 Aug 2026 at 5:30 PM</p>
              <button className="btn-view-report" style={{ marginTop: '0.5rem' }}>Download Prescription PDF</button>
            </div>
          </div>
        </main>
      )}

      {/* 12. SUPER ADMIN ROLE VIEW */}
      {activeRole === 'super_admin' && (
        <main className="doctoros-main-content">
          <div className="card">
            <h3>🔐 Super Admin SaaS Platform Dashboard</h3>
            <p style={{ color: '#94a3b8' }}>Manage multi-tenant clinics, SaaS subscription billing, system health, and API integrations.</p>
          </div>
        </main>
      )}

      {/* Patient Profile Drawer */}
      {isDrawerOpen && (
        <PatientProfileDrawer
          patient={selectedPatient || defaultNextPatient}
          onClose={() => setIsDrawerOpen(false)}
          onStartConsultation={handleStartConsultation}
        />
      )}
    </div>
  );
}
