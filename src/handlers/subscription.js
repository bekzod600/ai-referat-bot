import { getOrCreateUser, updateChannelSubscription, addCoins, getReferralCode, recordReferralUse } from '../database/index.js';
import { subscriptionConfirmedMessage } from '../utils/index.js';
import { mainMenuKeyboard } from '../keyboards/index.js';
import { generateReferralLink } from '../utils/helpers.js';
import { env, REWARDS } from '../config/index.js';

/**
 * Check subscription callback handler
 */
export async function checkSubscriptionHandler(ctx) {
  try {
    const member = await ctx.telegram.getChatMember(env.CHANNEL_ID, ctx.from.id);
    
    if (member.status === 'member' || member.status === 'administrator' || member.status === 'creator') {
      const user = await getOrCreateUser(
        ctx.from.id,
        ctx.from.username,
        ctx.from.first_name,
        ctx.from.last_name
      );
      
      if (!user.channel_subscriber) {
        // Update subscription status
        await updateChannelSubscription(user.id, true);
        
        // Add channel subscription bonus
        await addCoins(
          user.id,
          REWARDS.CHANNEL_SUBSCRIPTION,
          'bonus',
          'Kanal obunasi bonusi'
        );
        
        // Handle pending referral
        if (ctx.session.pendingReferrer) {
          await addCoins(
            ctx.session.pendingReferrer,
            REWARDS.REFERRAL,
            'referral',
            'Referral bonusi'
          );
          
          await recordReferralUse(
            ctx.session.pendingReferrer,
            user.id,
            REWARDS.REFERRAL
          );
          
          delete ctx.session.pendingReferrer;
        }
        
        await ctx.answerCbQuery('✅ Kanalga obuna bo\'ldingiz!');
      } else {
        await ctx.answerCbQuery('Siz allaqachon obunachisiz!');
      }
      
      // Get user data again (with updated balance)
      const updatedUser = await getOrCreateUser(
        ctx.from.id,
        ctx.from.username,
        ctx.from.first_name,
        ctx.from.last_name
      );
      
      const referralCode = await getReferralCode(updatedUser.id);
      const botUsername = ctx.botInfo.username;
      const referralLink = generateReferralLink(botUsername, referralCode);
      
      return ctx.reply(
        subscriptionConfirmedMessage(updatedUser.coin_balance, referralLink),
        mainMenuKeyboard()
      );
    } else {
      await ctx.answerCbQuery('❌ Siz hali kanalga obuna bo\'lmagansiz!', true);
    }
  } catch (error) {
    console.error('Subscription check error:', error);
    await ctx.answerCbQuery('❌ Xato!', true);
  }
}

export default checkSubscriptionHandler;