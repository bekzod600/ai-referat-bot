import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_SERVICE } from './config.js';

export const db = createClient(SUPABASE_URL, SUPABASE_SERVICE);

export async function getUser(telegramId) {
  const { data } = await db
    .from('users')
    .select('*')
    .eq('telegram_id', telegramId)
    .maybeSingle();
  return data;
}

export async function createUser(telegramId, username, firstName, lastName) {
  const { data, error } = await db
    .from('users')
    .insert({
      telegram_id: telegramId,
      username,
      first_name: firstName,
      last_name: lastName,
      coin_balance: 0
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getUserOrCreate(telegramId, username, firstName, lastName) {
  let user = await getUser(telegramId);
  if (!user) {
    user = await createUser(telegramId, username, firstName, lastName);
  }
  return user;
}

export async function addCoins(userId, amount, type, desc) {
  const user = await db.from('users').select('coin_balance').eq('id', userId).single();
  const newBalance = user.data.coin_balance + amount;

  await db.from('users').update({ coin_balance: newBalance }).eq('id', userId);

  await db.from('coin_transactions').insert({
    user_id: userId,
    coins: amount,
    tx_type: type,
    description: desc
  });
}

export async function removeCoins(userId, amount) {
  const user = await db.from('users').select('coin_balance').eq('id', userId).single();
  if (user.data.coin_balance < amount) throw new Error('Coin yetmadi');

  const newBalance = user.data.coin_balance - amount;
  await db.from('users').update({ coin_balance: newBalance }).eq('id', userId);
}

export async function generatePaymentCode(userId, usd, coins) {
  const code = Math.random().toString(36).substring(2, 8).toUpperCase();

  const { data, error } = await db
    .from('payment_codes')
    .insert({
      code,
      user_id: userId,
      amount_usd: usd,
      coins
    })
    .select()
    .single();

  if (error) throw error;
  return code;
}

export async function verifyPaymentCode(code) {
  const { data, error } = await db
    .from('payment_codes')
    .select('*')
    .eq('code', code)
    .eq('used', false)
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error('Kod topilmadi');

  const now = new Date();
  if (new Date(data.expires_at) < now) throw new Error('Kod muddati tugagan');

  await db
    .from('payment_codes')
    .update({ used: true, used_at: new Date() })
    .eq('id', data.id);

  return data;
}

export async function getReferralCode(userId) {
  let { data } = await db
    .from('referral_codes')
    .select('code')
    .eq('user_id', userId)
    .maybeSingle();

  if (!data) {
    const code = Math.random().toString(36).substring(2, 10).toUpperCase();
    await db.from('referral_codes').insert({ user_id: userId, code });
    return code;
  }

  return data.code;
}

export async function updateChannelStatus(userId, status) {
  await db.from('users').update({ channel_subscriber: status }).eq('id', userId);
}

export async function saveContentOrder(userId, type, title, institute, subject, direction, pages, format, cost) {
  const { data, error } = await db
    .from('content_orders')
    .insert({
      user_id: userId,
      content_type: type,
      title,
      institute,
      subject,
      direction,
      pages,
      format,
      cost_coins: cost
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}
