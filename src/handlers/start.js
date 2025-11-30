import { getOrCreateUser, getReferralCode, getUserByReferralCode, addCoins, recordReferralUse } from '../database/index.js';
import { welcomeMessage, subscriptionRequiredMessage } from '../utils/index.js';
import { mainMenuKeyboard, channelSubscriptionKeyboard } from '../keyboards/index.js';
import { extractReferralCode } from '../utils/helpers.js';
import { env, REWARDS } from '../config/index.js';

/**
 * /start command handler
 */
export async function startHandler(ctx) {
  const { id, first_name, username, last_name } = ctx.from;
  const startParam = ctx.message.text.split(' ')[1];
  
  try {
    const user = await getOrCreateUser(id, username, first_name, last_name);
    
    // Handle referral
    if (startParam && !user.channel_subscriber) {
      const referralCode = extractReferralCode(startParam);
      
      if (referralCode) {
        const referrerId = await getUserByReferralCode(referralCode);
        
        if (referrerId && referrerId !== user.id) {
          ctx.session.pendingReferrer = referrerId;
        }
      }
    }
    
    // Check subscription
    if (!user.channel_subscriber) {
      return ctx.reply(
        subscriptionRequiredMessage(env.CHANNEL_USERNAME),
        channelSubscriptionKeyboard()
      );
    }
    
    // Welcome message
    await ctx.reply(
      welcomeMessage(first_name, user.coin_balance),
      mainMenuKeyboard()
    );
    
  } catch (error) {
    console.error('Start handler error:', error);
    ctx.reply('❌ Xato! Iltimos, keyinroq qayta urining.');
  }
}

export default startHandler;