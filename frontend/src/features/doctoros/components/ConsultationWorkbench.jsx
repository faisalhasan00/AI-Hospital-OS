import React, { useState } from 'react';
import { Stethoscope, Plus, Trash2, FileCheck, ArrowLeft, Thermometer, Activity, Wind, Heart, ShieldAlert, Check, FileText } from 'lucide-react';

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
      {/* 1. Page Navigation & Header */}
      <div className="workbench-top-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button className="btn-back" onClick={onBack}>
            <ArrowLeft size={16} /> Back to Dashboard
          </button>
          <div className="consult-patient-title">
            <h2>{patient?.name || 'Rahul Sharma'} <span className="patient-meta-inline">({patient?.age || 34} · Male)</span></h2>
            <span className="uhid-subtle-tag">UHID-8921</span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div className="safety-rule-pill">
            <ShieldAlert size={14} /> Doctor Clinical Decisions
          </div>
          <button className="btn-soap-record-secondary">
            <FileText size={15} /> SOAP Record
          </button>
        </div>
      </div>

      {/* 2. Neutral Vitals Strip */}
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

      {/* Main EMR Documentation Card */}
      <div className="card doctor-form-panel">
        <div className="emr-form-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Stethoscope size={20} className="emr-header-icon" />
            <h3 className="emr-header-title">Doctor Clinical Findings & Medical Decision</h3>
          </div>
        </div>

        {/* SECTION A: CLINICAL ASSESSMENT */}
        <div className="emr-section-container">
          <div className="emr-section-label">SECTION A · CLINICAL ASSESSMENT</div>

          <div className="form-group">
            <label className="emr-field-label">Chief Complaint & History of Present Illness</label>
            <textarea
              rows={2}
              value={soapData.chiefComplaint}
              onChange={(e) => setSoapData({ ...soapData, chiefComplaint: e.target.value })}
              className="emr-input-field"
            />
          </div>

          <div className="form-group">
            <label className="emr-field-label">Physical Examination Findings</label>
            <input
              type="text"
              value={soapData.examinationFindings}
              onChange={(e) => setSoapData({ ...soapData, examinationFindings: e.target.value })}
              className="emr-input-field"
            />
          </div>

          <div className="form-group">
            <label className="emr-field-label">Verified Clinical Diagnosis</label>
            <div className="diagnosis-input-wrapper">
              <input
                type="text"
                value={soapData.diagnosis}
                onChange={(e) => setSoapData({ ...soapData, diagnosis: e.target.value })}
                className="emr-input-field diagnosis-confirmed"
              />
              <Check size={16} className="diagnosis-check-icon" />
            </div>
          </div>
        </div>

        {/* SECTION B: TREATMENT PLAN (MEDICATIONS) */}
        <div className="emr-section-container">
          <div className="rx-section-header">
            <div className="emr-section-label" style={{ margin: 0 }}>SECTION B · TREATMENT PLAN (PRESCRIBED MEDICATIONS)</div>
            <button className="btn-add-medicine-secondary" onClick={handleAddMedicine}>
              <Plus size={14} /> Add Medicine
            </button>
          </div>

          <div className="rx-table-container">
            <table className="rx-table">
              <thead>
                <tr>
                  <th>MEDICINE</th>
                  <th>DOSE</th>
                  <th>FREQUENCY</th>
                  <th>DURATION</th>
                  <th style={{ width: '45px', textAlign: 'center' }}>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {prescriptionItems.map((rx) => (
                  <tr key={rx.id}>
                    <td>
                      <input
                        type="text"
                        placeholder="Medicine Name (e.g. Paracetamol)"
                        value={rx.name}
                        onChange={(e) => handleMedicineChange(rx.id, 'name', e.target.value)}
                        className="emr-table-input bold-name"
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        placeholder="Dosage (e.g. 650mg)"
                        value={rx.dosage}
                        onChange={(e) => handleMedicineChange(rx.id, 'dosage', e.target.value)}
                        className="emr-table-input"
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        placeholder="Frequency (e.g. 1-0-1)"
                        value={rx.frequency}
                        onChange={(e) => handleMedicineChange(rx.id, 'frequency', e.target.value)}
                        className="emr-table-input"
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        placeholder="Duration (e.g. 3 days)"
                        value={rx.duration}
                        onChange={(e) => handleMedicineChange(rx.id, 'duration', e.target.value)}
                        className="emr-table-input"
                      />
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button className="btn-remove-rx-subtle" onClick={() => handleRemoveMedicine(rx.id)} title="Delete Medicine">
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* SECTION C: INVESTIGATIONS & FOLLOW-UP */}
        <div className="emr-section-container">
          <div className="emr-section-label">SECTION C · INVESTIGATIONS & FOLLOW-UP</div>

          <div className="grid-2-col">
            <div className="form-group">
              <label className="emr-field-label">Investigations / Lab Orders</label>
              <select
                className="emr-input-field"
                value=""
                onChange={(e) => {
                  const val = e.target.value;
                  if (val && !orderedTests.includes(val)) {
                    setOrderedTests([...orderedTests, val]);
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
                  <span key={idx} className="clinical-tag-chip">
                    <Check size={13} className="chip-check-icon" />
                    <span>{test}</span>
                    <button type="button" className="btn-remove-chip" onClick={() => setOrderedTests(orderedTests.filter(t => t !== test))}>×</button>
                  </span>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="emr-field-label">Automated Follow-up</label>
              <select value={followupDays} onChange={(e) => setFollowupDays(Number(e.target.value))} className="emr-input-field">
                <option value={3}>3 Days — Standard Check-in</option>
                <option value={5}>5 Days</option>
                <option value={7}>7 Days (1 Week)</option>
                <option value={14}>14 Days (2 Weeks)</option>
                <option value={0}>No Follow-up Required</option>
              </select>
              <span className="subtle-helper-text">Patient will receive an automated check-in after the selected interval.</span>
            </div>
          </div>
        </div>

        {/* FINAL APPROVAL ACTION */}
        <div className="emr-approval-box">
          <button className="btn-approve-primary" onClick={handleApprove} disabled={isAiProcessing}>
            <FileCheck size={18} /> {isAiProcessing ? 'Processing Approval...' : 'Approve & Lock Medical Record'}
          </button>
          <span className="approve-caption-text">Generate PDF prescription and send via WhatsApp</span>
        </div>

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
