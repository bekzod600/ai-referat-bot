import { mainMenuKeyboard } from '../keyboards/index.js';

export function backHandler(ctx) {
  ctx.session.contentType = null;
  ctx.session.step = null;
  ctx.session.waitingForCoins = false;
  ctx.session.verifyingCode = false;
  
  ctx.reply(
    'Asosiy menyu:',
    mainMenuKeyboard()
  );
}