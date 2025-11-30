import { getUserByTelegramId, createPaymentCode } from '../database/index.js';
import { coinPurchaseMessage, paymentCodeMessage, adminPaymentNotification } from '../utils/index.js';
import { backKeyboard } from '../keyboards/index.js';
import { env, COIN_PACKS } from '../config/index.js';

/**
 * Coin purchase start handler
 */
export async function purchaseStartHandler(ctx) {
  ctx.reply(
    coinPurchaseMessage(),
    backKeyboard()
  );
  
  ctx.session.waitingForCoins = true;
}

/**
 * Handle coin package selection
 */
export async function purchasePackageHandler(ctx) {
  if (!ctx.session.waitingForCoins) return;
  
  const coins = parseInt(ctx.message.text);
  
  if (!COIN_PACKS[coins]) {
    return ctx.reply('❌ Noto\'g\'ri paket! Iltimos, 100, 500 yoki 1000 kiriting.');
  }
  
  try {
    const user = await getUserByTelegramId(ctx.from.id);
    const usd = COIN_PACKS[coins];
    const code = await createPaymentCode(user.id, usd, coins);
    
    ctx.session.waitingForCoins = false;
    
    await ctx.reply(paymentCodeMessage(code, usd, coins));
    
    // Notify admin
    await ctx.telegram.sendMessage(
      env.ADMIN_ID,
      adminPaymentNotification(user, usd, coins, code)
    );
  } catch (error) {
    console.error('Purchase handler error:', error);
    ctx.reply('❌ Xato!');
  }
}

export default {
  purchaseStartHandler,
  purchasePackageHandler,
};