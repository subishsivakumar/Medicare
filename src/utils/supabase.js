import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) 
  || (typeof process !== 'undefined' && process.env?.VITE_SUPABASE_URL) 
  || 'https://legcvukgzcyomlapjase.supabase.co';

const supabaseKey = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_PUBLISHABLE_KEY) 
  || (typeof process !== 'undefined' && process.env?.VITE_SUPABASE_PUBLISHABLE_KEY) 
  || 'sb_publishable_QJTjK1-FrqV99XxhBBHbdQ_sSoYQYcA';

export const supabase = createClient(supabaseUrl, supabaseKey);

