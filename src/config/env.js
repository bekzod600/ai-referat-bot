import dotenv from 'dotenv';

dotenv.config();

/**
 * Environment variables
 */
export const env = {
  // Telegram
  BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,
  ADMIN_ID: parseInt(process.env.ADMIN_TELEGRAM_ID),
  CHANNEL_ID: parseInt(process.env.CHANNEL_ID),
  CHANNEL_USERNAME: process.env.CHANNEL_USERNAME,
  
  // Supabase
  SUPABASE_URL: process.env.SUPABASE_URL,
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  
  // OpenAI (future)
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  
  // Node environment
  NODE_ENV: process.env.NODE_ENV || 'development',
};

/**
 * Validate required environment variables
 */
export function validateEnv() {
  const required = [
    'BOT_TOKEN',
    'ADMIN_ID',
    'SUPABASE_URL',
    'SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_KEY',
  ];
  
  const missing = required.filter(key => !env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
  
  console.log('✅ Environment variables validated');
}

export default env;