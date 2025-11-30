import { getUserByTelegramId, getReferralCode, getUserReferralStats } from '../database/index.js';
import { referralInfoMessage } from '../utils/index.js';
import { generateReferralLink } from '../utils/helpers.js';

export async function referralHandler(ctx) {
  try {
    const user = await getUserByTelegramId(ctx.from.id);
    const referralCode = await getReferralCode(user.id);
    const botUsername = ctx.botInfo.username;
    const link = generateReferralLink(botUsername, referralCode);
    const stats = await getUserReferralStats(user.id);
    
    ctx.reply(
      referralInfoMessage(referralCode, link, stats.totalReferrals, stats.totalEarned)
    );
  } catch (error) {
    console.error('Referral handler error:', error);
    ctx.reply('❌ Xato!');
  }
}