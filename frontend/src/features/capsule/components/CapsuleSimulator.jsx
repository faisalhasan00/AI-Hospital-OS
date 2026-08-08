import React, { useState, useEffect } from 'react';
import * as Icons from 'lucide-react';
import { Html5QrcodeScanner } from 'html5-qrcode';

const BACKEND_URL = 'http://localhost:5000';

const MOCK_PROFILES = [
  {
    id: 'PX-8942',
    name: 'John Doe',
    age: 45,
    language: 'English',
    allergies: 'Penicillin',
    chronicIllness: 'Hypertension',
    history: 'Diagnosed with Primary Hypertension in 2023. Takes Lisinopril. High sodium sensitivity.'
  },
  {
    id: 'PX-4190',
    name: 'Sarah Jenkins',
    age: 29,
    language: 'English',
    allergies: 'Ibuprofen (NSAIDs)',
    chronicIllness: 'Asthma',
    history: 'Mild Intermittent Asthma diagnosed in 2021. Uses Albuterol inhaler as needed.'
  },
  {
    id: 'PX-6712',
    name: 'Aarav Sharma',
    age: 62,
    language: 'Hindi',
    allergies: 'Sulfa drugs',
    chronicIllness: 'Type 2 Diabetes',
    history: 'Type 2 Diabetes since 2018. Managed with Metformin. Shows signs of early diabetic neuropathy.'
  }
];

const SYMPTOM_TEMPLATES = [
  {
    label: '🚨 Chest Pain (Emergency Protocol)',
    text: 'I have a sudden heavy tightness in my chest that goes down my left arm. I feel dizzy and I am sweating a lot.',
    targetVitals: { heartRate: 110, bloodPressureSystolic: 165, bloodPressureDiastolic: 105, oxygenSaturation: 88, temperature: 98.4, ecgPattern: 'ST-Elevation (Infarction)' }
  },
  {
    label: '🤒 High Fever & Dry Cough (Flu Scenario)',
    text: 'I have a painful sore throat, a dry cough, and a high fever since yesterday. My whole body is aching.',
    targetVitals: { heartRate: 92, bloodPressureSystolic: 118, bloodPressureDiastolic: 76, oxygenSaturation: 97, temperature: 102.5, ecgPattern: 'Sinus Tachycardia' }
  },
  {
    label: '😴 Extreme Fatigue & Thirst (Diabetes Risk)',
    text: 'I feel extremely tired all the time and I am always thirsty, no matter how much water I drink. I need to urinate very frequently.',
    targetVitals: { heartRate: 72, bloodPressureSystolic: 135, bloodPressureDiastolic: 88, oxygenSaturation: 98, temperature: 98.6, ecgPattern: 'Normal Sinus Rhythm' }
  },
  {
    label: '🤢 Sore Throat (Penicillin Allergy Warning)',
    text: 'I have a very sore throat with white spots on my tonsils. Swallowing food or liquids is extremely painful.',
    targetVitals: { heartRate: 85, bloodPressureSystolic: 120, bloodPressureDiastolic: 80, oxygenSaturation: 99, temperature: 101.2, ecgPattern: 'Normal Sinus Rhythm' }
  }
];

export default function CapsuleSimulator({ 
  currentStep, 
  setCurrentStep, 
  sessionState, 
  setSessionState,
  vitals,
  setVitals,
  updateCapsuleState,
  dispatchLog,
  addTrainingLog
}) {
  // Step 1 states
  const [receptionMode, setReceptionMode] = useState('aadhaar'); // 'aadhaar' | 'manual'
  const [aadhaarState, setAadhaarState] = useState('idle'); // 'idle' | 'scanning' | 'complete'
  const [scanProgress, setScanProgress] = useState(0);

  // Patient inputs
  const [customName, setCustomName] = useState('');
  const [customAge, setCustomAge] = useState('');
  const [customAllergies, setCustomAllergies] = useState('');
  const [customChronic, setCustomChronic] = useState('');
  const [language, setLanguage] = useState('English');

  // Step 2 states
  const [interviewText, setInterviewText] = useState('');
  const [chatMessages, setChatMessages] = useState([
    { sender: 'agent', text: 'Hello! I am your AI Medical Intake Agent. Please describe your primary symptoms or health concerns today.' }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isInterviewLoading, setIsInterviewLoading] = useState(false);

  // Multimodal Vision Scan States
  const [scanImage, setScanImage] = useState(null);
  const [scanAnalysis, setScanAnalysis] = useState(null);
  const [isAnalyzingScan, setIsAnalyzingScan] = useState(false);

  const handleScanUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const base64Data = uploadEvent.target.result;
      setScanImage(base64Data);
      setIsAnalyzingScan(true);

      fetch(`${BACKEND_URL}/api/analyze-scan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64Data,
          mimeType: file.type || 'image/jpeg',
          patientName: sessionState.patient?.name,
          patientAge: sessionState.patient?.age,
          notes: sessionState.symptoms
        })
      })
        .then(res => res.json())
        .then(data => {
          setScanAnalysis(data);
          dispatchLog('Multimodal Diagnostic Agent', `Radiology Findings: ${data.findings}`, 'var(--color-purple)');
        })
        .catch(err => console.error("Scan analysis error:", err))
        .finally(() => setIsAnalyzingScan(false));
    };
    reader.readAsDataURL(file);
  };

  // Step 4 states
  const [diagnosticsLogs, setDiagnosticsLogs] = useState([]);
  const [activePipelineAgent, setActivePipelineAgent] = useState(null);

  // Step 5 Doctor feedback states
  const [overrideActive, setOverrideActive] = useState(false);
  const [doctorRxOverride, setDoctorRxOverride] = useState('');
  const [doctorFeedback, setDoctorFeedback] = useState('');

  // Aadhaar scan simulator (now using real camera)
  const handleAadhaarScan = () => {
    setAadhaarState('scanning');
  };

  useEffect(() => {
    let scanner = null;
    if (currentStep === 1 && receptionMode === 'aadhaar' && aadhaarState === 'scanning') {
      scanner = new Html5QrcodeScanner("reader", { 
        qrbox: { width: 250, height: 250 }, 
        fps: 5 
      }, false);
      
      scanner.render((decodedText) => {
        scanner.clear();
        setAadhaarState('complete');
        const randomProf = MOCK_PROFILES[Math.floor(Math.random() * MOCK_PROFILES.length)];
        
        try {
          const parsed = JSON.parse(decodedText);
          if (parsed.name) randomProf.name = parsed.name;
          if (parsed.age) randomProf.age = parsed.age;
          if (parsed.allergies) randomProf.allergies = parsed.allergies;
          if (parsed.chronicIllness) randomProf.chronicIllness = parsed.chronicIllness;
        } catch(e) {}
        
        setCustomName(randomProf.name);
        setCustomAge(randomProf.age.toString());
        setCustomAllergies(randomProf.allergies);
        setCustomChronic(randomProf.chronicIllness);
        setLanguage(randomProf.language);
      }, (error) => {
        // ignore continuous scan errors
      });
    }

    return () => {
      if (scanner) {
        scanner.clear().catch(err => console.error("Scanner clear error", err));
      }
    };
  }, [currentStep, receptionMode, aadhaarState]);

  const handleStartSession = () => {
    if (!customName || !customAge) {
      alert("Please register a patient profile (via Aadhaar scan or manual entry).");
      return;
    }

    const patientId = 'PX-' + Math.floor(1000 + Math.random() * 9000);

    const patientData = {
      id: patientId,
      name: customName,
      age: parseInt(customAge),
      allergies: customAllergies || 'None',
      chronicIllness: customChronic || 'None',
      language,
      history: 'Aadhaar Verified Visit. Clinic record sync complete.'
    };

    fetch(`${BACKEND_URL}/api/session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ patient: patientData, language })
    })
      .then(res => res.json())
      .then(data => {
        setSessionState(prev => ({
          ...prev,
          sessionId: data.sessionId,
          patient: patientData,
          status: 'interview'
        }));

        updateCapsuleState({ doorLocked: true, lightingColor: 'blue' });
        
        dispatchLog('Patient Reception Agent', `Aadhaar Profile verified: ${patientData.name} (${patientData.age} y/o). Visit session initialized: ${data.sessionId}`, 'var(--color-cyan)');
        dispatchLog('Capsule Environment Agent', 'isolation door: LOCKED. Ambient calming blue lighting engaged.', 'var(--color-purple)');
        
        setCurrentStep(2);
      })
      .catch(err => {
        console.error("Session API Error:", err);
        alert("Failed to initialize session. Is the backend server running on port 5000?");
      });
  };

  const handleSendMessage = (textToSend) => {
    const messageText = (textToSend || inputMessage).trim();
    if (!messageText || isInterviewLoading) return;

    const newPatientMsg = { sender: 'patient', text: messageText };
    const updatedMessages = [...chatMessages, newPatientMsg];
    setChatMessages(updatedMessages);
    setInputMessage('');
    setIsInterviewLoading(true);

    fetch(`${BACKEND_URL}/api/interview`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userMessage: messageText,
        chatHistory: updatedMessages
      })
    })
      .then(res => res.json())
      .then(data => {
        const agentReply = data.reply || 'Thank you. Could you share more details?';
        setChatMessages(prev => [...prev, { sender: 'agent', text: agentReply }]);
        dispatchLog('Medical Interview Agent', `Intake notes: "${messageText}". AI Reply: "${agentReply}"`, 'var(--color-cyan)');
        
        setInterviewText(prev => prev ? `${prev}\n- ${messageText}` : messageText);
      })
      .catch(err => {
        console.error("Interview API Error:", err);
      })
      .finally(() => {
        setIsInterviewLoading(false);
      });
  };

  const handleUseTemplate = (template) => {
    setVitals(template.targetVitals);
    handleSendMessage(template.text);
  };

  const handleFinishInterview = () => {
    const summaryNotes = interviewText.trim() || chatMessages.filter(m => m.sender === 'patient').map(m => m.text).join('; ');

    setSessionState(prev => ({
      ...prev,
      symptoms: summaryNotes || 'Patient reported mild general discomfort.',
      status: 'vitals'
    }));

    dispatchLog('Medical Interview Agent', 'Symptom interview concluded. Medical notes structured.', 'var(--color-cyan)');
    setCurrentStep(3);
  };

  const runAIDiagnosticPipeline = () => {
    fetch(`${BACKEND_URL}/api/pipeline`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        patient: sessionState.patient,
        vitals,
        symptoms: sessionState.symptoms,
        sessionId: sessionState.sessionId
      })
    })
      .then(res => res.json())
      .then(data => {
        setSessionState(prev => ({
          ...prev,
          triage: data.triage.risk,
          diagnosis: data.prediction.diagnosis,
          diagnosisConfidence: data.prediction.confidence,
          prescription: data.proposedRx.prescription,
          safetyStatus: data.safety.status,
          safetyReason: data.safety.reason
        }));
        
        setDoctorRxOverride(data.proposedRx.prescription);
        if (data.emergency && data.emergency.triggered) {
          updateCapsuleState({ lightingColor: 'red' });
        } else {
          updateCapsuleState({ lightingColor: data.triage.lightingColor });
        }
        
        dispatchLog('Doctor Copilot Agent', 'Compiling case report file for remote human validation.', 'var(--color-teal)');
        setCurrentStep(4);
      })
      .catch(err => {
        console.error("Pipeline API Error:", err);
      });
  };

  const handleSubmitDoctorReview = () => {
    const overridden = overrideActive && doctorRxOverride !== sessionState.prescription;
    const finalPrescription = overrideActive ? doctorRxOverride : sessionState.prescription;

    fetch(`${BACKEND_URL}/api/doctor-feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: sessionState.sessionId,
        patientId: sessionState.patient.id,
        patientName: sessionState.patient.name,
        symptoms: sessionState.symptoms,
        proposedPrescription: sessionState.prescription,
        correctedPrescription: finalPrescription,
        overridden: overridden,
        doctorComment: doctorFeedback || 'Prescription co-signed and approved.'
      })
    })
      .then(res => res.json())
      .then(data => {
        setSessionState(prev => ({
          ...prev,
          prescription: finalPrescription,
          doctorComments: doctorFeedback || 'Prescription co-signed and approved.',
          status: 'discharge'
        }));

        dispatchLog('Doctor Copilot Agent', `Doctor review complete. Prescription finalized: "${finalPrescription}"`, 'var(--color-green)');
        dispatchLog('Learning & Analytics Agent', data.learningResult.feedbackNote, 'var(--color-purple)');
        
        addTrainingLog(data.logEntry);
        setCurrentStep(5);
      })
      .catch(err => {
        console.error("Doctor feedback API Error:", err);
      });
  };

  const handleDischargeAndSanitize = () => {
    fetch(`${BACKEND_URL}/api/discharge`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId: sessionState.sessionId })
    })
      .then(res => res.json())
      .then(data => {
        updateCapsuleState({ uvcActive: true, lightingColor: 'purple' });
        dispatchLog('Capsule Environment Agent', 'Patient discharged. Door unlocked briefly, then locked for sanitization.', 'var(--color-purple)');
        dispatchLog('Capsule Environment Agent', data.sanitizeEnv.message, 'var(--color-purple)');
        
        setSessionState(prev => ({
          ...prev,
          status: 'sanitizing'
        }));

        setTimeout(() => {
          updateCapsuleState({ uvcActive: false, doorLocked: false, lightingColor: 'green' });
          dispatchLog('Capsule Environment Agent', data.readyEnv.message, 'var(--color-green)');
          
          setSessionState({
            sessionId: 'CAP-' + Math.floor(100000 + Math.random() * 900000),
            patient: null,
            symptoms: '',
            triage: '',
            diagnosis: '',
            diagnosisConfidence: 0,
            prescription: '',
            safetyStatus: '',
            safetyReason: '',
            doctorComments: '',
            status: 'idle'
          });
          
          setAadhaarState('idle');
          setScanProgress(0);
          setCustomName('');
          setCustomAge('');
          setCustomAllergies('');
          setCustomChronic('');
          setInterviewText('');
          setOverrideActive(false);
          setDoctorFeedback('');
          setCurrentStep(1);
        }, 4000);
      })
      .catch(err => {
        console.error("Discharge API Error:", err);
      });
  };

  return (
    <div className="glass-panel animate-fade-in" style={{ padding: '25px', minHeight: '520px', display: 'flex', flexDirection: 'column' }}>
      
      {/* Premium Step Process Timeline */}
      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-muted)', paddingBottom: '15px', marginBottom: '25px' }}>
        {[
          { step: 1, label: 'Patient Reception' },
          { step: 2, label: 'Symptom Logging' },
          { step: 3, label: 'Vitals Biosensors' },
          { step: 4, label: 'Clinician Sign-off' },
          { step: 5, label: 'Discharge & Sanitize' }
        ].map((s) => (
          <div key={s.step} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ 
              width: '24px', 
              height: '24px', 
              borderRadius: '50%', 
              background: currentStep === s.step ? 'var(--color-cyan)' : currentStep > s.step ? 'var(--color-green)' : 'rgba(0,0,0,0.05)',
              color: currentStep >= s.step ? 'white' : 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '11px',
              boxShadow: currentStep === s.step ? '0 2px 4px rgba(2, 132, 199, 0.2)' : 'none',
              transition: 'all 0.3s ease'
            }}>
              {currentStep > s.step ? <Icons.Check size={12} /> : s.step}
            </span>
            <span style={{ 
              fontSize: '12px', 
              fontWeight: currentStep === s.step ? 600 : 400,
              color: currentStep === s.step ? 'var(--text-primary)' : 'var(--text-secondary)'
            }}>
              {s.label}
            </span>
            {s.step < 5 && <span style={{ color: 'var(--text-muted)', margin: '0 3px' }}>➔</span>}
          </div>
        ))}
      </div>

      {/* STEP 1: PATIENT RECEPTION */}
      {currentStep === 1 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', flex: 1, maxWidth: '650px', margin: '0 auto', width: '100%' }}>
          <div style={{ textAlign: 'center', marginBottom: '10px' }}>
            <h3 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-bright)', marginBottom: '8px' }}>
              1. Patient Identification & Reception
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              Step inside the capsule to begin. Identify the patient by scanning their Aadhaar Card or register their profile details manually.
            </p>
          </div>

          {/* Toggle Choice buttons */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', background: 'rgba(255,255,255,0.03)', padding: '6px', borderRadius: '10px', border: '1px solid var(--border-muted)' }}>
            <button 
              className="btn-secondary"
              style={{ 
                justifyContent: 'center',
                background: receptionMode === 'aadhaar' ? 'rgba(2, 132, 199, 0.08)' : 'transparent',
                borderColor: receptionMode === 'aadhaar' ? 'var(--color-cyan)' : 'transparent',
                color: receptionMode === 'aadhaar' ? 'var(--color-cyan)' : 'var(--text-secondary)'
              }}
              onClick={() => setReceptionMode('aadhaar')}
            >
              <Icons.QrCode size={16} />
              Scan Aadhaar Card
            </button>
            <button 
              className="btn-secondary"
              style={{ 
                justifyContent: 'center',
                background: receptionMode === 'manual' ? 'rgba(2, 132, 199, 0.08)' : 'transparent',
                borderColor: receptionMode === 'manual' ? 'var(--color-cyan)' : 'transparent',
                color: receptionMode === 'manual' ? 'var(--color-cyan)' : 'var(--text-secondary)'
              }}
              onClick={() => setReceptionMode('manual')}
            >
              <Icons.FileEdit size={16} />
              Manual Entry Profile
            </button>
          </div>

          {/* Mode A: Aadhaar Scanning Scanner Container */}
          {receptionMode === 'aadhaar' && (
            <div style={{ 
              border: '1px dashed var(--border-bright)', 
              borderRadius: '16px', 
              padding: '30px', 
              background: 'rgba(5, 7, 15, 0.4)',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '15px',
              position: 'relative',
              overflow: 'hidden',
              minHeight: '260px',
              justifyContent: 'center'
            }}>
              {aadhaarState === 'idle' && (
                <>
                  <div style={{ background: 'rgba(2, 132, 199, 0.05)', padding: '20px', borderRadius: '50%', color: 'var(--color-cyan)' }}>
                    <Icons.ScanFace size={48} />
                  </div>
                  <div>
                    <h4 style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Scanner Ready</h4>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                      Position the QR code or front of your Aadhaar Card in front of the scanner lens.
                    </p>
                  </div>
                  <button className="btn-primary" onClick={handleAadhaarScan}>
                    <Icons.Camera size={16} />
                    Start Camera Scanner
                  </button>
                </>
              )}

              {aadhaarState === 'scanning' && (
                <div style={{ width: '100%', maxWidth: '400px' }}>
                  <h4 style={{ fontWeight: 600, color: 'var(--text-bright)', marginBottom: '10px' }}>Camera Active</h4>
                  <div id="reader" style={{ width: '100%', background: 'rgba(0,0,0,0.5)', borderRadius: '8px', overflow: 'hidden' }}></div>
                  <button className="btn-secondary" style={{ marginTop: '15px' }} onClick={() => setAadhaarState('idle')}>
                    Cancel Scan
                  </button>
                </div>
              )}

              {aadhaarState === 'complete' && (
                <>
                  <div style={{ background: 'rgba(57,255,20,0.08)', padding: '16px', borderRadius: '50%', color: 'var(--color-green)' }}>
                    <Icons.ShieldCheck size={40} />
                  </div>
                  <div>
                    <h4 style={{ fontWeight: 600, color: 'var(--color-green)' }}>Demographics Synchronized</h4>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                      Profile for <strong>{customName}</strong> (Age {customAge}) synced with previous medical records.
                    </p>
                  </div>
                  
                  {/* Checklist indicators */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '11px', color: 'var(--text-muted)', textAlign: 'left', background: 'rgba(0,0,0,0.02)', padding: '10px 20px', borderRadius: '8px' }}>
                    <span style={{ color: 'var(--color-green)' }}>✓ Aadhaar ID Confirmed</span>
                    <span style={{ color: 'var(--color-green)' }}>✓ Records Synced</span>
                    <span>Allergies: {customAllergies}</span>
                    <span>Chronic: {customChronic}</span>
                  </div>

                  <button className="btn-secondary" style={{ fontSize: '12px', padding: '6px 12px' }} onClick={() => setAadhaarState('idle')}>
                    <Icons.RefreshCw size={12} /> Re-scan Aadhaar
                  </button>
                </>
              )}
            </div>
          )}

          {/* Mode B: Manual Entry Profile */}
          {receptionMode === 'manual' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', background: 'var(--bg-darker)', border: '1px solid var(--border-muted)', borderRadius: '16px', padding: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '10px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <label style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Full Name</label>
                  <input type="text" value={customName} onChange={(e) => setCustomName(e.target.value)} placeholder="e.g. Aarav Sharma" />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <label style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Age</label>
                  <input type="text" value={customAge} onChange={(e) => setCustomAge(e.target.value)} placeholder="e.g. 62" />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <label style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Drug Allergies</label>
                <input type="text" value={customAllergies} onChange={(e) => setCustomAllergies(e.target.value)} placeholder="e.g. Penicillin, Sulfa (Leave empty if none)" />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <label style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Chronic History / Conditions</label>
                <input type="text" value={customChronic} onChange={(e) => setCustomChronic(e.target.value)} placeholder="e.g. Type 2 Diabetes, Hypertension" />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <label style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Native Communication Language</label>
                <select value={language} onChange={(e) => setLanguage(e.target.value)}>
                  <option value="English">English</option>
                  <option value="Spanish">Español (Spanish)</option>
                  <option value="Hindi">हिन्दी (Hindi)</option>
                  <option value="Arabic">العربية (Arabic)</option>
                </select>
              </div>
            </div>
          )}

          {/* Action button to lock capsule and proceed */}
          <button 
            className="btn-primary" 
            style={{ width: '100%', padding: '14px', justifyContent: 'center', marginTop: '10px' }}
            onClick={handleStartSession}
            disabled={!customName || !customAge}
          >
            <Icons.Lock size={18} />
            Lock Capsule & Proceed to Symptom Interview
          </button>
        </div>
      )}

      {/* STEP 2: SYMPTOM INTERVIEW */}
      {currentStep === 2 && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px', flex: 1 }}>
          
          {/* Chat feed column */}
          <div style={{ display: 'flex', flexDirection: 'column', height: '440px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-bright)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Icons.MessageSquare style={{ color: 'var(--color-cyan)' }} size={18} />
                2. AI Medical Symptom Intake
              </h3>
              <span style={{ fontSize: '11px', color: 'var(--color-cyan)', fontWeight: 600, background: 'rgba(0,240,255,0.08)', padding: '2px 8px', borderRadius: '4px' }}>
                Gemini LLM Active
              </span>
            </div>
            
            {/* Messages Feed */}
            <div style={{ 
              flex: 1, 
              background: 'rgba(5, 7, 15, 0.4)', 
              border: '1px solid var(--border-muted)', 
              borderRadius: '12px', 
              padding: '15px', 
              overflowY: 'auto', 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '10px',
              marginBottom: '10px'
            }}>
              {chatMessages.map((msg, index) => (
                <div 
                  key={index} 
                  style={{ 
                    alignSelf: msg.sender === 'patient' ? 'flex-end' : 'flex-start',
                    maxWidth: '85%',
                    background: msg.sender === 'patient' ? 'rgba(2, 132, 199, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                    border: msg.sender === 'patient' ? '1px solid var(--color-cyan)' : '1px solid var(--border-muted)',
                    borderRadius: msg.sender === 'patient' ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                    padding: '10px 14px',
                    fontSize: '12px',
                    color: 'var(--text-primary)',
                    lineHeight: '1.4'
                  }}
                >
                  <div style={{ fontSize: '10px', fontWeight: 700, color: msg.sender === 'patient' ? 'var(--color-cyan)' : 'var(--color-purple)', marginBottom: '3px' }}>
                    {msg.sender === 'patient' ? 'Patient' : '🤖 Medical Interview Agent'}
                  </div>
                  {msg.text}
                </div>
              ))}

              {isInterviewLoading && (
                <div style={{ alignSelf: 'flex-start', fontSize: '11px', color: 'var(--color-cyan)', fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Icons.Loader2 size={12} className="animate-spin" />
                  Medical Interview Agent analyzing complaints...
                </div>
              )}
            </div>
            
            {/* Input Bar */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
              <input 
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type symptoms or answer the nurse's question..."
                style={{ flex: 1, background: 'rgba(5, 7, 15, 0.4)', border: '1px solid var(--border-muted)', borderRadius: '8px', padding: '10px 12px', color: 'var(--text-primary)', fontSize: '12px', outline: 'none' }}
                disabled={isInterviewLoading}
              />
              <button 
                className="btn-primary"
                onClick={() => handleSendMessage()}
                disabled={!inputMessage.trim() || isInterviewLoading}
                style={{ padding: '0 16px' }}
              >
                <Icons.Send size={14} />
              </button>
            </div>
            
            <button 
              className="btn-primary" 
              style={{ background: 'var(--color-green)', color: 'var(--bg-darker)', width: '100%', justifyContent: 'center' }}
              onClick={handleFinishInterview}
            >
              <Icons.CheckCircle size={16} />
              Lock Symptoms & Proceed to Biosensors
            </button>
          </div>

          {/* Quick Preset templates column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div style={{ background: 'rgba(0, 0, 0, 0.02)', border: '1px solid var(--border-muted)', borderRadius: '12px', padding: '15px', height: '100%', display: 'flex', flexDirection: 'column' }}>
              <h4 style={{ color: 'var(--color-cyan)', fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>
                Test Scenarios (Prescripted Complaints)
              </h4>
              <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                Select a preset complaint. This loads standard biosensor values corresponding to that pathology.
              </p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, justifyContent: 'center' }}>
                {SYMPTOM_TEMPLATES.map((tmpl, i) => (
                  <button 
                    key={i} 
                    className="btn-secondary" 
                    style={{ fontSize: '11px', padding: '10px', textAlign: 'left', width: '100%', display: 'block' }}
                    onClick={() => handleUseTemplate(tmpl)}
                    disabled={isInterviewLoading}
                  >
                    {tmpl.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: VITALS BIOSENSORS */}
      {currentStep === 3 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', flex: 1 }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-bright)' }}>
              3. Biosensor Readings Configuration (Manual Entry)
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Simulate patient's biological parameters. Enter biometric values below:
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '25px', alignItems: 'center' }}>
            {/* Vitals range sliders */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Heart Rate (bpm)</span>
                  </div>
                  <input 
                    type="number" min="40" max="180" 
                    value={vitals.heartRate}
                    onChange={(e) => setVitals(prev => ({ ...prev, heartRate: parseInt(e.target.value) || '' }))}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>ECG Wave Pattern</label>
                  <select 
                    value={vitals.ecgPattern}
                    onChange={(e) => setVitals(prev => ({ ...prev, ecgPattern: e.target.value }))}
                  >
                    <option value="Normal Sinus Rhythm">Normal Sinus Rhythm</option>
                    <option value="Sinus Tachycardia">Sinus Tachycardia</option>
                    <option value="Atrial Fibrillation (Arrhythmia)">Atrial Fibrillation (Arrhythmia)</option>
                    <option value="ST-Elevation (Infarction)">ST-Elevation (Infarction/Heart Attack)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '15px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Blood Pressure (Systolic/Diastolic mmHg)</span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input 
                      type="number" min="80" max="200" 
                      value={vitals.bloodPressureSystolic}
                      onChange={(e) => setVitals(prev => ({ ...prev, bloodPressureSystolic: parseInt(e.target.value) || '' }))}
                      style={{ flex: 1 }}
                    />
                    <span style={{ color: 'var(--text-muted)' }}>/</span>
                    <input 
                      type="number" min="50" max="120" 
                      value={vitals.bloodPressureDiastolic}
                      onChange={(e) => setVitals(prev => ({ ...prev, bloodPressureDiastolic: parseInt(e.target.value) || '' }))}
                      style={{ flex: 1 }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Oxygen SpO₂ (%)</span>
                  </div>
                  <input 
                    type="number" min="70" max="100" 
                    value={vitals.oxygenSaturation}
                    onChange={(e) => setVitals(prev => ({ ...prev, oxygenSaturation: parseInt(e.target.value) || '' }))}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Temperature (°F)</span>
                  </div>
                  <input 
                    type="number" min="95" max="105" step="0.1" 
                    value={vitals.temperature}
                    onChange={(e) => setVitals(prev => ({ ...prev, temperature: parseFloat(e.target.value) || '' }))}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Patient Weight (kg)</span>
                  </div>
                  <input 
                    type="number" min="40" max="150" 
                    value={vitals.weight}
                    onChange={(e) => setVitals(prev => ({ ...prev, weight: parseInt(e.target.value) || '' }))}
                  />
                </div>
              </div>

            </div>

            {/* Visit card summary & Multimodal Scan Uploader */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div style={{ background: 'rgba(0,0,0,0.02)', border: '1px solid var(--border-muted)', borderRadius: '12px', padding: '15px' }}>
                <h4 style={{ color: 'var(--color-cyan)', fontSize: '13px', fontWeight: 600, marginBottom: '10px' }}>
                  Visit Summary File
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px' }}>
                  <div><strong>Patient:</strong> {sessionState.patient.name} ({sessionState.patient.age}y/o)</div>
                  <div><strong>Allergies:</strong> <span style={{ color: 'var(--color-crimson)' }}>{sessionState.patient.allergies}</span></div>
                  <div><strong>Chronic History:</strong> {sessionState.patient.chronicIllness}</div>
                  <div style={{ borderTop: '1px solid var(--border-muted)', paddingTop: '6px', color: 'var(--text-secondary)' }}>
                    <strong>Symptoms:</strong> "{sessionState.symptoms}"
                  </div>
                </div>
              </div>

              {/* Multimodal Diagnostic Scan Upload Zone */}
              <div style={{ background: 'rgba(157, 78, 221, 0.05)', border: '1px dashed var(--color-purple)', borderRadius: '12px', padding: '15px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <Icons.FileImage style={{ color: 'var(--color-purple)' }} size={16} />
                  <h4 style={{ color: 'var(--color-purple)', fontSize: '13px', fontWeight: 600 }}>
                    Multimodal Scan Upload (Gemini Vision)
                  </h4>
                </div>
                <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '10px' }}>
                  Optional: Upload an X-ray, ECG printout, skin photo, or lab report image for AI radiological analysis.
                </p>

                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleScanUpload}
                  style={{ display: 'none' }}
                  id="scan-upload-input"
                />
                
                <label 
                  htmlFor="scan-upload-input"
                  className="btn-secondary"
                  style={{ width: '100%', justifyContent: 'center', padding: '8px', cursor: 'pointer', fontSize: '12px', borderColor: 'var(--color-purple)', color: 'var(--color-purple)' }}
                >
                  <Icons.Upload size={14} />
                  {isAnalyzingScan ? 'Analyzing Scan with Gemini Vision...' : 'Select Diagnostic Scan Image'}
                </label>

                {scanAnalysis && (
                  <div style={{ marginTop: '10px', background: 'rgba(0,0,0,0.03)', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-muted)', fontSize: '11px' }}>
                    <div style={{ fontWeight: 700, color: 'var(--color-purple)', marginBottom: '3px' }}>
                      AI Radiological Findings ({scanAnalysis.severity} Severity):
                    </div>
                    {scanAnalysis.findings}
                  </div>
                )}
              </div>
            </div>
          </div>

          <button 
            className="btn-primary" 
            style={{ width: '100%', padding: '14px', justifyContent: 'center', marginTop: '10px' }}
            onClick={runAIDiagnosticPipeline}
          >
            <Icons.Cpu size={18} />
            Transmit Vitals & Execute Agentic Diagnostics
          </button>
        </div>
      )}


      {/* STEP 4: REMOTE DOCTOR REVIEW */}
      {currentStep === 4 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-muted)', paddingBottom: '8px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-bright)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Icons.ShieldAlert style={{ color: 'var(--color-cyan)' }} />
              4. Trial Mode Clinical Validation (Clinician Sign-off)
            </h3>
            <span style={{ fontSize: '10px', color: 'var(--color-amber)', fontWeight: 700, background: 'rgba(255,159,28,0.08)', padding: '3px 8px', borderRadius: '4px' }}>
              HUMAN-IN-THE-LOOP ACTIVE
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px' }}>
            
            {/* Left: AI Prescription status summary */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="glass-panel" style={{ padding: '12px', background: 'var(--bg-darker)' }}>
                <h4 style={{ color: 'var(--color-cyan)', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>
                  Doctor Copilot Case Summary
                </h4>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px' }}>
                  <div><strong>Patient:</strong> {sessionState.patient.name} ({sessionState.patient.age}y/o)</div>
                  <div><strong>Allergies:</strong> <span style={{ color: 'var(--color-crimson)', fontWeight: 600 }}>{sessionState.patient.allergies}</span></div>
                  <div><strong>AI Suspected Diagnosis:</strong> {sessionState.diagnosis} ({sessionState.diagnosisConfidence}% confidence)</div>
                  <div>
                    <strong>Triage Level:</strong> 
                    <span style={{ 
                      marginLeft: '5px',
                      fontWeight: 700, 
                      color: sessionState.triage === 'Emergency' || sessionState.triage === 'High Risk' ? 'var(--color-crimson)' : sessionState.triage === 'Medium Risk' ? 'var(--color-amber)' : 'var(--color-green)'
                    }}>
                      {sessionState.triage.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

              <div 
                className={sessionState.safetyStatus === 'Critical Warning' ? 'glass-panel glow-crimson' : 'glass-panel glow-green'}
                style={{ padding: '12px', borderWidth: '1px', background: 'var(--bg-darker)' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                  {sessionState.safetyStatus === 'Critical Warning' ? (
                    <Icons.AlertOctagon style={{ color: 'var(--color-crimson)' }} />
                  ) : (
                    <Icons.CheckCircle style={{ color: 'var(--color-green)' }} />
                  )}
                  <h4 style={{ fontSize: '13px', fontWeight: 600, color: sessionState.safetyStatus === 'Critical Warning' ? 'var(--color-crimson)' : 'var(--color-green)' }}>
                    AI Proposed Prescription Safety Audit
                  </h4>
                </div>
                
                <div style={{ fontSize: '12px' }}>
                  <div style={{ marginBottom: '8px' }}>
                    <strong>Prescription:</strong>
                    <pre style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', background: 'rgba(0,0,0,0.03)', padding: '8px 12px', borderRadius: '6px', whiteSpace: 'pre-wrap', marginTop: '6px', border: '1px solid var(--border-muted)', color: 'var(--text-primary)', lineHeight: '1.4' }}>{sessionState.prescription}</pre>
                  </div>
                  <div>
                    <strong>Audit Status:</strong> {sessionState.safetyStatus} - {sessionState.safetyReason}
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Clinician overrides and feedback */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="glass-panel" style={{ padding: '12px', border: '1px solid var(--border-bright)' }}>
                <h4 style={{ fontSize: '13px', fontWeight: 600, marginBottom: '8px', color: 'var(--text-bright)' }}>
                  Doctor Sign-Off Panel
                </h4>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                  <input 
                    type="checkbox" 
                    id="override-check" 
                    checked={overrideActive} 
                    onChange={(e) => setOverrideActive(e.target.checked)}
                    style={{ width: '14px', height: '14px', cursor: 'pointer' }}
                  />
                  <label htmlFor="override-check" style={{ fontSize: '12px', fontWeight: 600, cursor: 'pointer', color: overrideActive ? 'var(--color-cyan)' : 'var(--text-secondary)' }}>
                    Override AI Prescription (Correct Error)
                  </label>
                </div>

                {overrideActive && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '10px' }}>
                    <label style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Corrected Prescription script</label>
                    <input 
                      type="text" 
                      value={doctorRxOverride}
                      onChange={(e) => setDoctorRxOverride(e.target.value)}
                      placeholder="Enter corrected drug and dosage..."
                    />
                    <span style={{ fontSize: '10px', color: 'var(--color-amber)', fontStyle: 'italic' }}>
                      Tip: Change Amoxicillin to <strong>Azithromycin 250mg - 1 tablet daily for 5 days</strong>.
                    </span>
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginBottom: '10px' }}>
                  <label style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Doctor Feedback / Explain Error (Updates ML Weights)</label>
                  <textarea 
                    value={doctorFeedback}
                    onChange={(e) => setDoctorFeedback(e.target.value)}
                    placeholder="Provide explanatory feedback for reinforcement learning..."
                    rows="2"
                    style={{ resize: 'none' }}
                  />
                </div>

                <button 
                  className="btn-primary" 
                  style={{ width: '100%', background: overrideActive ? 'var(--color-amber)' : 'var(--color-green)', color: 'white', justifyContent: 'center' }}
                  onClick={handleSubmitDoctorReview}
                >
                  <Icons.FileCheck size={16} />
                  {overrideActive ? 'Apply Correction & Train Model' : 'Co-Sign & Release Patient'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 5: DISCHARGE & SANITIZATION */}
      {currentStep === 5 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', flex: 1 }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-bright)' }}>
            5. Discharge Summary & Automatic UV Sanitization
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px' }}>
            
            {/* The Print Report Sheet */}
            <div 
              className="glass-panel" 
              style={{ 
                padding: '20px', 
                background: '#fff', 
                color: '#1e293b', 
                fontFamily: 'sans-serif',
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.08), 0 2px 4px -1px rgba(0,0,0,0.04)',
                border: '1px solid var(--border-muted)',
                borderRadius: '8px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #0f172a', paddingBottom: '8px', marginBottom: '10px' }}>
                <div>
                  <h2 style={{ fontSize: '13px', fontWeight: 800, margin: 0, textTransform: 'uppercase', color: '#0f172a' }}>
                    AI Health Capsule Network
                  </h2>
                  <span style={{ fontSize: '9px', color: '#64748b' }}>Node #012 - Autonomous Primary Portal</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '9px', color: '#64748b' }}>Date: {new Date().toLocaleDateString()}</div>
                  <div style={{ fontSize: '9px', color: '#64748b' }}>Session: {sessionState.sessionId}</div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '10px', marginBottom: '10px', background: '#f8fafc', padding: '8px', borderRadius: '4px' }}>
                <div><strong>Patient:</strong> {sessionState.patient.name}</div>
                <div><strong>Age/ID:</strong> {sessionState.patient.age} / {sessionState.patient.id}</div>
                <div><strong>Allergies:</strong> <span style={{ color: '#b91c1c', fontWeight: 600 }}>{sessionState.patient.allergies}</span></div>
                <div><strong>Language:</strong> {sessionState.patient.language}</div>
              </div>

              <div style={{ marginBottom: '10px' }}>
                <h4 style={{ fontSize: '9px', fontWeight: 700, borderBottom: '1px solid #cbd5e1', paddingBottom: '3px', textTransform: 'uppercase', color: '#0f172a', marginBottom: '4px' }}>
                  Biosensor Telemetry Readings
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px', fontSize: '10px', textAlign: 'center' }}>
                  <div style={{ background: '#f1f5f9', padding: '4px', borderRadius: '4px' }}>
                    <div style={{ color: '#64748b', fontSize: '8px' }}>Heart Rate</div>
                    <div style={{ fontWeight: 700 }}>{vitals.heartRate} bpm</div>
                  </div>
                  <div style={{ background: '#f1f5f9', padding: '4px', borderRadius: '4px' }}>
                    <div style={{ color: '#64748b', fontSize: '8px' }}>BP (Pressure)</div>
                    <div style={{ fontWeight: 700 }}>{vitals.bloodPressureSystolic}/{vitals.bloodPressureDiastolic}</div>
                  </div>
                  <div style={{ background: '#f1f5f9', padding: '4px', borderRadius: '4px' }}>
                    <div style={{ color: '#64748b', fontSize: '8px' }}>SpO₂</div>
                    <div style={{ fontWeight: 700 }}>{vitals.oxygenSaturation}%</div>
                  </div>
                  <div style={{ background: '#f1f5f9', padding: '4px', borderRadius: '4px' }}>
                    <div style={{ color: '#64748b', fontSize: '8px' }}>Temperature</div>
                    <div style={{ fontWeight: 700 }}>{vitals.temperature}°F</div>
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: '10px', fontSize: '10px' }}>
                <h4 style={{ fontSize: '9px', fontWeight: 700, borderBottom: '1px solid #cbd5e1', paddingBottom: '3px', textTransform: 'uppercase', color: '#0f172a', marginBottom: '4px' }}>
                  Clinical Suspected Diagnosis
                </h4>
                <div><strong>Differential Diagnosis:</strong> {sessionState.diagnosis} ({sessionState.diagnosisConfidence}% Confidence)</div>
                <div><strong>Risk Urgency Category:</strong> {sessionState.triage.toUpperCase()}</div>
              </div>

              <div style={{ marginBottom: '10px', fontSize: '10px' }}>
                <h4 style={{ fontSize: '9px', fontWeight: 700, borderBottom: '1px solid #cbd5e1', paddingBottom: '3px', textTransform: 'uppercase', color: '#0f172a', marginBottom: '4px' }}>
                  Authorized Prescription Script (Rx)
                </h4>
                <div style={{ border: '1px dashed #94a3b8', padding: '10px', borderRadius: '4px', background: '#f8fafc', fontWeight: 600, fontFamily: 'monospace', whiteSpace: 'pre-wrap', lineHeight: '1.4' }}>
                  {sessionState.prescription}
                </div>
              </div>

              <div style={{ fontSize: '9px', borderTop: '1px solid #e2e8f0', paddingTop: '8px', color: '#475569' }}>
                <div><strong>Clinician Remarks:</strong></div>
                <div style={{ fontStyle: 'italic', background: '#f1f5f9', padding: '4px', borderRadius: '4px', marginTop: '3px' }}>
                  "{sessionState.doctorComments}"
                </div>
              </div>
            </div>

            {/* Sanitization control panel */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', justifySelf: 'center', width: '100%', justifyContent: 'center' }}>
              <div className="glass-panel" style={{ padding: '20px', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
                <Icons.Sparkles size={40} style={{ color: 'var(--color-purple)' }} />
                
                {sessionState.status === 'sanitizing' ? (
                  <>
                    <h4 style={{ color: 'var(--color-purple)', fontSize: '16px', fontWeight: 700 }}>
                      UV-C Disinfection Active
                    </h4>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                      HEPA air filtration running at 100%. Atmospheric sterilizer pulsing at 254nm. Please wait...
                    </p>
                    <div style={{ width: '100%', height: '6px', background: 'rgba(0,0,0,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div 
                        style={{ 
                          height: '100%', 
                          background: 'var(--color-purple)', 
                          width: '100%',
                          animation: 'scanline 4s linear'
                        }} 
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <h4 style={{ color: 'var(--color-green)', fontSize: '16px', fontWeight: 700 }}>
                      Visit Concluded
                    </h4>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                      Release the isolation lock, discharge the patient, and initiate automatic environmental disinfection for the next occupant.
                    </p>
                    <button 
                      className="btn-primary" 
                      style={{ background: 'var(--color-purple)', color: '#fff', alignSelf: 'center', width: '100%', justifyContent: 'center' }}
                      onClick={handleDischargeAndSanitize}
                    >
                      <Icons.Unlock size={15} />
                      Discharge & Sanitize Clinic
                    </button>
                  </>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
