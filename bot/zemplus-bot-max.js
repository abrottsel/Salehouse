'use strict';

const MAX_TOKEN = process.env.MAX_BOT_TOKEN;
const TG_BOT_TOKEN = process.env.TG_BOT_TOKEN;
const ADMIN_CHAT_ID = process.env.TG_CHAT_ID;

const MAX_API = 'https://platform-api.max.ru';
const BOT_USER_ID = 262876217; // ЗемПлюс bot user_id

if (!MAX_TOKEN) { console.error('MAX_BOT_TOKEN is not set'); process.exit(1); }
if (!TG_BOT_TOKEN || !ADMIN_CHAT_ID) { console.error('TG_BOT_TOKEN / TG_CHAT_ID not set'); process.exit(1); }

// ---- MAX API ----
async function maxGet(path) {
  const res = await fetch(`${MAX_API}${path}`, {
    headers: { Authorization: MAX_TOKEN },
  });
  if (!res.ok) throw new Error(`MAX GET ${path}: HTTP ${res.status}`);
  return res.json();
}

async function maxPost(path, body) {
  const res = await fetch(`${MAX_API}${path}`, {
    method: 'POST',
    headers: { Authorization: MAX_TOKEN, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`MAX POST ${path}: HTTP ${res.status}`);
  return res.json();
}

function sendToMax(userId, text) {
  return maxPost('/messages', { recipient: { user_id: userId }, text });
}

// ---- TG admin (one-way POST, no polling — polling handled by zemplus-bot.js) ----
function notifyTgAdmin(text) {
  return fetch(`https://api.telegram.org/bot${TG_BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: ADMIN_CHAT_ID, text, parse_mode: 'HTML' }),
  }).then(r => r.json()).catch(err => console.error('TG notify error:', err.message));
}

// ---- Helpers ----
function timestamp() {
  return new Date().toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' });
}

function senderLabel(sender) {
  const name = sender?.name || 'Неизвестный';
  const un = sender?.username ? ` (@${sender.username})` : '';
  return `${name}${un}`;
}

// ---- Update handler ----
async function handleUpdate(update) {
  if (update.update_type !== 'message_created') return;
  const msg = update.message;
  if (!msg) return;

  const userId = msg.sender?.user_id;
  if (!userId || userId === BOT_USER_ID) return; // skip own messages

  const text = (msg.body?.text || '').trim();
  if (!text) return;

  const label = senderLabel(msg.sender);

  await notifyTgAdmin(
    `📱 <b>Сообщение из МАКС</b>\n\n` +
    `👤 ${label} [MAX_ID: ${userId}]\n` +
    `📅 ${timestamp()}\n\n` +
    `💬 ${text}`,
  );

  await sendToMax(
    userId,
    '✅ Сообщение получено! Менеджер ответит в ближайшее время.\n📞 +7 (985) 905-25-55',
  ).catch(err => console.error('MAX reply error:', err.message));
}

// ---- Long polling loop ----
let marker = null;

async function poll() {
  console.log('MAX bot started, polling...');
  while (true) {
    try {
      const path = marker
        ? `/updates?timeout=25&marker=${marker}`
        : '/updates?timeout=25';
      const data = await maxGet(path);
      for (const update of data.updates || []) {
        await handleUpdate(update);
      }
      if (data.marker != null) marker = data.marker;
    } catch (err) {
      console.error('MAX poll error:', err.message);
      await new Promise(r => setTimeout(r, 5000));
    }
  }
}

poll();
