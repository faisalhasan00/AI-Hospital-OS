import React, { useState, useEffect } from 'react';
import * as Icons from 'lucide-react';
import DoctorOSWorkspace from './features/doctoros/DoctorOSWorkspace.jsx';
import Login from './features/auth/Login.jsx';
import { supabase } from './lib/supabaseClient.js';

export default function App() {
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setAuthLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (authLoading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#0b0f19', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#38bdf8' }}>
        <div style={{ fontSize: '1.2rem', fontWeight: 600 }}>Loading AI Clinic OS...</div>
      </div>
    );
  }

  if (!session) {
    return <Login onLogin={setSession} />;
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', color: '#0f172a' }}>
      <DoctorOSWorkspace userSession={session} onSignOut={() => supabase.auth.signOut()} />
    </div>
  );
}
