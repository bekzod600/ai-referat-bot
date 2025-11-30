# 🔄 Yangi strukturaga ko'chish qo'llanmasi

## 1. Eski fayllarni backup qiling

```bash
mkdir backup
cp bot.js backup/
cp src/config.js backup/
cp src/db.js backup/
```

## 2. Eski fayllarni o'chiring

```bash
rm bot.js
rm src/config.js
rm src/db.js
rm index.js
```

## 3. Yangi strukturani yarating

### A) Config papkasi

**src/config/env.js** - Environment variables
**src/config/constants.js** - Constants (prices, rewards)
**src/config/index.js** - Export all

### B) Database papkasi

**src/database/client.js** - Supabase client
**src/database/users.js** - User operations
**src/database/coins.js** - Coin operations
**src/database/payments.js** - Payment codes
**src/database/referrals.js** - Referral system
**src/database/orders.js** - Content orders
**src/database/index.js** - Export all

### C) Handlers papkasi

**src/handlers/start.js** - /start command
**src/handlers/subscription.js** - Channel subscription
**src/handlers/balance.js** - Balance handler
**src/handlers/referral.js** - Referral handler
**src/handlers/purchase.js** - Coin purchase
**src/handlers/content.js** - Content creation
**src/handlers/admin.js** - Admin commands
**src/handlers/back.js** - Back button
**src/handlers/index.js** - Export all

### D) Keyboards papkasi

**src/keyboards/main.js** - Main menu keyboards
**src/keyboards/inline.js** - Inline keyboards
**src/keyboards/admin.js** - Admin keyboards
**src/keyboards/index.js** - Export all

### E) Utils papkasi

**src/utils/messages.js** - Message templates
**src/utils/helpers.js** - Helper functions
**src/utils/index.js** - Export all

### F) Middlewares papkasi

**src/middlewares/session.js** - Session middleware
**src/middlewares/error.js** - Error handler
**src/middlewares/index.js** - Export all

### G) Main fayl

**src/index.js** - Bot entry point

## 4. package.json ni yangilang

```json
{
  "main": "src/index.js",
  "scripts": {
    "start": "node src/index.js",
    "dev": "node --watch src/index.js",
    "test": "node tests/test-bot.js"
  }
}
```

## 5. Testni tekshiring

```bash
npm test
```

## 6. Botni ishga tushiring

```bash
npm start
```

## 🔍 Farqlar

### Eski struktura:
```
bot.js (1000+ qator)
src/config.js
src/db.js
```

### Yangi struktura:
```
src/
├── index.js (100 qator)
├── config/ (3 fayl)
├── database/ (6 fayl)
├── handlers/ (8 fayl)
├── keyboards/ (3 fayl)
├── utils/ (2 fayl)
└── middlewares/ (2 fayl)
```

## ✅ Afzalliklar

1. **Modulli** - Har bir fayl bitta vazifani bajaradi
2. **Oson test** - Har bir qismni alohida test qilish mumkin
3. **Oson o'qish** - Kodni tushunish oson
4. **Oson o'zgartirish** - Bir joyni o'zgartirsangiz, boshqa joyga ta'sir qilmaydi
5. **Scale qilish oson** - Yangi funksiya qo'shish oson
6. **Team work** - Bir necha odam bir vaqtda ishlashi mumkin

## 🆘 Muammolar

### Import error
```bash
Error: Cannot find module './config/index.js'
```

**Yechim:** Barcha papkalar va fayllar to'g'ri yaratilganini tekshiring.

### Database error
```bash
Error: Could not find the table 'public.users'
```

**Yechim:** Supabase da schema.sql ni ishga tushiring.

### Bot ishlamayapti

1. `.env` faylini tekshiring
2. `npm test` ishga tushiring
3. Consoledagi xatolarni o'qing

## 📝 Yangi funksiya qo'shish

### Misol: Admin statistika

1. **Database funksiya** (`src/database/stats.js`):
```javascript
export async function getAdminStats() {
  // Database query
}
```

2. **Handler** (`src/handlers/admin.js`):
```javascript
export async function statsHandler(ctx) {
  const stats = await getAdminStats();
  ctx.reply(`Statistika: ${stats}`);
}
```

3. **Register** (`src/index.js`):
```javascript
bot.hears('📊 Statistika', statsHandler);
```

Shunchaki! 🎉