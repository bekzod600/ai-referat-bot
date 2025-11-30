import { verifyPaymentCode, addCoins } from '../database/index.js';
import { paymentVerifiedMessage } from '../utils/index.js';
import { adminPanelKeyboard } from '../keyboards/index.js';
import { env } from '../config/index.js';

export async function adminPanelHandler(ctx) {
  if (ctx.from.id !== env.ADMIN_ID) {
    return ctx.reply('❌ Siz admin emassiz!');
  }
  
  ctx.reply(
    '👨‍💼 Admin Panel',
    adminPanelKeyboard()
  );
}

export async function adminVerifyStartHandler(ctx) {
  if (ctx.from.id !== env.ADMIN_ID) return;
  
  ctx.session.verifyingCode = true;
  ctx.reply('📝 To\'lov kodini kiriting:');
}

export async function adminVerifyCodeHandler(ctx) {
  if (!ctx.session.verifyingCode || ctx.from.id !== env.ADMIN_ID) {
    return;
  }
  
  const code = ctx.message.text.trim().toUpperCase();
  
  try {
    const payment = await verifyPaymentCode(code);
    await addCoins(
      payment.user_id,
      payment.coins,
      'purchase',
      `To'lov tasdiqlandi - ${payment.coins} coin`
    );
    
    ctx.session.verifyingCode = false;
    
    ctx.reply(paymentVerifiedMessage(payment.coins, payment.amount_usd));
  } catch (error) {
    console.error('Admin verify error:', error);
    ctx.reply(`❌ ${error.message}`);
  }
}