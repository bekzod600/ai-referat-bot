#!/bin/bash

# AI Referat Bot - Tezkor sozlash scripti

echo "🤖 AI Referat Bot - Yangi struktura yaratilmoqda..."
echo ""

# Backup eski fayllar
echo "📦 Eski fayllar backup qilinmoqda..."
mkdir -p backup
[ -f bot.js ] && cp bot.js backup/
[ -f src/config.js ] && cp src/config.js backup/
[ -f src/db.js ] && cp src/db.js backup/
echo "✅ Backup tayyor: ./backup/"
echo ""

# Eski fayllarni o'chirish
echo "🗑️  Eski fayllar o'chirilmoqda..."
rm -f bot.js index.js test.js
rm -f src/config.js src/db.js
echo "✅ Eski fayllar o'chirildi"
echo ""

# Yangi papkalar yaratish
echo "📁 Yangi papkalar yaratilmoqda..."
mkdir -p src/config
mkdir -p src/database
mkdir -p src/handlers
mkdir -p src/keyboards
mkdir -p src/middlewares
mkdir -p src/utils
mkdir -p src/services
mkdir -p tests/unit
mkdir -p tests/integration
echo "✅ Papkalar tayyor"
echo ""

# Fayllar yaratish (bo'sh)
echo "📄 Fayllar yaratilmoqda..."

# Config
touch src/config/env.js
touch src/config/constants.js
touch src/config/index.js

# Database
touch src/database/client.js
touch src/database/users.js
touch src/database/coins.js
touch src/database/payments.js
touch src/database/referrals.js
touch src/database/orders.js
touch src/database/index.js

# Handlers
touch src/handlers/start.js
touch src/handlers/subscription.js
touch src/handlers/balance.js
touch src/handlers/referral.js
touch src/handlers/purchase.js
touch src/handlers/content.js
touch src/handlers/admin.js
touch src/handlers/back.js
touch src/handlers/index.js

# Keyboards
touch src/keyboards/main.js
touch src/keyboards/inline.js
touch src/keyboards/admin.js
touch src/keyboards/index.js

# Middlewares
touch src/middlewares/session.js
touch src/middlewares/error.js
touch src/middlewares/index.js

# Utils
touch src/utils/messages.js
touch src/utils/helpers.js
touch src/utils/index.js

# Services
touch src/services/ai.js
touch src/services/notifications.js
touch src/services/index.js

# Main
touch src/index.js

# Tests
touch tests/test-bot.js

echo "✅ Fayllar tayyor"
echo ""

# Hisobot
echo "📊 Yaratilgan struktura:"
echo ""
tree -L 3 src/ tests/ || ls -R src/ tests/
echo ""

echo "✅ Struktura tayyor!"
echo ""
echo "📝 Keyingi qadamlar:"
echo "   1. Artifact'lardan kod nusxasini faylarga ko'chiring"
echo "   2. npm install - dependencies o'rnatish"
echo "   3. npm test - testni ishga tushirish"
echo "   4. npm start - botni ishga tushirish"
echo ""
echo "🎉 Tayyor!"