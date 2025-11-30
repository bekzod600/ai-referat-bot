import dotenv from 'dotenv';

dotenv.config();

export const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
export const OPENAI_KEY = process.env.OPENAI_API_KEY;
export const SUPABASE_URL = process.env.SUPABASE_URL;
export const SUPABASE_ANON = process.env.SUPABASE_ANON_KEY;
export const SUPABASE_SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY;
export const ADMIN_ID = parseInt(process.env.ADMIN_TELEGRAM_ID);
export const CHANNEL_ID = parseInt(process.env.CHANNEL_ID);
export const CHANNEL_NAME = process.env.CHANNEL_USERNAME;

export const COIN_PRICES = {
  '6-8': 130,
  '9-10': 150,
  '11-15': 200
};

export const COIN_PACKS = {
  100: 10,
  500: 45,
  1000: 80
};

// Config tekshirish
if (!BOT_TOKEN) throw new Error('❌ TELEGRAM_BOT_TOKEN .env faylida yo\'q!');
if (!SUPABASE_URL) throw new Error('❌ SUPABASE_URL .env faylida yo\'q!');
if (!SUPABASE_ANON) throw new Error('❌ SUPABASE_ANON_KEY .env faylida yo\'q!');
if (!SUPABASE_SERVICE) throw new Error('❌ SUPABASE_SERVICE_ROLE_KEY .env faylida yo\'q!');
if (!ADMIN_ID) throw new Error('❌ ADMIN_TELEGRAM_ID .env faylida yo\'q!');

console.log('✅ Config yuklandi:');
console.log('  - Bot token:', BOT_TOKEN ? '✓' : '✗');
console.log('  - Supabase:', SUPABASE_URL ? '✓' : '✗');
console.log('  - Admin ID:', ADMIN_ID || 'yo\'q');
console.log('  - Channel:', CHANNEL_NAME || 'yo\'q');