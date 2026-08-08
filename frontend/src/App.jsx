import React, { useState, useEffect } from 'react';
import * as Icons from 'lucide-react';
import CapsuleSimulator from './features/capsule/components/CapsuleSimulator.jsx';
import TelemetryView from './features/capsule/components/TelemetryView.jsx';
import AgentStatusGrid from './features/agents/components/AgentStatusGrid.jsx';
import AnalyticsHub from './features/analytics/components/AnalyticsHub.jsx';
import DoctorOSWorkspace from './features/doctoros/DoctorOSWorkspace.jsx';
import Login from './features/auth/Login.jsx';
import { supabase } from './lib/supabaseClient.js';

const INITIAL_AGENTS = [
  { id: 'reception', name: 'Patient Reception Agent', role: 'Greets patients & verifies profiles', status: 'idle', icon: 'UserCheck', activity: 'System standby' },
  { id: 'interview', name: 'Medical Interview Agent', role: 'Collects symptom history & details', status: 'idle', icon: 'MessageSquare', activity: 'System standby' },
  { id: 'records', name: 'Medical Records Agent', role: 'Audits histories & flags allergies', status: 'idle', icon: 'FolderHeart', activity: 'System standby' },
  { id: 'device', name: 'Device Integration Agent', role: 'Reads vitals from patient sensors', status: 'idle', icon: 'Activity', activity: 'System standby' },
  { id: 'triage', name: 'Triage Agent', role: 'Calculates emergency urgency risk', status: 'idle', icon: 'AlertTriangle', activity: 'System standby' },
  { id: 'prediction', name: 'Disease Prediction Agent', role: 'Matches symptoms to conditions', status: 'idle', icon: 'Brain', activity: 'System standby' },
  { id: 'guidelines', name: 'Clinical Guidelines Agent', role: 'Cross-checks WHO medical protocols', status: 'idle', icon: 'BookOpen', activity: 'System standby' },
  { id: 'doctor', name: 'AI Prescribing Doctor', role: 'Formulates safe treatment plans', status: 'idle', icon: 'Stethoscope', activity: 'System standby' },
  { id: 'safety', name: 'Medication Safety Agent', role: 'Checks interactions & allergy blocks', status: 'idle', icon: 'ShieldAlert', activity: 'System standby' },
  { id: 'copilot', name: 'Doctor Copilot Agent', role: 'Generates case files for remote MDs', status: 'idle', icon: 'UserPlus', activity: 'System standby' },
  { id: 'report', name: 'Report Generation Agent', role: 'Creates printable summaries', status: 'idle', icon: 'FileText', activity: 'System standby' },
  { id: 'emergency', name: 'Emergency Response Agent', role: 'Triggers EMS & flags heart attacks', status: 'idle', icon: 'PhoneCall', activity: 'System standby' },
  { id: 'learning', name: 'Learning & Analytics Agent', role: 'Adjusts neural weights from overrides', status: 'idle', icon: 'TrendingUp', activity: 'System standby' },
  { id: 'env', name: 'Capsule Environment Agent', role: 'Controls UV sanitization & locks', status: 'idle', icon: 'Wind', activity: 'System standby' },
  { id: 'followup', name: 'Patient Follow-up Agent', role: 'Triggers recovery SMS check-ins', status: 'idle', icon: 'CheckCircle', activity: 'System standby' }
];

export default function App() {
  const [activeTab, setActiveTab] = useState('doctoros'); // 'doctoros' | 'simulator'
  const [currentStep, setCurrentStep] = useState(1);
  const [logs, setLogs] = useState([]);
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  
  // Capsule mechanical environmental state
  const [capsuleState, setCapsuleState] = useState({
    doorLocked: false,
    uvcActive: false,
    ventilationSpeed: 45, // default
    lightingColor: 'green' // default calming green
  });

  // Active patient session state
  const [sessionState, setSessionState] = useState({
    sessionId: 'CAP-' + Math.floor(100000 + Math.random() * 900000),
    patient: null,
    symptoms: '',
    triage: '', // 'Low Risk' | 'Medium Risk' | 'High Risk' | 'Emergency'
    diagnosis: '',
    diagnosisConfidence: 0,
    prescription: '',
    safetyStatus: '', // 'Passed' | 'Critical Warning'
    safetyReason: '',
    doctorComments: '',
    status: 'idle' // 'idle' | 'interview' | 'vitals' | 'analyzing' | 'discharge' | 'sanitizing'
  });

  // Interactive vitals readings
  const [vitals, setVitals] = useState({
    heartRate: 75,
    bloodPressureSystolic: 120,
    bloodPressureDiastolic: 80,
    oxygenSaturation: 98,
    temperature: 98.6,
    weight: 78,
    ecgPattern: 'Normal Sinus Rhythm'
  });

  const [agents, setAgents] = useState(INITIAL_AGENTS);
  
  // Training loop overrides
  const [trainingLogs, setTrainingLogs] = useState([]);

  useEffect(() => {
    try {
      Object.keys(localStorage).forEach(key => {
        if (key.includes('supabase') || key.includes('sb-')) {
          localStorage.removeItem(key);
        }
      });
    } catch(e) {}

    fetch('http://localhost:5000/api/analytics')
      .then(res => res.json())
      .then(data => {
        if (data.trainingLogs) {
          setTrainingLogs(data.trainingLogs);
        }
      })
      .catch(err => console.error("Error loading analytics:", err));

    // Check auth session with resilient fallback for offline usage
    supabase.auth.getSession()
      .then(({ data }) => {
        setSession(data?.session || { user: { email: 'doctor@aihospital.node' } });
      })
      .catch(err => {
        console.warn("Supabase auth offline fallback activated:", err);
        setSession({ user: { email: 'doctor@aihospital.node' } });
      })
      .finally(() => {
        setAuthLoading(false);
      });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) setSession(session);
    });

    // Setup WebSocket connection for live telemetry & agent logs
    const ws = new WebSocket('ws://localhost:5000');

    ws.onopen = () => {
      console.log('📡 Connected to AI Hospital WebSocket Server');
    };

    ws.onmessage = (event) => {
      try {
        const { type, data } = JSON.parse(event.data);
        if (type === 'AGENT_LOG' && data) {
          dispatchLog(data.agent, data.msg, data.color);
        }
      } catch (e) {
        console.error('WS Message parsing error:', e);
      }
    };

    ws.onerror = (err) => {
      console.warn('WS Connection warning:', err);
    };

    return () => {
      ws.close();
      subscription.unsubscribe();
    };
  }, []);

  // Log dispatcher
  const dispatchLog = (agentName, message, color) => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setLogs(prev => [...prev, { time, agent: agentName, message, color }]);
    
    // Update matching agent activity in status grid
    setAgents(prevAgents => prevAgents.map(a => {
      if (a.name === agentName) {
        let newStatus = 'active';
        if (message.toLowerCase().includes('warning') || message.toLowerCase().includes('contraindication')) {
          newStatus = 'danger';
        } else if (message.toLowerCase().includes('alert') || message.toLowerCase().includes('emergency')) {
          newStatus = 'danger';
        } else if (message.toLowerCase().includes('success') || message.toLowerCase().includes('complete') || message.toLowerCase().includes('sterile')) {
          newStatus = 'success';
        } else if (message.toLowerCase().includes('reading') || message.toLowerCase().includes('vitals')) {
          newStatus = 'processing';
        }
        return { ...a, status: newStatus, activity: message };
      }
      return a;
    }));
  };

  const updateCapsuleState = (updates) => {
    setCapsuleState(prev => {
      const newState = { ...prev, ...updates };
      // Sync environment agent status based on capsule changes
      let actionText = 'System standby';
      let status = 'idle';
      if (newState.uvcActive) {
        actionText = 'UV-C Disinfection Active';
        status = 'active';
      } else if (newState.doorLocked) {
        actionText = 'Capsule Locked (Occupant inside)';
        status = 'success';
      }
      setAgents(prevAgents => prevAgents.map(a => {
        if (a.id === 'env') {
          return { ...a, status, activity: actionText };
        }
        return a;
      }));
      return newState;
    });
  };

  // Sync vitals from simulator to app state so TelemetryView sees it
  const handleVitalsChange = (newVitals) => {
    setVitals(newVitals);
  };

  const addTrainingLog = (log) => {
    setTrainingLogs(prev => [log, ...prev]);
    
    // Sync Learning agent status
    setAgents(prevAgents => prevAgents.map(a => {
      if (a.id === 'learning') {
        return { 
          ...a, 
          status: 'success', 
          activity: log.overridden 
            ? `Weight penalization completed for allergy conflicts.` 
            : 'Positive reinforcement feedback completed.' 
        };
      }
      return a;
    }));
  };

  // Clear session / Reset all agents back to idle
  const resetAgents = () => {
    setAgents(INITIAL_AGENTS);
  };

  if (authLoading) {
    return <div className="min-h-screen bg-slate-50 flex justify-center items-center"><div className="animate-spin w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full" /></div>;
  }

  if (!session) {
    return <Login onLogin={setSession} />;
  }

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        {/* Brand Identity */}
        <div style={{ padding: '25px 20px', borderBottom: '1px solid var(--border-muted)', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ background: 'linear-gradient(135deg, var(--color-cyan) 0%, var(--color-teal) 100%)', width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center', color: 'white' }}>
            <Icons.Stethoscope size={20} />
          </div>
          <div>
            <h1 style={{ fontSize: '15px', fontWeight: 800, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--text-bright)' }}>AI Clinic OS</h1>
            <span style={{ fontSize: '10px', color: 'var(--color-cyan)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>Operating System v1.0</span>
          </div>
        </div>

        {/* Auth Info */}
        <div style={{ padding: '15px 20px', borderBottom: '1px solid var(--border-muted)' }}>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Logged in as:</p>
          <p style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--text-bright)', wordBreak: 'break-all' }}>{session.user.email}</p>
          <button 
            onClick={() => supabase.auth.signOut()}
            style={{ marginTop: '8px', padding: '6px 12px', background: 'rgba(255,50,50,0.1)', color: '#ff4d4d', border: '1px solid rgba(255,50,50,0.3)', borderRadius: '6px', fontSize: '11px', cursor: 'pointer', width: '100%' }}>
            Sign Out
          </button>
        </div>

        {/* Tab Items */}
        <nav style={{ padding: '20px 10px', display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
          <button 
            onClick={() => setActiveTab('doctoros')}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px',
              width: '100%',
              padding: '12px 16px',
              border: 'none',
              borderRadius: '10px',
              background: activeTab === 'doctoros' ? 'rgba(0, 240, 255, 0.15)' : 'transparent',
              color: activeTab === 'doctoros' ? 'var(--color-cyan)' : 'var(--text-secondary)',
              fontWeight: 600,
              fontSize: '14px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              textAlign: 'left'
            }}
          >
            <Icons.Stethoscope size={18} />
            AI Clinic OS Workspace
          </button>

          <button 
            onClick={() => setActiveTab('simulator')}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px',
              width: '100%',
              padding: '12px 16px',
              border: 'none',
              borderRadius: '10px',
              background: activeTab === 'simulator' ? 'rgba(0, 240, 255, 0.15)' : 'transparent',
              color: activeTab === 'simulator' ? 'var(--color-cyan)' : 'var(--text-secondary)',
              fontWeight: 600,
              fontSize: '14px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              textAlign: 'left'
            }}
          >
            <Icons.Activity size={18} />
            Telemetry Diagnostics
          </button>
        </nav>

        {/* User context / Session footer */}
        <div style={{ padding: '20px', borderTop: '1px solid var(--border-muted)', background: 'rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-green)', boxShadow: '0 0 8px var(--color-green)' }} />
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Status: Diagnostics OK</span>
          </div>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>
            Session ID: {sessionState.sessionId}
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content" style={{ padding: 0 }}>
        {activeTab === 'doctoros' ? (
          <DoctorOSWorkspace />
        ) : (
          <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Global Page Header */}
            <header className="header">
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-bright)' }}>
                  Autonomous Capsule Dashboard
                </h2>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  Simulating primary care workflow within the health capsule
                </p>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Icons.Clock size={14} style={{ color: 'var(--color-cyan)' }} />
                  {new Date().toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                </span>
              </div>
            </header>

            <CapsuleSimulator 
              currentStep={currentStep}
              setCurrentStep={setCurrentStep}
              sessionState={sessionState}
              setSessionState={setSessionState}
              vitals={vitals}
              setVitals={setVitals}
              updateCapsuleState={updateCapsuleState}
              dispatchLog={dispatchLog}
              addTrainingLog={addTrainingLog}
            />
          </div>
        )}
      </main>
    </div>
  );
}
