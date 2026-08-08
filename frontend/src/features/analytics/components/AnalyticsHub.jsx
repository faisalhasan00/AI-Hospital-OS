import React from 'react';
import * as Icons from 'lucide-react';

export default function AnalyticsHub({ analytics, trainingLogs }) {
  // SVG Triage Donut Chart proportions
  const lowRadius = 35;
  const circumference = 2 * Math.PI * lowRadius;
  
  // Simulated stats
  const totalVisits = 1428 + trainingLogs.length;
  const overrideCount = 12 + trainingLogs.filter(log => log.overridden).length;
  const accuracy = (100 - (overrideCount / totalVisits) * 100).toFixed(2);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
      
      {/* Overview Cards */}
      <div className="stats-grid">
        {/* Total Patients */}
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ padding: '12px', borderRadius: '10px', background: 'rgba(2, 132, 199, 0.08)', color: 'var(--color-cyan)' }}>
            <Icons.Users size={24} />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Total Clinic Visits</div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-bright)' }}>{totalVisits}</div>
            <div style={{ fontSize: '11px', color: 'var(--color-green)', display: 'flex', alignItems: 'center', gap: '2px', marginTop: '2px' }}>
              <Icons.ArrowUpRight size={12} /> +4.2% this week
            </div>
          </div>
        </div>

        {/* System Accuracy */}
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ padding: '12px', borderRadius: '10px', background: 'rgba(13, 148, 136, 0.08)', color: 'var(--color-teal)' }}>
            <Icons.Brain size={24} />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>AI Agent Accuracy</div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-bright)' }}>{accuracy}%</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
              Trial Mode Reinforcement
            </div>
          </div>
        </div>

        {/* Doctor Overrides */}
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ padding: '12px', borderRadius: '10px', background: 'rgba(217, 119, 6, 0.08)', color: 'var(--color-amber)' }}>
            <Icons.UserCheck size={24} />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Human Overrides</div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-bright)' }}>{overrideCount}</div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Doctor-corrected prescriptions
            </div>
          </div>
        </div>

        {/* Capsule Health */}
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ padding: '12px', borderRadius: '10px', background: 'rgba(22, 163, 74, 0.08)', color: 'var(--color-green)' }}>
            <Icons.Activity size={24} />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Capsule Network Node</div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-bright)' }}>Active</div>
            <div style={{ fontSize: '11px', color: 'var(--color-green)', marginTop: '2px' }}>
              HEPA Filters & UV-C: 99.8% OK
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        
        {/* Triage & Disease Distribution (Donut & Bars) */}
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-muted)', paddingBottom: '10px' }}>
            <Icons.PieChart style={{ color: 'var(--color-cyan)' }} />
            Triage & Diagnostics Distribution
          </h3>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', flex: 1, padding: '10px 0' }}>
            {/* SVG Custom Donut */}
            <div style={{ position: 'relative', width: '100px', height: '100px' }}>
              <svg width="100" height="100" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r={lowRadius} fill="none" stroke="rgba(0, 0, 0, 0.05)" strokeWidth="10" />
                
                {/* Low Risk circle - 58% */}
                <circle 
                  cx="50" cy="50" r={lowRadius} fill="none" 
                  stroke="var(--color-green)" strokeWidth="10" 
                  strokeDasharray={circumference}
                  strokeDashoffset={circumference * (1 - 0.58)}
                  transform="rotate(-90 50 50)"
                />
                
                {/* Medium Risk circle - 24% */}
                <circle 
                  cx="50" cy="50" r={lowRadius} fill="none" 
                  stroke="var(--color-amber)" strokeWidth="10" 
                  strokeDasharray={circumference}
                  strokeDashoffset={circumference * (1 - 0.24)}
                  transform={`rotate(${-90 + 360 * 0.58} 50 50)`}
                />

                {/* High Risk & Emergency - 18% */}
                <circle 
                  cx="50" cy="50" r={lowRadius} fill="none" 
                  stroke="var(--color-crimson)" strokeWidth="10" 
                  strokeDasharray={circumference}
                  strokeDashoffset={circumference * (1 - 0.18)}
                  transform={`rotate(${-90 + 360 * 0.82} 50 50)`}
                />
              </svg>
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                <span style={{ fontSize: '16px', fontWeight: 800 }}>Triage</span>
              </div>
            </div>

            {/* Legend indicators */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--color-green)' }}></span>
                <span style={{ color: 'var(--text-secondary)' }}>Low Risk (58%)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--color-amber)' }}></span>
                <span style={{ color: 'var(--text-secondary)' }}>Medium Risk (24%)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--color-crimson)' }}></span>
                <span style={{ color: 'var(--text-secondary)' }}>High/Emergency (18%)</span>
              </div>
            </div>
          </div>

          {/* Core disease patterns */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', borderTop: '1px solid var(--border-muted)', paddingTop: '15px' }}>
            <h4 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '4px' }}>
              Common Disease Classifications
            </h4>
            
            {[
              { name: 'Viral Fever / Influenza', count: '412 cases', width: '85%', color: 'var(--color-cyan)' },
              { name: 'Primary Hypertension', count: '284 cases', width: '60%', color: 'var(--color-amber)' },
              { name: 'Diabetes Risk Factors', count: '198 cases', width: '42%', color: 'var(--color-purple)' },
              { name: 'Bacterial Pharyngitis', count: '134 cases', width: '28%', color: 'var(--color-teal)' }
            ].map((disease, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{disease.name}</span>
                  <span style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>{disease.count}</span>
                </div>
                <div style={{ height: '6px', background: 'rgba(0,0,0,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: disease.width, background: disease.color, borderRadius: '3px' }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Reinforcement Learning Audit Log */}
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-muted)', paddingBottom: '10px' }}>
            <Icons.Cpu style={{ color: 'var(--color-teal)' }} />
            Reinforcement Learning Loop (Trial Mode)
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
            In **Trial Mode**, clinical recommendations are cross-checked by human doctors. Overrides feed back into the learning nodes, fine-tuning neural weights to avoid duplicate errors.
          </p>

          <div style={{ flex: 1, overflowY: 'auto', maxHeight: '250px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {trainingLogs.length === 0 ? (
              <div style={{ margin: 'auto', textAlign: 'center', color: 'var(--text-muted)' }}>
                <Icons.Database size={30} style={{ opacity: 0.2, marginBottom: '8px', display: 'inline-block' }} />
                <p style={{ fontSize: '12px', fontStyle: 'italic' }}>No human overrides logged in this session yet.</p>
              </div>
            ) : (
              trainingLogs.map((log, index) => (
                <div 
                  key={index} 
                  style={{ 
                    background: 'var(--bg-darker)', 
                    border: '1px solid var(--border-bright)', 
                    borderRadius: '8px', 
                    padding: '10px',
                    fontSize: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px'
                  }}
                  className={log.overridden ? 'glow-amber' : 'glow-green'}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600 }}>
                    <span style={{ color: 'var(--color-cyan)' }}>Patient: {log.patientName} ({log.patientId})</span>
                    <span style={{ color: log.overridden ? 'var(--color-amber)' : 'var(--color-green)' }}>
                      {log.overridden ? 'CRITICAL OVERRIDE' : 'DIRECT CO-SIGN'}
                    </span>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-secondary)' }}>Symptom Notes:</span> {log.symptoms}
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-secondary)' }}>AI Proposed Rx:</span> <code style={{ color: 'var(--color-crimson)', fontFamily: 'var(--font-mono)' }}>{log.proposedPrescription}</code>
                  </div>
                  {log.overridden && (
                    <>
                      <div>
                        <span style={{ color: 'var(--text-secondary)' }}>Doctor Correction:</span> <code style={{ color: 'var(--color-green)', fontFamily: 'var(--font-mono)' }}>{log.correctedPrescription}</code>
                      </div>
                      <div style={{ color: 'var(--color-amber)', fontStyle: 'italic', background: 'rgba(217, 119, 6, 0.08)', padding: '6px', borderRadius: '4px', marginTop: '4px' }}>
                        <strong>Feedback:</strong> "{log.doctorComment}"
                      </div>
                    </>
                  )}
                  <div style={{ 
                    fontSize: '10px', 
                    color: 'var(--color-teal)', 
                    fontFamily: 'var(--font-mono)', 
                    marginTop: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <Icons.TrendingUp size={10} />
                    {log.overridden ? 'Weight adjusted. Penalty applied to Penicillin-allergy vector.' : 'No penalty. Positive reinforcement applied.'}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
