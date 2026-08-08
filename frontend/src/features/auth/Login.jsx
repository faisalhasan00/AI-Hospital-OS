import React, { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Lock, User, Activity } from 'lucide-react';

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      setError(error.message);
    } else if (data.session) {
      onLogin(data.session);
    }
    
    setLoading(false);
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      backgroundColor: '#f1f5f9',
      fontFamily: 'var(--font-sans)',
      padding: '20px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '400px',
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        border: '1px solid #cbd5e1',
        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #0284c7 0%, #0d9488 100%)',
          padding: '30px 20px',
          textAlign: 'center',
          color: '#ffffff',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Activity className="animate-pulse-heart" size={40} style={{ color: '#ffffff' }} />
          <h1 style={{
            fontSize: '26px',
            fontWeight: 800,
            margin: '10px 0 4px 0',
            letterSpacing: '0.05em',
            color: '#ffffff'
          }}>
            AI HOSPITAL
          </h1>
          <p style={{
            fontSize: '13px',
            color: '#e0f2fe',
            fontWeight: 500,
            margin: 0
          }}>
            Doctor Authentication Portal
          </p>
        </div>

        {/* Card Body */}
        <div style={{ padding: '30px 25px' }}>
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {error && (
              <div style={{
                backgroundColor: '#fef2f2',
                border: '1px solid #fca5a5',
                color: '#b91c1c',
                padding: '12px',
                borderRadius: '8px',
                fontSize: '13px',
                lineHeight: '1.4'
              }}>
                {error}
              </div>
            )}
            
            {/* Email Field */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{
                fontSize: '12px',
                fontWeight: 600,
                color: '#475569'
              }}>
                Clinical ID (Email)
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <div style={{
                  position: 'absolute',
                  left: '12px',
                  color: '#94a3b8',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  <User size={18} />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 12px 12px 40px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '14px',
                    outline: 'none',
                    backgroundColor: '#f8fafc',
                    color: '#1e293b',
                    fontFamily: 'inherit'
                  }}
                  placeholder="doctor@ai-hospital.com"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{
                fontSize: '12px',
                fontWeight: 600,
                color: '#475569'
              }}>
                Passcode
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <div style={{
                  position: 'absolute',
                  left: '12px',
                  color: '#94a3b8',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 12px 12px 40px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '14px',
                    outline: 'none',
                    backgroundColor: '#f8fafc',
                    color: '#1e293b',
                    fontFamily: 'inherit'
                  }}
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px 20px',
                background: 'linear-gradient(135deg, #0284c7 0%, #0d9488 100%)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '14px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 2px 4px rgba(2, 132, 199, 0.2)',
                outline: 'none',
                opacity: loading ? 0.7 : 1,
                fontFamily: 'inherit'
              }}
            >
              {loading ? (
                <span style={{
                  width: '18px',
                  height: '18px',
                  border: '2px solid #ffffff',
                  borderTopColor: 'transparent',
                  borderRadius: '50%',
                  display: 'inline-block',
                  animation: 'signal-glow 1s infinite'
                }} />
              ) : (
                <span>ACCESS DASHBOARD</span>
              )}
            </button>
          </form>

          {/* Compliance Info */}
          <div style={{
            marginTop: '25px',
            textAlign: 'center',
            fontSize: '11px',
            color: '#64748b',
            lineHeight: '1.5'
          }}>
            <p style={{ margin: '0 0 4px 0', fontWeight: 500 }}>Authorized Medical Personnel Only.</p>
            <p style={{ margin: 0 }}>All access is logged and monitored for HIPAA/CDSCO compliance.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
