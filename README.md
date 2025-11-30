# 🤖 AI Referat Bot

AI yordamida referat, mustaqil ish va slaydlar yaratuvchi professional Telegram bot.

## 📋 Xususiyatlar

- ✅ Kanal obuna tizimi
- 💰 Coin sotib olish va to'lov tizimi
- 👥 Referral tizimi
- 📝 Referat yaratish
- 🎯 Mustaqil ish yaratish
- 🖼️ Slaydlar yaratish
- 👨‍💼 Admin panel
- 📊 Statistika va hisobotlar

## 🏗️ Loyiha tuzilmasi

```
ai-referat-bot/
├── src/
│   ├── index.js              # Bot entry point
│   ├── config/               # Configuration
│   ├── database/             # Database operations
│   ├── handlers/             # Bot handlers
│   ├── middlewares/          # Middlewares
│   ├── keyboards/            # Telegram keyboards
│   ├── utils/                # Utilities
│   └── services/             # External services
└── tests/                    # Tests
```

## 🚀 Sozlash

### 1. Environment o'rnatish

`.env` fayl yarating:

```env
# Telegram
TELEGRAM_BOT_TOKEN=your_bot_token
ADMIN_TELEGRAM_ID=your_admin_id
CHANNEL_ID=-1001234567890
CHANNEL_USERNAME=your_channel

# Supabase
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key

# OpenAI (opsional)
OPENAI_API_KEY=your_openai_key
```

### 2. Dependencies o'rnatish

```bash
npm install
```

### 3. Database sozlash

Supabase SQL Editor da `schema.sql` faylini ishga tushiring.

### 4. Botni ishga tushirish

```bash
# Production
npm start

# Development (auto-reload)
npm run dev

# Test
npm test
```

## 📚 API Dokumentatsiya

### Config

```javascript
import { env, COIN_PRICES, REWARDS } from './config/index.js';
```

### Database

```javascript
import { 
  getOrCreateUser,
  addCoins,
  createPaymentCode,
  getReferralCode 
} from './database/index.js';
```

### Handlers

```javascript
import { 
  startHandler,
  balanceHandler,
  contentFlowHandler 
} from './handlers/index.js';
```

## 🧪 Testing

To'liq test:

```bash
npm test
```

Test qamrovi:
- ✅ Config validation
- ✅ Database operations
- ✅ User CRUD
- ✅ Coin transactions
- ✅ Payment codes
- ✅ Referral system
- ✅ Content orders
- ✅ Telegram API

## 🔧 Development

### Yangi handler qo'shish

1. `src/handlers/` da yangi fayl yarating
2. Handler funksiyasini yozing
3. `src/handlers/index.js` ga export qo'shing
4. `src/index.js` da register qiling

### Yangi database table qo'shish

1. Supabase da migration yarating
2. `src/database/` da yangi fayl yarating
3. CRUD funksiyalarini yozing
4. `src/database/index.js` ga export qo'shing

## 📦 Dependencies

- **telegraf** - Telegram Bot framework
- **@supabase/supabase-js** - Database
- **dotenv** - Environment variables

## 🤝 Contributing

1. Fork qiling
2. Feature branch yarating (`git checkout -b feature/amazing`)
3. Commit qiling (`git commit -m 'Add amazing feature'`)
4. Push qiling (`git push origin feature/amazing`)
5. Pull Request oching

## 📄 License

MIT License - [LICENSE](LICENSE) faylini ko'ring.

## 👨‍💻 Muallif

Sizning ismingiz - [@your_telegram](https://t.me/your_telegram)

## 🙏 Minnatdorchilik

- Telegraf.js jamoasi
- Supabase jamoasi
- Open source community

---

**Savol va takliflar uchun:** Issue oching yoki pull request yuboring!