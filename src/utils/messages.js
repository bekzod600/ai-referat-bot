import { COIN_PACKS, COIN_PRICES } from '../config/index.js';

/**
 * Welcome message
 */
export function welcomeMessage(firstName, balance) {
  return `Salom ${firstName}! 👋\n\n` +
    `Siz AI yordamida referat, mustaqil ish va slaydlar yaratish botiga xush kelibsiz!\n\n` +
    `💰 Balans: ${balance} coin\n\n` +
    `👇 Quyidagi tugmalardan birini tanlang:`;
}

/**
 * Subscription required message
 */
export function subscriptionRequiredMessage(channelUsername) {
  return `📢 Kanalga obuna bo'lishingiz shart!\n\n` +
    `@${channelUsername} kanalga obuna bo'ling va "✅ Obuna bo'ldim" tugmasini bosing.`;
}

/**
 * Subscription confirmed message
 */
export function subscriptionConfirmedMessage(balance, referralLink) {
  return `✅ Xush kelibsiz!\n\n` +
    `💰 Balans: ${balance} coin\n\n` +
    `👥 Referral linkingiz:\n${referralLink}\n\n` +
    `Do'stlaringizga yuboring, har biri uchun 50 coin olasiz!\n\n` +
    `Quyidagi tugmalardan birini tanlang:`;
}

/**
 * Referral info message
 */
export function referralInfoMessage(referralCode, referralLink, totalReferrals = 0, totalEarned = 0) {
  return `👥 Referral Tizimi\n\n` +
    `Har bir do'stingiz: 50 coin 🪙\n\n` +
    `Sizning kodingiz: ${referralCode}\n\n` +
    `Linkingiz:\n${referralLink}\n\n` +
    `📊 Statistika:\n` +
    `Taklif qilganlar: ${totalReferrals}\n` +
    `Jami ishlab topgan: ${totalEarned} coin`;
}

/**
 * Balance message
 */
export function balanceMessage(balance) {
  return `💰 Sizning balans: ${balance} coin`;
}

/**
 * Coin purchase message
 */
export function coinPurchaseMessage() {
  const packs = Object.entries(COIN_PACKS)
    .map(([coins, usd]) => `${coins} coin = $${usd}`)
    .join('\n');
  
  return `💰 Coin paketlari:\n\n${packs}\n\n` +
    `Paketni kiriting (masalan: 100)`;
}

/**
 * Payment code generated message
 */
export function paymentCodeMessage(code, usd, coins) {
  return `✅ To'lov kodingiz tayyor!\n\n` +
    `Kod: ${code}\n\n` +
    `Summa: $${usd}\n` +
    `Coin: ${coins}\n` +
    `Muddati: 24 soat\n\n` +
    `Admin bilan to'lov qiling va kodni yuboringiz.`;
}

/**
 * Admin payment notification
 */
export function adminPaymentNotification(user, usd, coins, code) {
  return `🔔 Yangi to'lov so'rovi!\n\n` +
    `👤 ${user.first_name}\n` +
    `💰 $${usd}\n` +
    `🪙 ${coins} coin\n` +
    `📝 Kod: ${code}`;
}

/**
 * Payment verified message
 */
export function paymentVerifiedMessage(coins, amountUsd) {
  return `✅ To'lov tasdiqlandi!\n\n` +
    `🪙 ${coins} coin qo'shildi\n` +
    `💵 $${amountUsd}`;
}

/**
 * Insufficient coins message
 */
export function insufficientCoinsMessage() {
  return '❌ Coin yetmadi! Minimal 130 coin kerak.\n\n' +
    'Coin sotib olishingiz mumkin.';
}

/**
 * Order submitted message
 */
export function orderSubmittedMessage(title, pageRange, coins) {
  return `✅ So'rov yuborildi!\n\n` +
    `📝 ${title}\n` +
    `📖 ${pageRange} sahifa\n` +
    `💰 ${coins} coin sarflandi\n\n` +
    `⏳ 2-5 minut kutib turing...`;
}

/**
 * Order completed message
 */
export function orderCompletedMessage() {
  return '✅ Hujjat tayyor!\n\n(AI integratsiya qo\'shilmagan)';
}

export default {
  welcomeMessage,
  subscriptionRequiredMessage,
  subscriptionConfirmedMessage,
  referralInfoMessage,
  balanceMessage,
  coinPurchaseMessage,
  paymentCodeMessage,
  adminPaymentNotification,
  paymentVerifiedMessage,
  insufficientCoinsMessage,
  orderSubmittedMessage,
  orderCompletedMessage,
};