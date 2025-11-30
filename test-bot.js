import { Telegraf } from 'telegraf';
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
  saveContentOrder,
  db
} from './src/db.js';

// Terminal ranglari
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function success(message) {
  log(`✅ ${message}`, 'green');
}

function error(message) {
  log(`❌ ${message}`, 'red');
}

function info(message) {
  log(`ℹ️  ${message}`, 'blue');
}

function section(message) {
  log(`\n${'='.repeat(60)}`, 'cyan');
  log(`  ${message}`, 'cyan');
  log(`${'='.repeat(60)}`, 'cyan');
}

// Test natijalarini saqlash
const testResults = {
  passed: 0,
  failed: 0,
  tests: []
};

function recordTest(name, passed, errorMsg = null) {
  testResults.tests.push({ name, passed, error: errorMsg });
  if (passed) {
    testResults.passed++;
    success(name);
  } else {
    testResults.failed++;
    error(`${name}: ${errorMsg}`);
  }
}

// Kutish funksiyasi
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// ============================================
// 1. CONFIG TESTLARI
// ============================================
async function testConfig() {
  section('1. CONFIG TESTLARI');
  
  try {
    recordTest('BOT_TOKEN mavjud', !!BOT_TOKEN);
    recordTest('BOT_TOKEN formati to\'g\'ri', BOT_TOKEN?.includes(':'));
    recordTest('ADMIN_ID mavjud', !!ADMIN_ID && !isNaN(ADMIN_ID));
    recordTest('CHANNEL_ID mavjud', !!CHANNEL_ID && !isNaN(CHANNEL_ID));
    recordTest('CHANNEL_NAME mavjud', !!CHANNEL_NAME);
    recordTest('COIN_PRICES to\'g\'ri', Object.keys(COIN_PRICES).length === 3);
    recordTest('COIN_PACKS to\'g\'ri', Object.keys(COIN_PACKS).length === 3);
  } catch (err) {
    recordTest('Config yuklash', false, err.message);
  }
}

// ============================================
// 2. DATABASE CONNECTION TESTLARI
// ============================================
async function testDatabase() {
  section('2. DATABASE CONNECTION TESTLARI');
  
  try {
    // Connection test
    const { data, error } = await db.from('users').select('count', { count: 'exact', head: true });
    recordTest('Supabase ulanishi', !error, error?.message);
    
    // Jadvallarni tekshirish
    const tables = ['users', 'coin_transactions', 'payment_codes', 'referral_codes', 'referral_uses', 'content_orders'];
    
    for (const table of tables) {
      const { error: tableError } = await db.from(table).select('*').limit(1);
      recordTest(`Jadval mavjud: ${table}`, !tableError, tableError?.message);
    }
    
  } catch (err) {
    recordTest('Database connection', false, err.message);
  }
}

// ============================================
// 3. USER CRUD TESTLARI
// ============================================
async function testUserCRUD() {
  section('3. USER CRUD TESTLARI');
  
  const testTelegramId = Math.floor(Math.random() * 1000000000);
  let testUserId;
  
  try {
    // CREATE
    const newUser = await getUserOrCreate(testTelegramId, 'testuser', 'Test', 'User');
    testUserId = newUser.id;
    recordTest('User yaratish', !!newUser.id);
    recordTest('User telegram_id to\'g\'ri', newUser.telegram_id === testTelegramId);
    recordTest('User coin_balance default 0', newUser.coin_balance === 0);
    recordTest('User channel_subscriber default false', newUser.channel_subscriber === false);
    
    // READ
    const fetchedUser = await getUser(testTelegramId);
    recordTest('User o\'qish', !!fetchedUser);
    recordTest('User ma\'lumotlari to\'g\'ri', fetchedUser.id === testUserId);
    
    // UPDATE - Channel status
    await updateChannelStatus(testUserId, true);
    const updatedUser = await getUser(testTelegramId);
    recordTest('Channel status yangilash', updatedUser.channel_subscriber === true);
    
    // Coin operations
    await addCoins(testUserId, 100, 'bonus', 'Test bonus');
    const userWithCoins = await getUser(testTelegramId);
    recordTest('Coin qo\'shish', userWithCoins.coin_balance === 100);
    
    await removeCoins(testUserId, 50);
    const userAfterSpend = await getUser(testTelegramId);
    recordTest('Coin yechish', userAfterSpend.coin_balance === 50);
    
    // Coin yetmasligi testi
    try {
      await removeCoins(testUserId, 1000);
      recordTest('Coin yetmaslik xatosi', false, 'Xato chiqmadi');
    } catch (err) {
      recordTest('Coin yetmaslik xatosi', err.message.includes('yetmadi'));
    }
    
    // DELETE (cleanup)
    await db.from('users').delete().eq('id', testUserId);
    const deletedUser = await getUser(testTelegramId);
    recordTest('User o\'chirish', !deletedUser);
    
  } catch (err) {
    recordTest('User CRUD', false, err.message);
  }
}

// ============================================
// 4. COIN TRANSACTIONS TESTLARI
// ============================================
async function testCoinTransactions() {
  section('4. COIN TRANSACTIONS TESTLARI');
  
  const testTelegramId = Math.floor(Math.random() * 1000000000);
  
  try {
    const user = await getUserOrCreate(testTelegramId, 'cointest', 'Coin', 'Test');
    
    // Turli xil tranzaksiyalar
    await addCoins(user.id, 100, 'purchase', 'Test sotib olish');
    await addCoins(user.id, 50, 'bonus', 'Test bonus');
    await addCoins(user.id, 25, 'referral', 'Test referral');
    
    // Tranzaksiyalarni tekshirish
    const { data: transactions } = await db
      .from('coin_transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    recordTest('Tranzaksiyalar yaratildi', transactions.length === 3);
    recordTest('Purchase tranzaksiya', transactions.some(t => t.tx_type === 'purchase'));
    recordTest('Bonus tranzaksiya', transactions.some(t => t.tx_type === 'bonus'));
    recordTest('Referral tranzaksiya', transactions.some(t => t.tx_type === 'referral'));
    recordTest('Jami balans to\'g\'ri', user.coin_balance + 175 === (await getUser(testTelegramId)).coin_balance);
    
    // Cleanup
    await db.from('users').delete().eq('id', user.id);
    
  } catch (err) {
    recordTest('Coin transactions', false, err.message);
  }
}

// ============================================
// 5. PAYMENT CODE TESTLARI
// ============================================
async function testPaymentCodes() {
  section('5. PAYMENT CODE TESTLARI');
  
  const testTelegramId = Math.floor(Math.random() * 1000000000);
  
  try {
    const user = await getUserOrCreate(testTelegramId, 'paytest', 'Pay', 'Test');
    
    // Kod yaratish
    const code = await generatePaymentCode(user.id, 10, 100);
    recordTest('To\'lov kodi yaratildi', !!code);
    recordTest('Kod 6 ta belgi', code.length === 6);
    recordTest('Kod uppercase', code === code.toUpperCase());
    
    // Kodni tekshirish
    const { data: paymentData } = await db
      .from('payment_codes')
      .select('*')
      .eq('code', code)
      .single();
    
    recordTest('Kod bazada mavjud', !!paymentData);
    recordTest('Kod user_id to\'g\'ri', paymentData.user_id === user.id);
    recordTest('Kod amount_usd to\'g\'ri', paymentData.amount_usd === 10);
    recordTest('Kod coins to\'g\'ri', paymentData.coins === 100);
    recordTest('Kod used false', paymentData.used === false);
    recordTest('Kod expires_at kelgusida', new Date(paymentData.expires_at) > new Date());
    
    // Kodni tasdiqlash
    const verifiedPayment = await verifyPaymentCode(code);
    recordTest('Kod tasdiqlandi', !!verifiedPayment);
    
    // Kodni qayta ishlatishga urinish
    try {
      await verifyPaymentCode(code);
      recordTest('Ishlatilgan kod xatosi', false, 'Xato chiqmadi');
    } catch (err) {
      recordTest('Ishlatilgan kod xatosi', err.message.includes('topilmadi'));
    }
    
    // Noto'g'ri kod
    try {
      await verifyPaymentCode('INVALID');
      recordTest('Noto\'g\'ri kod xatosi', false, 'Xato chiqmadi');
    } catch (err) {
      recordTest('Noto\'g\'ri kod xatosi', err.message.includes('topilmadi'));
    }
    
    // Cleanup
    await db.from('users').delete().eq('id', user.id);
    
  } catch (err) {
    recordTest('Payment codes', false, err.message);
  }
}

// ============================================
// 6. REFERRAL SYSTEM TESTLARI
// ============================================
async function testReferralSystem() {
  section('6. REFERRAL SYSTEM TESTLARI');
  
  const referrerId = Math.floor(Math.random() * 1000000000);
  const referredId = Math.floor(Math.random() * 1000000000);
  
  try {
    // Referrer yaratish
    const referrer = await getUserOrCreate(referrerId, 'referrer', 'Referrer', 'User');
    const referralCode = await getReferralCode(referrer.id);
    
    recordTest('Referral kod yaratildi', !!referralCode);
    recordTest('Referral kod 8+ belgi', referralCode.length >= 8);
    recordTest('Referral kod uppercase', referralCode === referralCode.toUpperCase());
    
    // Referral kodni qayta olish
    const sameCode = await getReferralCode(referrer.id);
    recordTest('Bir xil referral kod qaytadi', sameCode === referralCode);
    
    // Bazadan tekshirish
    const { data: refCodeData } = await db
      .from('referral_codes')
      .select('*')
      .eq('user_id', referrer.id)
      .single();
    
    recordTest('Referral kod bazada', !!refCodeData);
    recordTest('Referral kod to\'g\'ri', refCodeData.code === referralCode);
    recordTest('Total referrals 0', refCodeData.total_referrals === 0);
    
    // Cleanup
    await db.from('users').delete().eq('id', referrer.id);
    
  } catch (err) {
    recordTest('Referral system', false, err.message);
  }
}

// ============================================
// 7. CONTENT ORDERS TESTLARI
// ============================================
async function testContentOrders() {
  section('7. CONTENT ORDERS TESTLARI');
  
  const testTelegramId = Math.floor(Math.random() * 1000000000);
  
  try {
    const user = await getUserOrCreate(testTelegramId, 'ordertest', 'Order', 'Test');
    await addCoins(user.id, 500, 'bonus', 'Test uchun');
    
    // Essay buyurtma
    const essay = await saveContentOrder(
      user.id,
      'essay',
      'Test Referat',
      'Test Institut',
      'Test Fan',
      'Test Yo\'nalish',
      8,
      'pdf',
      130
    );
    
    recordTest('Essay buyurtma yaratildi', !!essay.id);
    recordTest('Essay content_type to\'g\'ri', essay.content_type === 'essay');
    recordTest('Essay pages to\'g\'ri', essay.pages === 8);
    recordTest('Essay format to\'g\'ri', essay.format === 'pdf');
    recordTest('Essay cost to\'g\'ri', essay.cost_coins === 130);
    recordTest('Essay status pending', essay.status === 'pending');
    
    // Presentation buyurtma
    const presentation = await saveContentOrder(
      user.id,
      'presentation',
      'Test Mustaqil Ish',
      'Test Institut',
      'Test Fan',
      'Test Yo\'nalish',
      10,
      'docx',
      150
    );
    
    recordTest('Presentation buyurtma yaratildi', !!presentation.id);
    recordTest('Presentation content_type to\'g\'ri', presentation.content_type === 'presentation');
    
    // Slides buyurtma
    const slides = await saveContentOrder(
      user.id,
      'slides',
      'Test Slaydlar',
      'Test Institut',
      'Test Fan',
      'Test Yo\'nalish',
      15,
      'pptx',
      200
    );
    
    recordTest('Slides buyurtma yaratildi', !!slides.id);
    recordTest('Slides format to\'g\'ri', slides.format === 'pptx');
    
    // Foydalanuvchi buyurtmalarini tekshirish
    const { data: userOrders } = await db
      .from('content_orders')
      .select('*')
      .eq('user_id', user.id);
    
    recordTest('Barcha buyurtmalar saqlandi', userOrders.length === 3);
    
    // Cleanup
    await db.from('users').delete().eq('id', user.id);
    
  } catch (err) {
    recordTest('Content orders', false, err.message);
  }
}

// ============================================
// 8. TELEGRAM BOT API TESTLARI
// ============================================
async function testTelegramAPI() {
  section('8. TELEGRAM BOT API TESTLARI');
  
  let bot;
  try {
    bot = new Telegraf(BOT_TOKEN);
    
    // Bot ma'lumotlarini olish (bot.telegram to'g'ridan-to'g'ri API ga murojaat qiladi)
    const botInfo = await bot.telegram.getMe();
    recordTest('Bot API ulanishi', !!botInfo);
    recordTest('Bot username mavjud', !!botInfo.username);
    recordTest('Bot is_bot true', botInfo.is_bot === true);
    
    info(`Bot: @${botInfo.username}`);
    info(`Bot ID: ${botInfo.id}`);
    info(`Bot Name: ${botInfo.first_name}`);
    
    // Webhook statusini tekshirish
    try {
      const webhookInfo = await bot.telegram.getWebhookInfo();
      recordTest('Webhook info olish', true);
      if (webhookInfo.url) {
        info(`Webhook: ${webhookInfo.url}`);
      } else {
        info('Webhook: O\'rnatilmagan (polling rejimi)');
      }
    } catch (webhookErr) {
      recordTest('Webhook info olish', false, webhookErr.message);
    }
    
    // Admin bilan test xabar (agar kerak bo'lsa)
    // Uncomment qilsangiz admin ga test xabar yuboradi
    /*
    try {
      await bot.telegram.sendMessage(ADMIN_ID, '🧪 Test xabari - Bot test o\'tkazilmoqda...');
      recordTest('Admin ga xabar yuborish', true);
    } catch (msgErr) {
      recordTest('Admin ga xabar yuborish', false, msgErr.message);
    }
    */
    
  } catch (err) {
    recordTest('Telegram API', false, err.message);
  } finally {
    // Bot instance ni tozalash (agar mavjud bo'lsa)
    if (bot) {
      try {
        await bot.stop();
      } catch (stopErr) {
        // Bot ishga tushmagan bo'lsa, stop xatosini e'tiborsiz qoldiramiz
      }
    }
  }
}

// ============================================
// 9. COIN PRICES & PACKS TESTLARI
// ============================================
async function testCoinPricesAndPacks() {
  section('9. COIN PRICES & PACKS TESTLARI');
  
  try {
    // COIN_PRICES tekshiruvi
    recordTest('6-8 sahifa narxi 130', COIN_PRICES['6-8'] === 130);
    recordTest('9-10 sahifa narxi 150', COIN_PRICES['9-10'] === 150);
    recordTest('11-15 sahifa narxi 200', COIN_PRICES['11-15'] === 200);
    
    // COIN_PACKS tekshiruvi
    recordTest('100 coin = $10', COIN_PACKS[100] === 10);
    recordTest('500 coin = $45', COIN_PACKS[500] === 45);
    recordTest('1000 coin = $80', COIN_PACKS[1000] === 80);
    
    // Narx mantiqini tekshirish
    const price68 = COIN_PRICES['6-8'];
    const price910 = COIN_PRICES['9-10'];
    const price1115 = COIN_PRICES['11-15'];
    
    recordTest('Narxlar ortib boradi', price68 < price910 && price910 < price1115);
    
    // Coin paketlar mantiqini tekshirish
    const pack100 = COIN_PACKS[100];
    const pack500 = COIN_PACKS[500];
    const pack1000 = COIN_PACKS[1000];
    
    recordTest('Katta paket tejamli (500)', (pack500 / 500) < (pack100 / 100));
    recordTest('Katta paket tejamli (1000)', (pack1000 / 1000) < (pack500 / 500));
    
  } catch (err) {
    recordTest('Coin prices & packs', false, err.message);
  }
}

// ============================================
// 10. DATA INTEGRITY TESTLARI
// ============================================
async function testDataIntegrity() {
  section('10. DATA INTEGRITY TESTLARI');
  
  const testTelegramId = Math.floor(Math.random() * 1000000000);
  
  try {
    const user = await getUserOrCreate(testTelegramId, 'integritytest', 'Integrity', 'Test');
    
    // Foreign key constraint - user o'chirilganda tranzaksiyalar ham o'chishi kerak
    await addCoins(user.id, 100, 'bonus', 'Test');
    await generatePaymentCode(user.id, 10, 100);
    await getReferralCode(user.id);
    
    const { data: txBefore } = await db.from('coin_transactions').select('*').eq('user_id', user.id);
    const { data: payBefore } = await db.from('payment_codes').select('*').eq('user_id', user.id);
    const { data: refBefore } = await db.from('referral_codes').select('*').eq('user_id', user.id);
    
    recordTest('Bog\'liq ma\'lumotlar mavjud', txBefore.length > 0 && payBefore.length > 0 && refBefore.length > 0);
    
    // User o'chirish
    await db.from('users').delete().eq('id', user.id);
    
    // Bog'liq ma'lumotlar ham o'chirilganini tekshirish
    const { data: txAfter } = await db.from('coin_transactions').select('*').eq('user_id', user.id);
    const { data: payAfter } = await db.from('payment_codes').select('*').eq('user_id', user.id);
    const { data: refAfter } = await db.from('referral_codes').select('*').eq('user_id', user.id);
    
    recordTest('CASCADE delete ishlaydi (transactions)', txAfter.length === 0);
    recordTest('CASCADE delete ishlaydi (payment_codes)', payAfter.length === 0);
    recordTest('CASCADE delete ishlaydi (referral_codes)', refAfter.length === 0);
    
  } catch (err) {
    recordTest('Data integrity', false, err.message);
  }
}

// ============================================
// BARCHA TESTLARNI ISHGA TUSHIRISH
// ============================================
async function runAllTests() {
  log('\n🧪 BOT TEST BOSHLANDI\n', 'magenta');
  log(`Test vaqti: ${new Date().toLocaleString('uz-UZ')}\n`, 'yellow');
  
  const startTime = Date.now();
  
  try {
    await testConfig();
    await testDatabase();
    await testUserCRUD();
    await testCoinTransactions();
    await testPaymentCodes();
    await testReferralSystem();
    await testContentOrders();
    await testTelegramAPI();
    await testCoinPricesAndPacks();
    await testDataIntegrity();
    
  } catch (err) {
    error(`CRITICAL ERROR: ${err.message}`);
  }
  
  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);
  
  // NATIJALAR
  section('TEST NATIJALARI');
  
  log(`\n✅ O'tdi: ${testResults.passed}`, 'green');
  log(`❌ Xato: ${testResults.failed}`, 'red');
  log(`📊 Jami: ${testResults.passed + testResults.failed}`, 'cyan');
  log(`⏱️  Vaqt: ${duration}s`, 'yellow');
  
  const successRate = ((testResults.passed / (testResults.passed + testResults.failed)) * 100).toFixed(1);
  log(`\n🎯 Muvaffaqiyat: ${successRate}%\n`, successRate > 90 ? 'green' : 'yellow');
  
  // Xatolar ro'yxati
  if (testResults.failed > 0) {
    section('XATO BO\'LGAN TESTLAR');
    testResults.tests
      .filter(t => !t.passed)
      .forEach(t => {
        error(`${t.name}: ${t.error}`);
      });
  }
  
  // Yakuniy holat
  if (testResults.failed === 0) {
    log('\n🎉 BARCHA TESTLAR MUVAFFAQIYATLI O\'TDI!\n', 'green');
    process.exit(0);
  } else {
    log('\n⚠️  BA\'ZI TESTLAR MUVAFFAQIYATSIZ TUGADI!\n', 'red');
    process.exit(1);
  }
}

// Testni ishga tushirish
runAllTests().catch(err => {
  error(`Fatal error: ${err.message}`);
  console.error(err);
  process.exit(1);
});