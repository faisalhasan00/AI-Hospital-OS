import React, { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Lock, User, Activity, Zap } from 'lucide-react';

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('doctor@ai-hospital.com');
  const [password, setPassword] = useState('doctor123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.warn('Supabase Auth warning, proceeding in Demo Mode:', error.message);
        handleDemoLogin();
        return;
      } else if (data.session) {
        onLogin(data.session);
      }
    } catch (err) {
      handleDemoLogin();
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = () => {
    const demoSession = {
      user: {
        id: 'demo-doctor-id',
        email: email || 'doctor@ai-hospital.com',
        user_metadata: { full_name: 'Dr. Ahmed' }
      },
      access_token: 'demo-access-token'
    };
    onLogin(demoSession);
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      backgroundColor: '#f8fafc',
      fontFamily: 'Inter, system-ui, sans-serif',
      padding: '20px',
      color: '#0f172a'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '420px',
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 10px 25px -5px rgba(0,0,0,0.08), 0 8px 10px -6px rgba(0,0,0,0.04)',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #0284c7 0%, #0d9488 100%)',
          padding: '32px 20px',
          textAlign: 'center',
          color: '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{
            background: 'rgba(255,255,255,0.2)',
            padding: '10px',
            borderRadius: '12px',
            marginBottom: '8px'
          }}>
            <Activity size={36} style={{ color: '#ffffff' }} />
          </div>
          <h1 style={{
            fontSize: '24px',
            fontWeight: 800,
            margin: '6px 0 4px 0',
            letterSpacing: '0.04em',
            color: '#ffffff'
          }}>
            AI CLINIC OS
          </h1>
          <p style={{
            fontSize: '13px',
            color: '#e0f2fe',
            fontWeight: 500,
            margin: 0
          }}>
            Doctor & Clinical Staff Authentication
          </p>
        </div>

        {/* Card Body */}
        <div style={{ padding: '30px 25px' }}>
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {error && (
              <div style={{
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#991b1b',
                padding: '12px',
                borderRadius: '8px',
                fontSize: '13px'
              }}>
                {error}
              </div>
            )}
            
            {/* Email Field */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}>
                Clinical ID / Email
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <div style={{ position: 'absolute', left: '12px', color: '#94a3b8' }}>
                  <User size={18} />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '11px 11px 11px 40px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '14px',
                    backgroundColor: '#ffffff',
                    color: '#0f172a',
                    outline: 'none'
                  }}
                  placeholder="doctor@ai-hospital.com"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}>
                Passcode
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <div style={{ position: 'absolute', left: '12px', color: '#94a3b8' }}>
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '11px 11px 11px 40px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '14px',
                    backgroundColor: '#ffffff',
                    color: '#0f172a',
                    outline: 'none'
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
                boxShadow: '0 2px 4px rgba(2, 132, 199, 0.2)'
              }}
            >
              {loading ? 'Authenticating...' : 'ACCESS CLINIC DASHBOARD'}
            </button>

            {/* Quick Demo Login Button */}
            <button
              type="button"
              onClick={handleDemoLogin}
              style={{
                width: '100%',
                padding: '10px 20px',
                background: '#f0f9ff',
                color: '#0369a1',
                border: '1px solid #bae6fd',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '13px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <Zap size={16} /> Quick Demo Login (One Click Access)
            </button>
          </form>

          {/* Sample Credentials Box */}
          <div style={{
            marginTop: '20px',
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            padding: '12px',
            borderRadius: '8px',
            fontSize: '12px',
            color: '#64748b'
          }}>
            <strong style={{ color: '#0284c7' }}>Demo Credentials:</strong>
            <div style={{ marginTop: '4px' }}>Email: <code>doctor@ai-hospital.com</code></div>
            <div>Password: <code>doctor123</code></div>
          </div>
        </div>
      </div>
    </div>
  );
}
