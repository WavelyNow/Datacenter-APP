
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
    if (process.env.NODE_ENV === 'production') {
        console.warn('Supabase environment variables are missing. Cloud features will be disabled.');
    }
}

export const supabase = (supabaseUrl && supabaseAnonKey)
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null as any; // Using 'any' here to avoid ripple effects in TS, but it's risky if called.

