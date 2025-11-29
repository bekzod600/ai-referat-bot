import { BOT_TOKEN, ADMIN_ID, CHANNEL_ID } from './src/config.js';
import { db, getUser, createUser } from './src/db.js';

console.log('✅ Config loaddi:', {
  botTokenSet: !!BOT_TOKEN,
  adminId: ADMIN_ID,
  channelId: CHANNEL_ID
});

const { data, error } = await db.from('users').select('count(*)', { count: 'exact' });
console.log('✅ Database ulanish OK. Users:', data);

console.log('\n✅ Bot tayyor! npm start bilan ishga tushing.');
