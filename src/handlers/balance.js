import { getUserByTelegramId } from '../database/index.js';
import { balanceMessage } from '../utils/index.js';

export async function balanceHandler(ctx) {
  try {
    const user = await getUserByTelegramId(ctx.from.id);
    ctx.reply(balanceMessage(user.coin_balance));
  } catch (error) {
    console.error('Balance handler error:', error);
    ctx.reply('❌ Xato!');
  }
}