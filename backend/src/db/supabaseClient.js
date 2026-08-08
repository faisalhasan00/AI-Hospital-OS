import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import ws from 'ws';

// Polyfill WebSocket for Node.js < 22 so Supabase Realtime doesn't crash
global.WebSocket = ws;

dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.warn('⚠️ WARNING: Missing SUPABASE_URL or SUPABASE_ANON_KEY in .env file.');
  console.warn('⚠️ The app will fail to persist data to Supabase. Please update your .env file.');
}

// Initialize Supabase Client
export const supabase = createClient(supabaseUrl || 'https://placeholder.supabase.co', supabaseKey || 'placeholder_key', {
  auth: {
    persistSession: false
  }
});
