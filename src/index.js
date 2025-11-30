import { Telegraf } from 'telegraf';
import { env, validateEnv } from './config/index.js';
import { testConnection } from './database/index.js';
import { sessionMiddleware, errorHandler } from './middlewares/index.js';
import {
  startHandler,
  checkSubscriptionHandler,
  balanceHandler,
  referralHandler,
  purchaseStartHandler,
  purchasePackageHandler,
  essayHandler,
  presentationHandler,
  slidesHandler,
  contentFlowHandler,
  adminPanelHandler,
  adminVerifyStartHandler,
  adminVerifyCodeHandler,
  backHandler,
} from './handlers/index.js';

/**
 * Initialize bot
 */
async function initBot() {
  console.log('🤖 Bot ishga tushmoqda...\n');
  
  // Validate environment
  validateEnv();
  
  // Test database connection
  await testConnection();
  
  console.log('');
  
  // Create bot instance
  const bot = new Telegraf(env.BOT_TOKEN);
  
  // Apply middlewares
  bot.use(sessionMiddleware());
  
  // Register handlers
  registerHandlers(bot);
  
  // Error handler
  bot.catch(errorHandler());
  
  // Launch bot
  await bot.launch({
    polling: {
      allowed_updates: ['message', 'callback_query']
    }
  });
  
  console.log('✅ Bot ishga tushdi!\n');
  
  // Graceful stop
  process.once('SIGINT', () => bot.stop('SIGINT'));
  process.once('SIGTERM', () => bot.stop('SIGTERM'));
  
  return bot;
}

/**
 * Register all bot handlers
 */
function registerHandlers(bot) {
  // Commands
  bot.command('start', startHandler);
  bot.command('admin', adminPanelHandler);
  
  // Callback queries
  bot.action('check_subscription', checkSubscriptionHandler);
  
  // Main menu buttons
  bot.hears('📊 Balans', balanceHandler);
  bot.hears('👥 Referral', referralHandler);
  bot.hears('💰 Coin sotib olish', purchaseStartHandler);
  bot.hears('📝 Referat', essayHandler);
  bot.hears('🎯 Mustaqil ish', presentationHandler);
  bot.hears('🖼️ Slaydlar', slidesHandler);
  bot.hears('⬅️ Orqaga', backHandler);
  
  // Admin buttons
  bot.hears('🔐 To\'lov kodini kiritish', adminVerifyStartHandler);
  
  // Text handlers (order specific)
  bot.on('text', async (ctx, next) => {
    // Admin code verification
    if (ctx.session.verifyingCode && ctx.from.id === env.ADMIN_ID) {
      return adminVerifyCodeHandler(ctx);
    }
    
    // Coin purchase flow
    if (ctx.session.waitingForCoins) {
      return purchasePackageHandler(ctx);
    }
    
    // Content creation flow
    if (ctx.session.contentType && ctx.session.step) {
      return contentFlowHandler(ctx);
    }
    
    // If no handler matched, pass to next
    return next();
  });
}

// Start bot
initBot().catch(error => {
  console.error('❌ Bot ishga tushmadi:', error);
  process.exit(1);
});