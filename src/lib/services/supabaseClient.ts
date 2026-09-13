import { createClient } from '@supabase/supabase-js';
import { env } from '$env/dynamic/public';

const supabaseUrl = 
    env.PUBLIC_SUPABASE_URL || 
    (typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_SUPABASE_URL : undefined);

const supabaseAnonKey = 
    env.PUBLIC_SUPABASE_ANON_KEY || 
    (typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_SUPABASE_ANON_KEY : undefined);

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Faltan las variables de entorno de Supabase (PUBLIC_SUPABASE_* o VITE_SUPABASE_*).');
}

export const supabase = createClient(
    supabaseUrl || '',
    supabaseAnonKey || ''
);
