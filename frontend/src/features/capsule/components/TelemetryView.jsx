import React, { useEffect, useRef } from 'react';
import * as Icons from 'lucide-react';

export default function TelemetryView({ vitals, capsuleState }) {
  const canvasRef = useRef(null);

  // Draw real-time ECG waveform based on status
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationId;
    let x = 0;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const width = canvas.width;
    const height = canvas.height;
    const midY = height / 2;
    
    // Wave buffer to store points for drawing trailing line
    const points = [];
    const maxPoints = width;

    // ECG wave parameters based on current heart rate and pattern
    const bpm = vitals?.heartRate || 75;
    const pattern = vitals?.ecgPattern || 'Normal Sinus Rhythm';
    
    // Adjust speed and wave intervals based on BPM
    const speed = pattern === 'Sinus Tachycardia' ? 3 : 2;
    const cycleLength = Math.max(30, Math.floor(6000 / bpm));

    let cycleProgress = 0;

    const draw = () => {
      ctx.fillStyle = 'rgba(248, 250, 252, 0.2)';
      ctx.fillRect(0, 0, width, height);

      // Draw Grid Lines (simulated paper)
      ctx.strokeStyle = 'rgba(2, 132, 199, 0.08)';
      ctx.lineWidth = 0.5;
      for (let i = 0; i < width; i += 20) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, height);
        ctx.stroke();
      }
      for (let i = 0; i < height; i += 20) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(width, i);
        ctx.stroke();
      }

      cycleProgress += speed;
      if (cycleProgress >= cycleLength) {
        cycleProgress = 0;
      }

      let yOffset = 0;

      // ECG wave generation logic (P, Q, R, S, T segments)
      if (pattern === 'ST-Elevation (Infarction)') {
        // Elevated ST segment (Heart Attack)
        if (cycleProgress > 0 && cycleProgress < 4) {
          yOffset = 0; // Baseline
        } else if (cycleProgress >= 4 && cycleProgress < 8) {
          yOffset = -5; // P wave
        } else if (cycleProgress >= 12 && cycleProgress < 14) {
          yOffset = 5; // Q wave
        } else if (cycleProgress >= 14 && cycleProgress < 17) {
          yOffset = -35; // R wave (Tall spike)
        } else if (cycleProgress >= 17 && cycleProgress < 19) {
          yOffset = 20; // S wave
        } else if (cycleProgress >= 19 && cycleProgress < 28) {
          // Elevated ST segment (doesn't return to baseline, stays high)
          yOffset = -15; 
        } else if (cycleProgress >= 28 && cycleProgress < 36) {
          yOffset = -8; // T wave (fused with ST)
        }
      } else if (pattern === 'Atrial Fibrillation (Arrhythmia)') {
        // Chaotic, small fibrillatory waves (f-waves) and irregular intervals
        const noise = Math.sin(cycleProgress * 0.8) * 3 + Math.cos(cycleProgress * 1.5) * 1.5;
        yOffset = noise;
        
        // Occasional random QRS spike
        const randomTrigger = Math.random() < 0.04;
        if (randomTrigger && cycleProgress > 15) {
          cycleProgress = 0; // reset cycle randomly
        }
        if (cycleProgress >= 0 && cycleProgress < 3) {
          yOffset = -25; // R spike
        } else if (cycleProgress >= 3 && cycleProgress < 5) {
          yOffset = 15; // S spike
        }
      } else {
        // Normal Sinus Rhythm or Sinus Tachycardia
        const pStart = 5;
        const qStart = 15;
        const rStart = 17;
        const sStart = 20;
        const tStart = 25;
        const tEnd = 35;

        if (cycleProgress >= pStart && cycleProgress < qStart) {
          // P Wave (Atrial depolarization)
          yOffset = -4 * Math.sin(((cycleProgress - pStart) / (qStart - pStart)) * Math.PI);
        } else if (cycleProgress >= qStart && cycleProgress < rStart) {
          // Q Wave (Septal depolarization)
          yOffset = 3 * ((cycleProgress - qStart) / (rStart - qStart));
        } else if (cycleProgress >= rStart && cycleProgress < sStart) {
          // R Wave (Ventricular depolarization spike)
          const pct = (cycleProgress - rStart) / (sStart - rStart);
          yOffset = 3 - (38 * Math.sin(pct * Math.PI));
        } else if (cycleProgress >= sStart && cycleProgress < tStart) {
          // S Wave (Late ventricular depolarization)
          const pct = (cycleProgress - sStart) / (tStart - sStart);
          yOffset = 8 * (1 - pct);
        } else if (cycleProgress >= tStart && cycleProgress < tEnd) {
          // T Wave (Ventricular repolarization)
          yOffset = -8 * Math.sin(((cycleProgress - tStart) / (tEnd - tStart)) * Math.PI);
        }
      }

      // Add new point and shift line
      points.push(midY + yOffset);
      if (points.length > maxPoints) {
        points.shift();
      }

      // Render line
      ctx.beginPath();
      ctx.lineWidth = 2.0;
      
      const lineGradient = ctx.createLinearGradient(0, 0, width, 0);
      lineGradient.addColorStop(0, 'rgba(22, 163, 74, 0.1)');
      lineGradient.addColorStop(0.8, '#16a34a');
      lineGradient.addColorStop(1, '#16a34a');
      ctx.strokeStyle = lineGradient;
      ctx.shadowBlur = 0;
      ctx.shadowColor = 'transparent';

      for (let i = 0; i < points.length; i++) {
        if (i === 0) {
          ctx.moveTo(i, points[i]);
        } else {
          ctx.lineTo(i, points[i]);
        }
      }
      ctx.stroke();
      ctx.shadowBlur = 0; // reset shadow

      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [vitals?.heartRate, vitals?.ecgPattern]);

  const getBPCategory = (systolic, diastolic) => {
    if (systolic >= 180 || diastolic >= 120) return { label: 'Crisis (Emergency)', color: 'var(--color-crimson)' };
    if (systolic >= 140 || diastolic >= 90) return { label: 'Hypertension Stage 2', color: 'var(--color-crimson)' };
    if (systolic >= 130 || diastolic >= 80) return { label: 'Hypertension Stage 1', color: 'var(--color-amber)' };
    if (systolic >= 120 && diastolic < 80) return { label: 'Elevated', color: 'var(--color-teal)' };
    return { label: 'Normal', color: 'var(--color-green)' };
  };

  const getTempCategory = (temp) => {
    if (temp >= 103) return { label: 'Severe Fever', color: 'var(--color-crimson)' };
    if (temp >= 100.4) return { label: 'Fever', color: 'var(--color-amber)' };
    if (temp < 95.0) return { label: 'Hypothermia', color: 'var(--color-crimson)' };
    return { label: 'Normal', color: 'var(--color-green)' };
  };

  const getSpO2Category = (spo2) => {
    if (spo2 < 90) return { label: 'Hypoxia (Emergency)', color: 'var(--color-crimson)' };
    if (spo2 < 95) return { label: 'Caution (Low)', color: 'var(--color-amber)' };
    return { label: 'Optimal', color: 'var(--color-green)' };
  };

  const bpCat = getBPCategory(vitals?.bloodPressureSystolic || 120, vitals?.bloodPressureDiastolic || 80);
  const tempCat = getTempCategory(vitals?.temperature || 98.6);
  const spo2Cat = getSpO2Category(vitals?.oxygenSaturation || 98);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px' }}>
      
      {/* Environmental Telemetry */}
      <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-muted)', paddingBottom: '10px' }}>
          <Icons.ShieldAlert style={{ color: 'var(--color-cyan)' }} />
          Capsule Environment
        </h3>
        
        {/* Physical Status list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Lock Status</span>
            <span style={{ 
              fontWeight: 600, 
              color: capsuleState.doorLocked ? 'var(--color-green)' : 'var(--color-amber)',
              display: 'flex', 
              alignItems: 'center', 
              gap: '4px' 
            }}>
              {capsuleState.doorLocked ? <Icons.Lock size={14} /> : <Icons.Unlock size={14} />}
              {capsuleState.doorLocked ? 'LOCKED (Occupied)' : 'UNLOCKED'}
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Sanitization (UV-C)</span>
            <span style={{ 
              fontWeight: 600, 
              color: capsuleState.uvcActive ? 'var(--color-purple)' : 'var(--text-muted)',
              display: 'flex', 
              alignItems: 'center', 
              gap: '4px' 
            }}>
              <Icons.Sparkles size={14} className={capsuleState.uvcActive ? 'animate-pulse' : ''} />
              {capsuleState.uvcActive ? 'STERILIZING...' : 'STANDBY'}
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>HVAC Ventilation</span>
            <span style={{ fontWeight: 600, color: 'var(--color-teal)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Icons.Wind size={14} style={{ transform: capsuleState.ventilationSpeed > 0 ? 'rotate(45deg)' : 'none', transition: 'transform 2s linear' }} />
              {capsuleState.ventilationSpeed}% Flow Rate
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Ambient Lighting</span>
            <span style={{ 
              fontWeight: 600, 
              color: capsuleState.lightingColor === 'purple' ? 'var(--color-purple)' :
                     capsuleState.lightingColor === 'red' ? 'var(--color-crimson)' :
                     capsuleState.lightingColor === 'blue' ? 'var(--color-cyan)' : 'var(--color-green)',
              display: 'flex', 
              alignItems: 'center', 
              gap: '4px'
            }}>
              <Icons.Lightbulb size={14} />
              {capsuleState.lightingColor.toUpperCase()} CALM
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>HEPA Air Quality</span>
            <span style={{ fontWeight: 600, color: 'var(--color-green)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Icons.ThumbsUp size={14} />
              99.2% (Pure)
            </span>
          </div>
        </div>

        {/* Hardware Status visual diagram */}
        <div style={{ 
          marginTop: 'auto', 
          background: 'rgba(0, 240, 255, 0.02)', 
          border: '1px dashed var(--border-muted)', 
          borderRadius: '8px', 
          padding: '12px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px',
          position: 'relative'
        }}
        className={capsuleState.uvcActive ? 'uvc-sanitization-glow' : capsuleState.lightingColor === 'red' ? 'emergency-flash-glow' : ''}
        >
          <span style={{ fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
            Physical Capsule Blueprint
          </span>
          <div style={{ 
            width: '100px', 
            height: '140px', 
            border: '1px solid var(--border-bright)', 
            borderRadius: '24px', 
            position: 'relative', 
            display: 'flex', 
            flexDirection: 'column', 
            justifyContent: 'center', 
            alignItems: 'center',
            background: 'var(--bg-darker)'
          }}>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: capsuleState.doorLocked ? 'var(--color-crimson)' : 'var(--color-green)',
              position: 'absolute',
              top: '12px',
              right: '12px'
            }} />
            
            {/* Disinfection UV-C glow elements */}
            {capsuleState.uvcActive && (
              <div style={{
                position: 'absolute',
                width: '90%',
                height: '90%',
                background: 'radial-gradient(circle, rgba(157,78,221,0.2) 0%, transparent 80%)',
                borderRadius: '20px',
                animation: 'uvc-disinfect 1.5s infinite'
              }} />
            )}

            {/* Patient silhouette */}
            {capsuleState.doorLocked ? (
              <Icons.User size={48} style={{ color: 'var(--color-cyan)', opacity: 0.8, filter: 'drop-shadow(0 0 5px var(--color-cyan))' }} />
            ) : (
              <Icons.UserMinus size={48} style={{ color: 'var(--text-muted)', opacity: 0.2 }} />
            )}
            <span style={{ fontSize: '9px', color: 'var(--text-secondary)', marginTop: '8px', fontWeight: 500 }}>
              {capsuleState.doorLocked ? 'PATIENT IN CAPSULE' : 'CAPSULE VACANT'}
            </span>
          </div>
        </div>
      </div>

      {/* Patient Vitals telemetry */}
      <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-muted)', paddingBottom: '10px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Icons.HeartPulse style={{ color: 'var(--color-crimson)' }} />
            Biosensors & Vitals Stream (Inputs)
          </h3>
          <span style={{ 
            fontFamily: 'var(--font-mono)', 
            fontSize: '11px', 
            color: 'var(--color-teal)', 
            padding: '2px 8px', 
            borderRadius: '4px', 
            background: 'rgba(13, 148, 136, 0.08)'
          }}>
            DEVICE INTEGRATION STATE: ACTIVE
          </span>
        </div>

        {/* Live Vitals Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px' }}>
          
          {/* Heart Rate */}
          <div style={{ background: 'var(--bg-darker)', border: '1px solid var(--border-muted)', borderRadius: '12px', padding: '12px', textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px', color: 'var(--color-crimson)', marginBottom: '8px' }}>
              <Icons.Heart className="animate-pulse-heart" size={16} />
              <span style={{ fontSize: '12px', fontWeight: 600, textTransform: 'uppercase' }}>Heart Rate</span>
            </div>
            <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-bright)' }}>
              {vitals ? vitals.heartRate : '--'} <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)' }}>bpm</span>
            </div>
            <div style={{ fontSize: '10px', color: 'var(--text-secondary)', marginTop: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {vitals ? vitals.ecgPattern : 'No reading'}
            </div>
          </div>

          {/* Blood Pressure */}
          <div style={{ background: 'var(--bg-darker)', border: '1px solid var(--border-muted)', borderRadius: '12px', padding: '12px', textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px', color: 'var(--color-cyan)', marginBottom: '8px' }}>
              <Icons.Activity size={16} />
              <span style={{ fontSize: '12px', fontWeight: 600, textTransform: 'uppercase' }}>Blood Pressure</span>
            </div>
            <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-bright)' }}>
              {vitals ? `${vitals.bloodPressureSystolic}/${vitals.bloodPressureDiastolic}` : '--/--'}
              <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)' }}> mmHg</span>
            </div>
            <div style={{ fontSize: '10px', color: bpCat.color, marginTop: '4px', fontWeight: 600 }}>
              {vitals ? bpCat.label : 'No reading'}
            </div>
          </div>

          {/* Oxygen Saturation SpO2 */}
          <div style={{ background: 'var(--bg-darker)', border: '1px solid var(--border-muted)', borderRadius: '12px', padding: '12px', textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px', color: 'var(--color-teal)', marginBottom: '8px' }}>
              <Icons.Droplets size={16} />
              <span style={{ fontSize: '12px', fontWeight: 600, textTransform: 'uppercase' }}>SpO₂</span>
            </div>
            <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-bright)' }}>
              {vitals ? vitals.oxygenSaturation : '--'} <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)' }}>%</span>
            </div>
            <div style={{ fontSize: '10px', color: spo2Cat.color, marginTop: '4px', fontWeight: 600 }}>
              {vitals ? spo2Cat.label : 'No reading'}
            </div>
          </div>

          {/* Temperature */}
          <div style={{ background: 'var(--bg-darker)', border: '1px solid var(--border-muted)', borderRadius: '12px', padding: '12px', textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px', color: 'var(--color-amber)', marginBottom: '8px' }}>
              <Icons.Thermometer size={16} />
              <span style={{ fontSize: '12px', fontWeight: 600, textTransform: 'uppercase' }}>Temperature</span>
            </div>
            <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-bright)' }}>
              {vitals ? vitals.temperature.toFixed(1) : '--.-'} <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)' }}>°F</span>
            </div>
            <div style={{ fontSize: '10px', color: tempCat.color, marginTop: '4px', fontWeight: 600 }}>
              {vitals ? tempCat.label : 'No reading'}
            </div>
          </div>
        </div>

        {/* ECG Waveform Canvas Panel */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Lead II Real-time ECG Sweep
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: 'var(--text-muted)' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--color-green)', display: 'inline-block', boxShadow: '0 0 5px var(--color-green)' }}></span>
              Telemetry Sync Valid
            </span>
          </div>
          <div style={{ 
            background: 'var(--bg-darker)', 
            border: '1px solid var(--border-bright)', 
            borderRadius: '12px', 
            height: '140px',
            position: 'relative',
            overflow: 'hidden'
          }} className="ecg-grid-fine">
            <canvas 
              ref={canvasRef} 
              width={700} 
              height={140} 
              style={{ width: '100%', height: '100%', display: 'block' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
