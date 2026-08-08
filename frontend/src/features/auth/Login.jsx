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
        // Fallback for demo mode if Supabase user is not yet created
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
    // Demo session object
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
      backgroundColor: '#0b0f19',
      fontFamily: 'Inter, system-ui, sans-serif',
      padding: '20px',
      color: '#e2e8f0'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '420px',
        backgroundColor: '#1e293b',
        borderRadius: '16px',
        border: '1px solid #334155',
        boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5)',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #0284c7 0%, #0d9488 100%)',
          padding: '30px 20px',
          textAlign: 'center',
          color: '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Activity size={40} style={{ color: '#ffffff' }} />
          <h1 style={{
            fontSize: '24px',
            fontWeight: 800,
            margin: '10px 0 4px 0',
            letterSpacing: '0.05em',
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
            Doctor & Staff Authentication Portal
          </p>
        </div>

        {/* Card Body */}
        <div style={{ padding: '30px 25px' }}>
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {error && (
              <div style={{
                backgroundColor: '#7f1d1d',
                border: '1px solid #ef4444',
                color: '#fecaca',
                padding: '12px',
                borderRadius: '8px',
                fontSize: '13px'
              }}>
                {error}
              </div>
            )}
            
            {/* Email Field */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#94a3b8' }}>
                Clinical ID / Email
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <div style={{ position: 'absolute', left: '12px', color: '#64748b' }}>
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
                    border: '1px solid #334155',
                    fontSize: '14px',
                    backgroundColor: '#0f172a',
                    color: '#e2e8f0',
                    outline: 'none'
                  }}
                  placeholder="doctor@ai-hospital.com"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#94a3b8' }}>
                Passcode
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <div style={{ position: 'absolute', left: '12px', color: '#64748b' }}>
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
                    border: '1px solid #334155',
                    fontSize: '14px',
                    backgroundColor: '#0f172a',
                    color: '#e2e8f0',
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
                cursor: 'pointer'
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
                background: '#0f172a',
                color: '#38bdf8',
                border: '1px solid #0284c7',
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
            backgroundColor: '#0f172a',
            border: '1px solid #334155',
            padding: '12px',
            borderRadius: '8px',
            fontSize: '12px',
            color: '#94a3b8'
          }}>
            <strong style={{ color: '#38bdf8' }}>Demo Credentials:</strong>
            <div style={{ marginTop: '4px' }}>Email: <code>doctor@ai-hospital.com</code></div>
            <div>Password: <code>doctor123</code></div>
          </div>
        </div>
      </div>
    </div>
  );
}
