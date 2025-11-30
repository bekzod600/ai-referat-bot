import { getUserByTelegramId, removeCoins, createOrder } from '../database/index.js';
import { insufficientCoinsMessage, orderSubmittedMessage, orderCompletedMessage } from '../utils/index.js';
import { purchaseKeyboard, pageSelectionKeyboard, formatSelectionKeyboard, mainMenuKeyboard } from '../keyboards/index.js';
import { parsePageRange, parseFormat, sleep } from '../utils/helpers.js';
import { COIN_PRICES, CONTENT_TYPES } from '../config/index.js';

/**
 * Start content creation flow
 */
export async function contentStartHandler(ctx, contentType) {
  try {
    const user = await getUserByTelegramId(ctx.from.id);
    
    if (user.coin_balance < 130) {
      return ctx.reply(
        insufficientCoinsMessage(),
        purchaseKeyboard()
      );
    }
    
    ctx.session.contentType = contentType;
    ctx.session.step = 'title';
    ctx.reply('📝 Mavzu nomini kiriting:');
    
  } catch (error) {
    console.error('Content start error:', error);
    ctx.reply('❌ Xato!');
  }
}

/**
 * Handle content creation steps
 */
export async function contentFlowHandler(ctx) {
  if (!ctx.session.contentType || !ctx.session.step) {
    return;
  }
  
  const steps = ['title', 'institute', 'subject', 'direction', 'pages', 'format'];
  const currentStep = ctx.session.step;
  
  if (!steps.includes(currentStep)) return;
  
  const text = ctx.message.text.trim();
  
  try {
    switch (currentStep) {
      case 'title':
        ctx.session.title = text;
        ctx.session.step = 'institute';
        ctx.reply('🏛️ Institut nomini kiriting:');
        break;
      
      case 'institute':
        ctx.session.institute = text;
        ctx.session.step = 'subject';
        ctx.reply('📚 Fan nomini kiriting:');
        break;
      
      case 'subject':
        ctx.session.subject = text;
        ctx.session.step = 'direction';
        ctx.reply('🎓 Yo\'nalish nomini kiriting:');
        break;
      
      case 'direction':
        ctx.session.direction = text;
        ctx.session.step = 'pages';
        ctx.reply(
          '📖 Sahifa sonini tanlang:',
          pageSelectionKeyboard()
        );
        break;
      
      case 'pages':
        const pageRange = parsePageRange(text);
        const coins = COIN_PRICES[pageRange];
        
        if (!coins) {
          return ctx.reply('❌ Noto\'g\'ri tanlash! Iltimos, tugmalardan foydalaning.');
        }
        
        ctx.session.pageRange = pageRange;
        ctx.session.coins = coins;
        ctx.session.step = 'format';
        
        ctx.reply(
          '📄 Format tanlang:',
          formatSelectionKeyboard()
        );
        break;
      
      case 'format':
        const format = parseFormat(text);
        
        if (!format) {
          return ctx.reply('❌ Noto\'g\'ri format! Iltimos, tugmalardan foydalaning.');
        }
        
        await finalizeOrder(ctx, format);
        break;
    }
  } catch (error) {
    console.error('Content flow error:', error);
    ctx.reply('❌ Xato: ' + error.message);
  }
}

/**
 * Finalize and create order
 */
async function finalizeOrder(ctx, format) {
  const user = await getUserByTelegramId(ctx.from.id);
  const pages = parseInt(ctx.session.pageRange.split('-')[0]);
  
  // Deduct coins
  await removeCoins(user.id, ctx.session.coins, `Buyurtma: ${ctx.session.title}`);
  
  // Create order
  await createOrder({
    userId: user.id,
    contentType: ctx.session.contentType,
    title: ctx.session.title,
    institute: ctx.session.institute,
    subject: ctx.session.subject,
    direction: ctx.session.direction,
    pages,
    format,
    costCoins: ctx.session.coins,
  });
  
  await ctx.reply(
    orderSubmittedMessage(ctx.session.title, ctx.session.pageRange, ctx.session.coins)
  );
  
  // Reset session
  const contentType = ctx.session.contentType;
  ctx.session.contentType = null;
  ctx.session.step = null;
  
  // TODO: AI integration - process order here
  await sleep(2000);
  
  await ctx.reply(
    orderCompletedMessage(),
    mainMenuKeyboard()
  );
}

/**
 * Essay handler
 */
export function essayHandler(ctx) {
  return contentStartHandler(ctx, CONTENT_TYPES.ESSAY);
}

/**
 * Presentation handler
 */
export function presentationHandler(ctx) {
  return contentStartHandler(ctx, CONTENT_TYPES.PRESENTATION);
}

/**
 * Slides handler
 */
export function slidesHandler(ctx) {
  return contentStartHandler(ctx, CONTENT_TYPES.SLIDES);
}

export default {
  contentStartHandler,
  contentFlowHandler,
  essayHandler,
  presentationHandler,
  slidesHandler,
};