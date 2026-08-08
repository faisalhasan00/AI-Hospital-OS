import React, { useState, useEffect } from 'react';
import './DoctorOSWorkspace.css';

export default function DoctorOSWorkspace() {
  const [activeTab, setActiveTab] = useState('doctor'); // 'doctor', 'frontdesk', 'reception', 'analytics'
  const [language, setLanguage] = useState('en');
  
  // Dashboard Metrics
  const [dashboardData, setDashboardData] = useState({
    today: {
      appointmentsCount: 48,
      completedCount: 35,
      waitingCount: 6,
      cancelledCount: 3,
      noShowCount: 4,
      aiCallsHandled: 31,
      whatsappConversations: 67,
      followupsDue: 18,
      revenueInr: 48500
    },
    nextPatient: {
      name: 'Rahul Sharma',
      age: 34,
      time: '5:30 PM',
      previousVisits: 4,
      reportsUploaded: 3,
      aiSummary: 'Fever for 3 days with cough. Chest clear on auscultation. History of mild asthma.'
    }
  });

  // Front Desk Voice/WhatsApp Simulator State
  const [userChatInput, setUserChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([
    { sender: 'AI Front Desk', text: 'Hello! Welcome to ABC Clinic. How can I help you today?', time: '5:28 PM', intent: 'GREETING' }
  ]);
  const [isAiProcessing, setIsAiProcessing] = useState(false);

  // Scribe State
  const [consultTranscript, setConsultTranscript] = useState(
    "Doctor: Hello Rahul, what brings you in today?\nPatient: Doctor, I have had a high fever for 3 days along with a severe cough.\nDoctor: Let me check your temperature and listen to your lungs. Temperature is 101°F, lungs sound clear. I will prescribe Paracetamol 650mg twice daily for 3 days and Ambroxol syrup. Take rest and drink warm water."
  );
  const [soapDraft, setSoapDraft] = useState(null);
  const [isScribing, setIsScribing] = useState(false);
  const [approvedStatus, setApprovedStatus] = useState(null);

  // Follow-up Simulator State
  const [followupInput, setFollowupInput] = useState('I am feeling much better now, fever is gone!');
  const [followupResult, setFollowupResult] = useState(null);

  const API_BASE = 'http://localhost:5000/api/doctoros';

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
        body: JSON.stringify({ userMessage: userText, language, channel: 'whatsapp' })
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

  // Generate Scribe SOAP Draft
  const handleGenerateScribeDraft = async () => {
    setIsScribing(true);
    setSoapDraft(null);
    setApprovedStatus(null);
    try {
      const res = await fetch(`${API_BASE}/scribe/draft`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript: consultTranscript, patientId: 'P-10928', doctorId: 'DOC-401' })
      });
      const data = await res.json();
      setSoapDraft(data.consultation);
    } catch (err) {
      console.error('Scribe Error:', err);
    } finally {
      setIsScribing(false);
    }
  };

  // Doctor Approve Consultation
  const handleApproveConsultation = async () => {
    if (!soapDraft) return;
    try {
      const res = await fetch(`${API_BASE}/consultation/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          consultationId: soapDraft.id,
          finalDiagnosis: soapDraft.draft_assessment,
          finalPlan: soapDraft.draft_plan,
          prescriptionItems: soapDraft.proposed_prescription,
          followupDays: 3
        })
      });
      const data = await res.json();
      setApprovedStatus(data.data);
    } catch (err) {
      console.error('Approval Error:', err);
    }
  };

  // Follow-up Simulator
  const handleSimulateFollowup = async () => {
    try {
      const res = await fetch(`${API_BASE}/followup/response`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patientMessage: followupInput, patientId: 'P-10928' })
      });
      const data = await res.json();
      setFollowupResult(data);
    } catch (err) {
      console.error('Followup Error:', err);
    }
  };

  return (
    <div className="doctoros-container">
      {/* Top Banner Header */}
      <header className="doctoros-header">
        <div className="brand-logo">
          <span className="logo-icon">🩺</span>
          <div>
            <h1>DoctorOS <span className="badge-saas">Multi-Tenant SaaS</span></h1>
            <p className="subtitle">AI-Powered Clinic Operating System</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <nav className="doctoros-nav">
          <button className={`nav-btn ${activeTab === 'doctor' ? 'active' : ''}`} onClick={() => setActiveTab('doctor')}>
            👨‍⚕️ Doctor Workspace
          </button>
          <button className={`nav-btn ${activeTab === 'frontdesk' ? 'active' : ''}`} onClick={() => setActiveTab('frontdesk')}>
            🤖 AI Front Desk (Voice/WA)
          </button>
          <button className={`nav-btn ${activeTab === 'reception' ? 'active' : ''}`} onClick={() => setActiveTab('reception')}>
            📋 Reception Queue & Follow-ups
          </button>
          <button className={`nav-btn ${activeTab === 'analytics' ? 'active' : ''}`} onClick={() => setActiveTab('analytics')}>
            📊 Clinic Analytics
          </button>
        </nav>
      </header>

      {/* Main Container Content */}
      <main className="doctoros-main">
        {/* 1. DOCTOR WORKSPACE TAB */}
        {activeTab === 'doctor' && (
          <div className="workspace-grid">
            {/* Left Column: Pre-consultation AI Summary & Patient Timeline */}
            <div className="card summary-card">
              <div className="card-header">
                <h3>⚡ Next Patient AI Summary</h3>
                <span className="badge-time">{dashboardData.nextPatient.time}</span>
              </div>
              <div className="patient-profile">
                <h2>{dashboardData.nextPatient.name} <span className="age-tag">{dashboardData.nextPatient.age} yrs</span></h2>
                <div className="metrics-row">
                  <span>Previous Visits: <strong>{dashboardData.nextPatient.previousVisits}</strong></span>
                  <span>Reports: <strong>{dashboardData.nextPatient.reportsUploaded}</strong></span>
                </div>
              </div>

              <div className="ai-summary-box">
                <h4>AI Patient History Brief:</h4>
                <p>{dashboardData.nextPatient.aiSummary}</p>
                <div className="provenance-tag">Data Source: Patient Intake + Verified Records</div>
              </div>

              {/* Timeline list */}
              <div className="timeline-section">
                <h4>Consultation History Timeline</h4>
                <div className="timeline-item">
                  <div className="t-date">08 Aug 2026</div>
                  <div className="t-desc">Fever + Cough (Today's Visit)</div>
                </div>
                <div className="timeline-item">
                  <div className="t-date">10 Jun 2026</div>
                  <div className="t-desc">Cough & Chest X-Ray (Clear)</div>
                </div>
              </div>
            </div>

            {/* Right Column: AI Consultation Scribe & Approval */}
            <div className="card scribe-card">
              <div className="card-header">
                <h3>🎙️ AI Consultation Scribe</h3>
                <button className="btn-scribing" onClick={handleGenerateScribeDraft} disabled={isScribing}>
                  {isScribing ? 'Generating SOAP Draft...' : '✨ Generate Draft SOAP Note'}
                </button>
              </div>

              <div className="transcript-box">
                <label>Consultation Audio Transcript:</label>
                <textarea
                  rows={4}
                  value={consultTranscript}
                  onChange={(e) => setConsultTranscript(e.target.value)}
                />
              </div>

              {soapDraft && (
                <div className="soap-draft-container">
                  <div className="soap-header">
                    <h4>AI Draft Note (Awaiting Doctor Review & Approval)</h4>
                    <span className="badge-draft">DRAFT</span>
                  </div>

                  <div className="soap-grid">
                    <div>
                      <label>Chief Complaint:</label>
                      <input type="text" defaultValue={soapDraft.draft_chief_complaint} />
                    </div>
                    <div>
                      <label>Assessment / Diagnosis:</label>
                      <input type="text" defaultValue={soapDraft.draft_assessment} />
                    </div>
                  </div>

                  <div className="rx-proposal">
                    <h4>Proposed Prescription:</h4>
                    {soapDraft.proposed_prescription && soapDraft.proposed_prescription.map((rx, idx) => (
                      <div className="rx-item" key={idx}>
                        <strong>{rx.medicine_name}</strong> - {rx.dosage} ({rx.frequency}) for {rx.duration} [{rx.instructions}]
                      </div>
                    ))}
                  </div>

                  <div className="approval-actions">
                    <button className="btn-approve" onClick={handleApproveConsultation}>
                      ✅ Edit & Approve Prescription
                    </button>
                  </div>
                </div>
              )}

              {approvedStatus && (
                <div className="approval-success-banner">
                  <h4>🎉 Consultation Approved & Locked!</h4>
                  <p>Prescription PDF generated: <a href={approvedStatus.prescription.pdf_url} target="_blank" rel="noreferrer">{approvedStatus.prescription.pdf_url}</a></p>
                  <p>Automated WhatsApp Follow-up scheduled for: <strong>{new Date(approvedStatus.followup_job.scheduled_for).toLocaleDateString()}</strong></p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 2. AI FRONT DESK TAB */}
        {activeTab === 'frontdesk' && (
          <div className="card frontdesk-container">
            <div className="card-header">
              <h3>🤖 AI Front Desk Receptionist (Voice & WhatsApp)</h3>
              <div className="lang-selector">
                <span>Language:</span>
                <button className={`lang-btn ${language === 'en' ? 'active' : ''}`} onClick={() => setLanguage('en')}>English</button>
                <button className={`lang-btn ${language === 'hi' ? 'active' : ''}`} onClick={() => setLanguage('hi')}>Hindi</button>
                <button className={`lang-btn ${language === 'te' ? 'active' : ''}`} onClick={() => setLanguage('te')}>Telugu</button>
              </div>
            </div>

            <div className="chat-window">
              {chatMessages.map((msg, idx) => (
                <div key={idx} className={`chat-bubble ${msg.sender === 'Patient' ? 'patient' : 'ai'}`}>
                  <div className="chat-sender">{msg.sender} <span className="chat-time">{msg.time}</span></div>
                  <div className="chat-text">{msg.text}</div>
                  {msg.toolCall && (
                    <div className="tool-call-badge">
                      🛠️ Executed Tool: <code>{msg.toolCall.name}</code>
                    </div>
                  )}
                </div>
              ))}
              {isAiProcessing && <div className="typing-indicator">AI Front Desk is processing tool logic...</div>}
            </div>

            <form onSubmit={handleFrontDeskSubmit} className="chat-form">
              <input
                type="text"
                placeholder={language === 'te' ? 'నమస్కారం, అపాయింట్‌మెంట్ బుక్ చేయండి...' : language === 'hi' ? 'नमस्ते, अवाइंटमेंट बुक करें...' : 'Type message e.g. Book appointment with Dr. Ahmed tomorrow 5:30 PM...'}
                value={userChatInput}
                onChange={(e) => setUserChatInput(e.target.value)}
              />
              <button type="submit" disabled={isAiProcessing}>Send</button>
            </form>
          </div>
        )}

        {/* 3. RECEPTION QUEUE & FOLLOW-UPS */}
        {activeTab === 'reception' && (
          <div className="workspace-grid">
            <div className="card queue-card">
              <h3>📋 Today's Queue & Appointments</h3>
              <table className="doctoros-table">
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>Patient</th>
                    <th>Doctor</th>
                    <th>Channel</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>05:00 PM</td>
                    <td>Rahul Sharma</td>
                    <td>Dr. Ahmed</td>
                    <td><span className="badge-channel">AI Voice</span></td>
                    <td><span className="badge-status waiting">Waiting</span></td>
                  </tr>
                  <tr>
                    <td>05:30 PM</td>
                    <td>Priya Patel</td>
                    <td>Dr. Ahmed</td>
                    <td><span className="badge-channel wa">WhatsApp</span></td>
                    <td><span className="badge-status scheduled">Scheduled</span></td>
                  </tr>
                  <tr>
                    <td>06:00 PM</td>
                    <td>Anand Kumar</td>
                    <td>Dr. Verma</td>
                    <td><span className="badge-channel walkin">Walk-in</span></td>
                    <td><span className="badge-status completed">Completed</span></td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="card followup-card">
              <h3>📱 Automated 3-Day Follow-up Simulator</h3>
              <p>Simulate patient WhatsApp response to automated check-in:</p>
              
              <div className="followup-input-group">
                <input
                  type="text"
                  value={followupInput}
                  onChange={(e) => setFollowupInput(e.target.value)}
                />
                <button onClick={handleSimulateFollowup}>Test Follow-up Response</button>
              </div>

              {followupResult && (
                <div className="followup-result-box">
                  <h4>Status Tag: <span className={`status-tag ${followupResult.followup_status.toLowerCase()}`}>{followupResult.followup_status}</span></h4>
                  <p><strong>AI Reply:</strong> {followupResult.reply_text}</p>
                  <p><strong>Action Required:</strong> {followupResult.action_required}</p>
                  {followupResult.escalation && <div className="alert-red">🚨 Escalation Alert Triggered!</div>}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 4. CLINIC ANALYTICS TAB */}
        {activeTab === 'analytics' && (
          <div className="analytics-grid">
            <div className="metric-card">
              <h4>Today Appointments</h4>
              <div className="metric-val">{dashboardData.today.appointmentsCount}</div>
              <div className="metric-sub">{dashboardData.today.completedCount} Completed</div>
            </div>

            <div className="metric-card">
              <h4>AI Calls Handled</h4>
              <div className="metric-val">{dashboardData.today.aiCallsHandled}</div>
              <div className="metric-sub">0 Human Escalations Needed</div>
            </div>

            <div className="metric-card">
              <h4>WhatsApp Messages</h4>
              <div className="metric-val">{dashboardData.today.whatsappConversations}</div>
              <div className="metric-sub">Auto Booking & Rx Delivery</div>
            </div>

            <div className="metric-card">
              <h4>Today Revenue</h4>
              <div className="metric-val">₹{dashboardData.today.revenueInr.toLocaleString()}</div>
              <div className="metric-sub">Consultation & Services</div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
