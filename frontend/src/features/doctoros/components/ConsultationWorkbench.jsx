import React, { useState } from 'react';
import { Plus, Trash2, FileCheck, ArrowLeft, Thermometer, Activity, Wind, Heart, ShieldAlert, Check } from 'lucide-react';

export default function ConsultationWorkbench({ patient, onBack, onCompleteConsultation }) {
  // Scribe SOAP State
  const [soapData, setSoapData] = useState({
    chiefComplaint: 'High fever for 3 days accompanied by dry cough',
    historyOfPresentIllness: 'Patient reports high fever for 3 days with dry cough. No shortness of breath or chest pain reported.',
    examinationFindings: 'Body temp: 101.2°F, BP: 120/80, SpO2: 98%. Chest clear on auscultation.',
    diagnosis: 'Acute Upper Respiratory Tract Infection',
    treatmentPlan: 'Symptomatic management, hydration, oral medications, 3 days rest.'
  });

  // Prescription Line Items
  const [prescriptionItems, setPrescriptionItems] = useState([
    { id: 1, name: 'Paracetamol', dosage: '650mg', frequency: '1-0-1 (Twice daily)', duration: '3 days', instructions: 'After food' },
    { id: 2, name: 'Ambroxol Syrup', dosage: '10ml', frequency: '0-0-1 (Bedtime)', duration: '5 days', instructions: 'After food with warm water' }
  ]);

  // Lab Tests Ordered
  const [orderedTests, setOrderedTests] = useState(['CBC (Complete Blood Count)']);

  // Follow-up Days
  const [followupDays, setFollowupDays] = useState(3);

  // Processing & Approval State
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [approvalResult, setApprovalResult] = useState(null);

  const API_BASE = 'http://localhost:5000/api/doctoros';

  const handleAddMedicine = () => {
    setPrescriptionItems([
      ...prescriptionItems,
      { id: Date.now(), name: '', dosage: '500mg', frequency: '1-0-1', duration: '5 days', instructions: 'After food' }
    ]);
  };

  const handleRemoveMedicine = (id) => {
    setPrescriptionItems(prescriptionItems.filter(item => item.id !== id));
  };

  const handleMedicineChange = (id, field, value) => {
    setPrescriptionItems(prescriptionItems.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const handleApprove = async () => {
    setIsAiProcessing(true);
    try {
      const res = await fetch(`${API_BASE}/consultation/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          consultationId: 'CONS-' + Math.floor(100000 + Math.random() * 900000),
          finalDiagnosis: soapData.diagnosis,
          finalPlan: soapData.treatmentPlan,
          prescriptionItems,
          orderedTests,
          followupDays
        })
      });
      const data = await res.json();
      setApprovalResult(data.data);
      if (onCompleteConsultation) {
        onCompleteConsultation(data.data);
      }
    } catch (err) {
      console.error('Approval Error:', err);
    } finally {
      setIsAiProcessing(false);
    }
  };

  return (
    <div className="consult-workbench-container">
      {/* Top Header Navigation */}
      <div className="workbench-top-bar">
        <button className="btn-back" onClick={onBack}>
          <ArrowLeft size={16} /> Back to Dashboard
        </button>
        <div className="consult-patient-title">
          <h2>Active Consultation: <strong>{patient?.name || 'Rahul Sharma'}</strong> <span className="patient-meta-inline">({patient?.age || 34} · Male)</span></h2>
          <span className="uhid-subtle-tag">UHID-8921</span>
        </div>
        <div className="safety-rule-pill">
          <ShieldAlert size={14} /> Doctor Clinical Decisions
        </div>
      </div>

      {/* Top Neutral Vitals Strip */}
      <div className="neutral-vitals-grid workbench-vitals">
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

      {/* Doctor Clinical Findings & Medical Decision (Full Width) */}
      <div className="card doctor-form-panel">
        <div className="card-header">
          <h3>👨‍⚕️ Doctor Clinical Findings & Medical Decision</h3>
          <span className="next-patient-badge">SOAP Record</span>
        </div>

        {/* 1. Chief Complaint & History */}
        <div className="form-group">
          <label>Chief Complaint & History of Present Illness:</label>
          <textarea
            rows={2}
            value={soapData.chiefComplaint}
            onChange={(e) => setSoapData({ ...soapData, chiefComplaint: e.target.value })}
          />
        </div>

        {/* 2. Physical Examination */}
        <div className="form-group">
          <label>Physical Examination Findings (Observed by Doctor):</label>
          <input
            type="text"
            value={soapData.examinationFindings}
            onChange={(e) => setSoapData({ ...soapData, examinationFindings: e.target.value })}
          />
        </div>

        {/* 3. Diagnosis Entry (DOCTOR DECISION) */}
        <div className="form-group highlight-diagnosis">
          <label>Verified Clinical Diagnosis (Doctor Confirmed):</label>
          <input
            type="text"
            value={soapData.diagnosis}
            onChange={(e) => setSoapData({ ...soapData, diagnosis: e.target.value })}
            className="input-diagnosis"
          />
        </div>

        {/* 4. Visual Prescription Builder */}
        <div className="rx-builder-section">
          <div className="rx-header">
            <h4>💊 Prescribed Medications</h4>
            <button className="btn-add-rx" onClick={handleAddMedicine}><Plus size={15} /> Add Medicine</button>
          </div>

          {prescriptionItems.map((rx) => (
            <div key={rx.id} className="rx-item-card">
              <div className="rx-item-row">
                <input
                  type="text"
                  placeholder="Medicine Name (e.g. Paracetamol)"
                  value={rx.name}
                  onChange={(e) => handleMedicineChange(rx.id, 'name', e.target.value)}
                  className="rx-name-input"
                />
                <input
                  type="text"
                  placeholder="Dosage (e.g. 650mg)"
                  value={rx.dosage}
                  onChange={(e) => handleMedicineChange(rx.id, 'dosage', e.target.value)}
                  className="rx-short-input"
                />
                <input
                  type="text"
                  placeholder="Frequency (e.g. 1-0-1)"
                  value={rx.frequency}
                  onChange={(e) => handleMedicineChange(rx.id, 'frequency', e.target.value)}
                  className="rx-short-input"
                />
                <input
                  type="text"
                  placeholder="Duration (e.g. 3 days)"
                  value={rx.duration}
                  onChange={(e) => handleMedicineChange(rx.id, 'duration', e.target.value)}
                  className="rx-short-input"
                />
                <button className="btn-remove-rx" onClick={() => handleRemoveMedicine(rx.id)}>
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* 5. Order Lab Tests & Follow-up */}
        <div className="grid-2-col">
          <div className="form-group">
            <label>🧪 Order Lab Tests / Investigations:</label>
            <select
              onChange={(e) => {
                if (e.target.value && !orderedTests.includes(e.target.value)) {
                  setOrderedTests([...orderedTests, e.target.value]);
                }
              }}
            >
              <option value="">+ Add Lab Test Order...</option>
              <option value="CBC (Complete Blood Count)">CBC (Complete Blood Count)</option>
              <option value="Chest X-Ray PA View">Chest X-Ray PA View</option>
              <option value="Dengue NS1 Antigen">Dengue NS1 Antigen</option>
              <option value="Widal Test (Typhoid)">Widal Test (Typhoid)</option>
              <option value="HbA1c Blood Sugar">HbA1c Blood Sugar</option>
            </select>

            <div className="ordered-tests-list">
              {orderedTests.map((test, idx) => (
                <span key={idx} className="clinical-tag" style={{ marginTop: '0.4rem', marginRight: '0.4rem' }}>
                  <Check size={12} style={{ color: 'var(--success)' }} /> {test} <button onClick={() => setOrderedTests(orderedTests.filter(t => t !== test))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--secondary-text)', marginLeft: '4px' }}>× </button>
                </span>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>📅 Set Automated Follow-up Timeframe:</label>
            <select value={followupDays} onChange={(e) => setFollowupDays(Number(e.target.value))}>
              <option value={3}>3 Days (Standard Check-in)</option>
              <option value={5}>5 Days</option>
              <option value={7}>7 Days (1 Week)</option>
              <option value={14}>14 Days (2 Weeks)</option>
              <option value={0}>No Follow-up Required</option>
            </select>
          </div>
        </div>

        {/* Approve Button */}
        <button className="btn-approve-lock" onClick={handleApprove} disabled={isAiProcessing}>
          <FileCheck size={18} /> {isAiProcessing ? 'Processing Approval...' : 'Approve & Lock Medical Record (Generate PDF & WhatsApp Rx)'}
        </button>

        {/* Approval Confirmation Banner */}
        {approvalResult && (
          <div className="approval-success-banner">
            <h4>🎉 Consultation Approved by Doctor!</h4>
            <p>Medical record locked. PDF Prescription created: <a href={approvalResult.prescription.pdf_url} target="_blank" rel="noreferrer">Download PDF</a></p>
            <p>Automated WhatsApp Check-in scheduled for: <strong>{new Date(approvalResult.followup_job.scheduled_for).toLocaleDateString()}</strong></p>
          </div>
        )}
      </div>
    </div>
  );
}
