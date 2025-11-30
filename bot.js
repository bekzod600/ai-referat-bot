import { Telegraf, Markup } from 'telegraf';
import { BOT_TOKEN, ADMIN_ID, CHANNEL_ID, CHANNEL_NAME, COIN_PRICES, COIN_PACKS } from './src/config.js';
import {
  getUser,
  getUserOrCreate,
  addCoins,
  removeCoins,
  generatePaymentCode,
  verifyPaymentCode,
  getReferralCode,
  updateChannelStatus,
  saveContentOrder
} from './src/db.js';

const bot = new Telegraf(BOT_TOKEN);

// Session middleware
bot.use((ctx, next) => {
  ctx.session = ctx.session || {};
  return next();
});

// Markdown escape funksiyasi
function escapeMarkdown(text) {
  return text.replace(/[_*[\]()~`>#+=|{}.!-]/g, '\\$&');
}

// /start komandasi
bot.start(async (ctx) => {
  const { id, first_name, username, last_name } = ctx.from;

  try {
    const user = await getUserOrCreate(id, username, first_name, last_name);

    if (!user.channel_subscriber) {
      return ctx.reply(
        `📢 Kanalga obuna bo'lishingiz shart!\n\n@${CHANNEL_NAME} kanalga obuna bo'ling va "✅ Obuna bo'ldim" tugmasini bosing.`,
        Markup.inlineKeyboard([
          [Markup.button.url('📢 Kanalga obuna bo\'lish', `https://t.me/${CHANNEL_NAME}`)],
          [Markup.button.callback('✅ Obuna bo\'ldim', 'check_subscription')]
        ])
      );
    }

    const referralCode = await getReferralCode(user.id);
    const botUsername = ctx.botInfo.username;
    const referralLink = `https://t.me/${botUsername}?start=ref${referralCode}`;

    await ctx.reply(
      `Salom ${first_name}! 👋\n\n` +
      `Siz AI yordamida referat, mustaqil ish va slaydlar yaratish botiga xush kelibsiz!\n\n` +
      `💰 Balans: ${user.coin_balance} coin\n\n` +
      `👇 Quyidagi tugmalardan birini tanlang:`,
      Markup.keyboard([
        ['📝 Referat', '🎯 Mustaqil ish'],
        ['🖼️ Slaydlar', '💰 Coin sotib olish'],
        ['👥 Referral', '📊 Balans']
      ]).resize()
    );

  } catch (error) {
    console.error('Start error:', error);
    ctx.reply('❌ Xato! Iltimos, keyinroq qayta urining.');
  }
});

// Kanalga obuna tekshiruvi
bot.action('check_subscription', async (ctx) => {
  try {
    const member = await ctx.telegram.getChatMember(CHANNEL_ID, ctx.from.id);

    if (member.status === 'member' || member.status === 'administrator' || member.status === 'creator') {
      const user = await getUserOrCreate(ctx.from.id, ctx.from.username, ctx.from.first_name, ctx.from.last_name);

      if (!user.channel_subscriber) {
        await updateChannelStatus(user.id, true);
        await addCoins(user.id, 200, 'bonus', 'Kanal obunas bonusu');
        await ctx.answerCbQuery('✅ Kanalga obuna bo\'ldingiz!');
      } else {
        await ctx.answerCbQuery('Siz allaqachon obunachisiz!');
      }

      const referralCode = await getReferralCode(user.id);
      const botUsername = ctx.botInfo.username;

      return ctx.reply(
        `✅ Xush kelibsiz!\n\n` +
        `💰 Balans: ${user.coin_balance} coin\n\n` +
        `👥 Referral linkingiz:\n${`https://t.me/${botUsername}?start=ref${referralCode}`}\n\n` +
        `Do'stlaringizga yuboring, har biri uchun 50 coin olasiz!\n\n` +
        `Quyidagi tugmalardan birini tanlang:`,
        Markup.keyboard([
          ['📝 Referat', '🎯 Mustaqil ish'],
          ['🖼️ Slaydlar', '💰 Coin sotib olish'],
          ['👥 Referral', '📊 Balans']
        ]).resize()
      );
    } else {
      await ctx.answerCbQuery('❌ Siz hali kanalga obuna bo\'lmagansiz!', true);
    }
  } catch (error) {
    console.error('Subscription check error:', error);
    await ctx.answerCbQuery('❌ Xato!', true);
  }
});

// Referal
bot.hears('👥 Referral', async (ctx) => {
  try {
    const user = await getUser(ctx.from.id);
    const referralCode = await getReferralCode(user.id);
    const botUsername = ctx.botInfo.username;
    const link = `https://t.me/${botUsername}?start=ref${referralCode}`;

    ctx.reply(
      `👥 Referral Tizimi\n\n` +
      `Har bir do'stingiz: 50 coin 🪙\n\n` +
      `Sizning kodingiz: ${referralCode}\n\n` +
      `Linkingiz:\n${link}`
    );
  } catch (error) {
    console.error('Referral error:', error);
    ctx.reply('❌ Xato!');
  }
});

// Balans
bot.hears('📊 Balans', async (ctx) => {
  try {
    const user = await getUser(ctx.from.id);
    ctx.reply(`💰 Sizning balans: ${user.coin_balance} coin`);
  } catch (error) {
    console.error('Balance error:', error);
    ctx.reply('❌ Xato!');
  }
});

// Coin sotib olish
bot.hears('💰 Coin sotib olish', async (ctx) => {
  const packs = Object.entries(COIN_PACKS)
    .map(([coins, usd]) => `${coins} coin = $${usd}`)
    .join('\n');

  ctx.reply(
    `💰 Coin paketlari:\n\n${packs}\n\n` +
    `Paketni kiriting (masalan: 100)`,
    Markup.keyboard([['⬅️ Orqaga']]).resize()
  );

  ctx.session.waitingForCoins = true;
});

// Coin paketi tanlash
bot.on('text', async (ctx, next) => {
  if (ctx.session.waitingForCoins) {
    const coins = parseInt(ctx.message.text);

    if (!COIN_PACKS[coins]) {
      return ctx.reply('❌ Noto\'g\'ri paket! Iltimos, 100, 500 yoki 1000 kiriting.');
    }

    try {
      const user = await getUser(ctx.from.id);
      const usd = COIN_PACKS[coins];
      const code = await generatePaymentCode(user.id, usd, coins);

      ctx.session.waitingForCoins = false;

      await ctx.reply(
        `✅ To'lov kodingiz tayyor!\n\n` +
        `Kod: ${code}\n\n` +
        `Summa: $${usd}\n` +
        `Coin: ${coins}\n` +
        `Muddati: 24 soat\n\n` +
        `Admin bilan to'lov qiling va kodni yuboringiz.`
      );

      // Adminga xabar
      await ctx.telegram.sendMessage(
        ADMIN_ID,
        `🔔 Yangi to'lov so'rovi!\n\n` +
        `👤 ${user.first_name}\n` +
        `💰 $${usd}\n` +
        `🪙 ${coins} coin\n` +
        `📝 Kod: ${code}`
      );
    } catch (error) {
      console.error('Payment error:', error);
      ctx.reply('❌ Xato!');
    }
    return;
  }
  
  return next();
});

// Referat, Mustaqil ish, Slaydlar
bot.hears(['📝 Referat', '🎯 Mustaqil ish', '🖼️ Slaydlar'], async (ctx) => {
  const text = ctx.message.text;
  let type = '';

  if (text.includes('Referat')) type = 'essay';
  else if (text.includes('Mustaqil')) type = 'presentation';
  else if (text.includes('Slaydlar')) type = 'slides';

  try {
    const user = await getUser(ctx.from.id);

    if (user.coin_balance < 130) {
      return ctx.reply(
        '❌ Coin yetmadi! Minimal 130 coin kerak.\n\n' +
        'Coin sotib olishingiz mumkin.',
        Markup.keyboard([
          ['💰 Coin sotib olish'],
          ['⬅️ Orqaga']
        ]).resize()
      );
    }

    ctx.session.contentType = type;
    ctx.session.step = 'title';
    ctx.reply('📝 Mavzu nomini kiriting:');

  } catch (error) {
    console.error('Content start error:', error);
    ctx.reply('❌ Xato!');
  }
});

// Mazmun oqimi
bot.on('text', async (ctx, next) => {
  if (!ctx.session.contentType || !ctx.session.step) {
    return next();
  }

  const steps = ['title', 'institute', 'subject', 'direction', 'pages', 'format'];
  const currentStep = ctx.session.step;

  if (!steps.includes(currentStep)) return next();

  const text = ctx.message.text.trim();

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
        Markup.keyboard([
          ['6-8 (130 coin)', '9-10 (150 coin)'],
          ['11-15 (200 coin)'],
          ['⬅️ Orqaga']
        ]).resize()
      );
      break;

    case 'pages':
      const pageRange = text.replace(/\s*\(.*\)/, '');
      const coins = COIN_PRICES[pageRange];

      if (!coins) {
        return ctx.reply('❌ Noto\'g\'ri tanlash! Iltimos, tugmalardan foydalaning.');
      }

      ctx.session.pageRange = pageRange;
      ctx.session.coins = coins;
      ctx.session.step = 'format';

      ctx.reply(
        '📄 Format tanlang:',
        Markup.keyboard([
          ['📄 PDF', '📋 DOCX'],
          ['⬅️ Orqaga']
        ]).resize()
      );
      break;

    case 'format':
      const format = text.includes('PDF') ? 'pdf' : text.includes('DOCX') ? 'docx' : null;

      if (!format) {
        return ctx.reply('❌ Noto\'g\'ri format! Iltimos, tugmalardan foydalaning.');
      }

      try {
        const user = await getUser(ctx.from.id);
        const pages = parseInt(ctx.session.pageRange.split('-')[0]);

        await removeCoins(user.id, ctx.session.coins);

        const order = await saveContentOrder(
          user.id,
          ctx.session.contentType,
          ctx.session.title,
          ctx.session.institute,
          ctx.session.subject,
          ctx.session.direction,
          pages,
          format,
          ctx.session.coins
        );

        ctx.reply(
          `✅ So'rov yuborildi!\n\n` +
          `📝 ${ctx.session.title}\n` +
          `📖 ${ctx.session.pageRange} sahifa\n` +
          `💰 ${ctx.session.coins} coin sarflandi\n\n` +
          `⏳ 2-5 minut kutib turing...`
        );

        // Reset session
        ctx.session.contentType = null;
        ctx.session.step = null;

        // TODO: AI orqali mazmun yaratish
        setTimeout(async () => {
          await ctx.reply(
            '✅ Hujjat tayyor!\n\n(AI integratsiya qo\'shilmagan)',
            Markup.keyboard([
              ['📝 Referat', '🎯 Mustaqil ish'],
              ['🖼️ Slaydlar', '💰 Coin sotib olish'],
              ['👥 Referral', '📊 Balans']
            ]).resize()
          );
        }, 2000);

      } catch (error) {
        console.error('Order error:', error);
        ctx.reply('❌ Xato: ' + error.message);
      }
      break;
  }
});

// Orqaga tugmasi
bot.hears('⬅️ Orqaga', (ctx) => {
  ctx.session.contentType = null;
  ctx.session.step = null;
  ctx.session.waitingForCoins = false;

  ctx.reply(
    'Asosiy menyu:',
    Markup.keyboard([
      ['📝 Referat', '🎯 Mustaqil ish'],
      ['🖼️ Slaydlar', '💰 Coin sotib olish'],
      ['👥 Referral', '📊 Balans']
    ]).resize()
  );
});

// Admin commands
bot.command('admin', async (ctx) => {
  if (ctx.from.id !== ADMIN_ID) {
    return ctx.reply('❌ Siz admin emassiz!');
  }

  ctx.reply(
    '👨‍💼 Admin Panel',
    Markup.keyboard([
      ['🔐 To\'lov kodini kiritish'],
      ['⬅️ Orqaga']
    ]).resize()
  );
});

bot.hears('🔐 To\'lov kodini kiritish', async (ctx) => {
  if (ctx.from.id !== ADMIN_ID) return;
  ctx.session.verifyingCode = true;
  ctx.reply('📝 To\'lov kodini kiriting:');
});

bot.on('text', async (ctx, next) => {
  if (ctx.session.verifyingCode && ctx.from.id === ADMIN_ID) {
    const code = ctx.message.text.trim().toUpperCase();

    try {
      const payment = await verifyPaymentCode(code);
      await addCoins(payment.user_id, payment.coins, 'purchase', `To'lov tasdiqlandi - ${payment.coins} coin`);

      ctx.session.verifyingCode = false;

      ctx.reply(
        `✅ To'lov tasdiqlandi!\n\n` +
        `🪙 ${payment.coins} coin qo'shildi\n` +
        `💵 $${payment.amount_usd}`
      );

    } catch (error) {
      console.error('Verify payment error:', error);
      ctx.reply(`❌ ${error.message}`);
    }
    return;
  }
  
  return next();
});

// Error handler
bot.catch((err, ctx) => {
  console.error('Bot error:', err);
  ctx.reply('❌ Xato yuz berdi!').catch(() => {});
});

// Launch
bot.launch({
  polling: {
    allowed_updates: ['message', 'callback_query']
  }
});

console.log('🤖 Bot ishga tushdi...');

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));