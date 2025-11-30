import { createClient } from '@supabase/supabase-js';
import { env } from '../config/index.js';

/**
 * Supabase client instance
 */
export const supabase = createClient(
  env.SUPABASE_URL,
  env.SUPABASE_SERVICE_KEY
);

/**
 * Test database connection
 */
export async function testConnection() {
  try {
    const { error } = await supabase.from('users').select('count', { count: 'exact', head: true });
    
    if (error) throw error;
    
    console.log('✅ Database connected');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    throw error;
  }
}

export default supabase;